-- Submission Readiness Checklist
create table if not exists submission_checklists (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references proposals(id) on delete cascade,
  item text not null,
  completed boolean default false,
  created_at timestamp default now()
);
-- Team access policy example
create policy if not exists "team_access"
  on proposals for select
  using (
    team_id in (
      select team_id from team_members where user_id = auth.uid()
    )
  );
-- Retention & legal hold (for compliance)
alter table proposals add column if not exists retention_until date;
alter table proposals add column if not exists legal_hold boolean default false;
