-- Phase 4.6: Proposal Human Review Table
create table if not exists proposal_reviews (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references proposals(id) on delete cascade,
  reviewer_email text,
  status text default 'requested' check (status in ('requested', 'in_review', 'completed')),
  notes text,
  created_at timestamp default now()
);

-- Phase 4.7: Teams & Roles
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamp default now()
);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('admin','writer','reviewer','viewer')),
  created_at timestamp default now()
);

alter table proposals add column if not exists team_id uuid references teams(id);

-- Audit Logs
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  action text,
  entity text,
  entity_id uuid,
  created_at timestamp default now()
);
