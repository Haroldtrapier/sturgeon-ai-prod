-- Phase 8: Operations + Job Queue Infrastructure

-- Job runs table (observability for all background jobs)
create table if not exists job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  status text not null check (status in ('queued', 'running', 'success', 'failed')),
  attempts int default 0,
  last_error text,
  started_at timestamp,
  finished_at timestamp,
  created_at timestamp default now()
);

-- Job events table (detailed logging for each job run)
create table if not exists job_events (
  id uuid primary key default gen_random_uuid(),
  job_run_id uuid references job_runs(id) on delete cascade,
  level text not null check (level in ('info', 'warn', 'error')),
  message text not null,
  meta jsonb,
  created_at timestamp default now()
);

-- User profiles for onboarding + activation
create table if not exists user_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  naics text[],
  keywords text[],
  onboarding_completed boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Indexes for performance
create index if not exists idx_job_runs_status on job_runs(status);
create index if not exists idx_job_runs_created on job_runs(created_at desc);
create index if not exists idx_job_events_job_run_id on job_events(job_run_id);
create index if not exists idx_job_events_level on job_events(level);
create index if not exists idx_user_profiles_onboarding on user_profiles(onboarding_completed);

-- RLS policies
alter table job_runs enable row level security;
alter table job_events enable row level security;
alter table user_profiles enable row level security;

-- Job runs: Admin only (for ops dashboard)
create policy "Admins can view job runs"
  on job_runs for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Job events: Admin only
create policy "Admins can view job events"
  on job_events for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- User profiles: Users can view/edit their own
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = user_id);

-- Updated at trigger for user_profiles
create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row
  execute function update_updated_at_column();
