-- POFRI schema v0.1 (DRAFT)
-- Creates a NEW table only. Does not alter or delete MORS tables, users, or Auth accounts.
create table if not exists public.pofri_assessments (
  id uuid primary key default gen_random_uuid(),
  employee_name text not null,
  registration_number text not null,
  job_title text not null,
  task_name text not null,
  assessment_date date not null,
  site text not null,
  evaluator_name text not null,
  duration text,
  job_task jsonb not null default '{}'::jsonb,
  exposures jsonb not null default '{}'::jsonb,
  task_risk jsonb not null default '{}'::jsonb,
  medical jsonb not null default '{}'::jsonb,
  location_emergency jsonb not null default '{}'::jsonb,
  decision jsonb not null default '{}'::jsonb,
  algorithm_version text not null default 'POFRI-0.1-DRAFT',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists pofri_assessments_date_idx
  on public.pofri_assessments (assessment_date desc);
create index if not exists pofri_assessments_registration_idx
  on public.pofri_assessments (registration_number);
create index if not exists pofri_assessments_created_by_idx
  on public.pofri_assessments (created_by);

alter table public.pofri_assessments enable row level security;

-- Authenticated app users may create records only for themselves.
drop policy if exists "pofri_insert_own" on public.pofri_assessments;
create policy "pofri_insert_own"
on public.pofri_assessments for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.app_users u
    where u.user_id = auth.uid()
  )
);

-- Only users with the admin role can read POFRI records.
drop policy if exists "pofri_admin_read" on public.pofri_assessments;
create policy "pofri_admin_read"
on public.pofri_assessments for select to authenticated
using (
  exists (
    select 1 from public.app_users u
    where u.user_id = auth.uid()
      and u.role = 'admin'
  )
);

-- No update/delete policy is intentionally provided in this prototype.
