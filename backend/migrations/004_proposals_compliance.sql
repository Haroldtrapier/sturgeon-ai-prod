-- Phase 4: Proposals & Compliance Matrix
-- Enables end-to-end GovCon workflow: Opportunity → Requirements → Proposal → Compliance

-- Proposals table
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete cascade,
  title text not null,
  status text default 'draft' check (status in ('draft', 'in_progress', 'ready')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Proposal sections (generated content)
create table if not exists proposal_sections (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references proposals(id) on delete cascade,
  section_name text not null,
  content text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Compliance requirements (SHALL/MUST statements)
create table if not exists compliance_requirements (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references proposals(id) on delete cascade,
  requirement text not null,
  section_ref text,
  status text default 'missing' check (status in ('missing', 'partial', 'addressed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists idx_proposals_user_id on proposals(user_id);
create index if not exists idx_proposals_opportunity_id on proposals(opportunity_id);
create index if not exists idx_proposal_sections_proposal_id on proposal_sections(proposal_id);
create index if not exists idx_compliance_requirements_proposal_id on compliance_requirements(proposal_id);
create index if not exists idx_compliance_requirements_status on compliance_requirements(status);

-- RLS Policies
alter table proposals enable row level security;
alter table proposal_sections enable row level security;
alter table compliance_requirements enable row level security;

-- Proposals: Users can only see their own proposals
create policy "Users can view own proposals"
  on proposals for select
  using (auth.uid() = user_id);

create policy "Users can insert own proposals"
  on proposals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own proposals"
  on proposals for update
  using (auth.uid() = user_id);

create policy "Users can delete own proposals"
  on proposals for delete
  using (auth.uid() = user_id);

-- Proposal sections: Access through parent proposal
create policy "Users can view proposal sections"
  on proposal_sections for select
  using (
    exists (
      select 1 from proposals
      where proposals.id = proposal_sections.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

create policy "Users can insert proposal sections"
  on proposal_sections for insert
  with check (
    exists (
      select 1 from proposals
      where proposals.id = proposal_sections.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

create policy "Users can update proposal sections"
  on proposal_sections for update
  using (
    exists (
      select 1 from proposals
      where proposals.id = proposal_sections.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

create policy "Users can delete proposal sections"
  on proposal_sections for delete
  using (
    exists (
      select 1 from proposals
      where proposals.id = proposal_sections.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

-- Compliance requirements: Access through parent proposal
create policy "Users can view compliance requirements"
  on compliance_requirements for select
  using (
    exists (
      select 1 from proposals
      where proposals.id = compliance_requirements.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

create policy "Users can insert compliance requirements"
  on compliance_requirements for insert
  with check (
    exists (
      select 1 from proposals
      where proposals.id = compliance_requirements.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

create policy "Users can update compliance requirements"
  on compliance_requirements for update
  using (
    exists (
      select 1 from proposals
      where proposals.id = compliance_requirements.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

create policy "Users can delete compliance requirements"
  on compliance_requirements for delete
  using (
    exists (
      select 1 from proposals
      where proposals.id = compliance_requirements.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

-- Updated at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_proposals_updated_at
  before update on proposals
  for each row
  execute function update_updated_at_column();

create trigger update_proposal_sections_updated_at
  before update on proposal_sections
  for each row
  execute function update_updated_at_column();

create trigger update_compliance_requirements_updated_at
  before update on compliance_requirements
  for each row
  execute function update_updated_at_column();