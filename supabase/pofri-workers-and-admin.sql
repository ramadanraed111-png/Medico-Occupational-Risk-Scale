-- POFRI worker profiles and controlled assessment deletion.
-- Does not alter MORS tables, legacy records, or Auth users.
create table if not exists public.pofri_workers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  registration_number text not null,
  date_of_birth date not null,
  sector text,
  job_title text,
  site text,
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pofri_workers_registration_number_key unique (registration_number),
  constraint pofri_workers_dob_not_future check (date_of_birth <= current_date)
);

create index if not exists pofri_workers_name_idx on public.pofri_workers (full_name);
create index if not exists pofri_workers_registration_idx on public.pofri_workers (registration_number);

alter table public.pofri_workers enable row level security;

drop policy if exists pofri_workers_read on public.pofri_workers;
create policy pofri_workers_read on public.pofri_workers
for select to authenticated
using (exists (
  select 1 from public.app_users u
  where u.user_id = (select auth.uid())
    and u.role in ('admin','data_entry')
));

drop policy if exists pofri_workers_insert on public.pofri_workers;
create policy pofri_workers_insert on public.pofri_workers
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid())
      and u.role in ('admin','data_entry')
  )
);

drop policy if exists pofri_workers_update on public.pofri_workers;
create policy pofri_workers_update on public.pofri_workers
for update to authenticated
using (exists (
  select 1 from public.app_users u
  where u.user_id = (select auth.uid())
    and u.role in ('admin','data_entry')
))
with check (exists (
  select 1 from public.app_users u
  where u.user_id = (select auth.uid())
    and u.role in ('admin','data_entry')
));

drop policy if exists pofri_assessment_delete_super_admin on public.pofri_assessments;
create policy pofri_assessment_delete_super_admin on public.pofri_assessments
for delete to authenticated
using (
  (select auth.uid()) = '47253008-c899-43c9-93b3-b91ac27e1d31'::uuid
  and exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid()) and u.role = 'admin'
  )
);
