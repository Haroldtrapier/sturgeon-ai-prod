-- Create opportunities table for storing imported opportunities
create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null, -- sam, govwin, fpds, unison, etc
  source_url text,
  title text,
  agency text,
  solicitation_id text,
  due_date timestamptz,
  raw_text text,
  parsed_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster queries by user
create index if not exists opportunities_user_id_idx on opportunities(user_id);

-- Create index for filtering by source
create index if not exists opportunities_source_idx on opportunities(source);

-- Create index for due date sorting
create index if not exists opportunities_due_date_idx on opportunities(due_date);

-- Enable Row Level Security
alter table opportunities enable row level security;

-- Policy: Users can only see their own opportunities
create policy "Users can view own opportunities"
  on opportunities for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own opportunities
create policy "Users can insert own opportunities"
  on opportunities for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own opportunities
create policy "Users can update own opportunities"
  on opportunities for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own opportunities
create policy "Users can delete own opportunities"
  on opportunities for delete
  using (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to call the function
create trigger update_opportunities_updated_at
  before update on opportunities
  for each row
  execute function update_updated_at_column();
