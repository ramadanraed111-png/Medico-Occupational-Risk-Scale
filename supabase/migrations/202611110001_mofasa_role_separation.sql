-- MOFASA role separation and shared assessment workflow.
-- Preserves all existing MORS/POFRI tables, records and Auth accounts.
create table if not exists public.mofasa_assessments (
  id uuid primary key default gen_random_uuid(),
  worker_name text not null,
  registration_number text not null,
  job_title text not null,
  task_name text not null,
  assessment_date date not null,
  site text not null,
  shift_duration text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  hse_status text not null default 'pending' check (hse_status in ('pending','draft','submitted')),
  medical_status text not null default 'pending' check (medical_status in ('pending','draft','submitted'))
);
create index if not exists mofasa_assessments_date_idx on public.mofasa_assessments(assessment_date desc);
create index if not exists mofasa_assessments_reg_idx on public.mofasa_assessments(registration_number);

create table if not exists public.mofasa_hse_sections (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.mofasa_assessments(id) on delete restrict,
  section_data jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','submitted')),
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);
create table if not exists public.mofasa_medical_sections (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.mofasa_assessments(id) on delete restrict,
  section_data jsonb not null default '{}'::jsonb,
  final_decision text check (final_decision is null or final_decision in ('fit','fit_with_restrictions','temporarily_unfit','unfit','specialist_review')),
  status text not null default 'draft' check (status in ('draft','submitted')),
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);
create table if not exists public.mofasa_audit_log (
  id bigint generated always as identity primary key,
  assessment_id uuid not null references public.mofasa_assessments(id) on delete restrict,
  section_name text not null check (section_name in ('hse','medical')),
  action text not null check (action in ('insert','update')),
  actor_id uuid references auth.users(id),
  changed_at timestamptz not null default now(),
  old_status text,
  new_status text
);
create index if not exists mofasa_audit_assessment_idx on public.mofasa_audit_log(assessment_id,changed_at desc);

alter table public.mofasa_assessments enable row level security;
alter table public.mofasa_hse_sections enable row level security;
alter table public.mofasa_medical_sections enable row level security;
alter table public.mofasa_audit_log enable row level security;

grant select, insert on public.mofasa_assessments to authenticated;
grant select, insert, update on public.mofasa_hse_sections to authenticated;
grant select, insert, update on public.mofasa_medical_sections to authenticated;
grant select on public.mofasa_audit_log to authenticated;
grant usage, select on sequence public.mofasa_audit_log_id_seq to authenticated;

drop policy if exists mofasa_assessments_read on public.mofasa_assessments;
create policy mofasa_assessments_read on public.mofasa_assessments for select to authenticated
using (exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','hse_admin','medical_admin')));
drop policy if exists mofasa_assessments_create_hse on public.mofasa_assessments;
create policy mofasa_assessments_create_hse on public.mofasa_assessments for insert to authenticated
with check (created_by=(select auth.uid()) and exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','hse_admin')));

drop policy if exists mofasa_hse_read_own on public.mofasa_hse_sections;
create policy mofasa_hse_read_own on public.mofasa_hse_sections for select to authenticated
using (exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','hse_admin')));
drop policy if exists mofasa_hse_insert on public.mofasa_hse_sections;
create policy mofasa_hse_insert on public.mofasa_hse_sections for insert to authenticated
with check (created_by=(select auth.uid()) and updated_by=(select auth.uid()) and status in ('draft','submitted') and exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','hse_admin')));
drop policy if exists mofasa_hse_update_draft on public.mofasa_hse_sections;
create policy mofasa_hse_update_draft on public.mofasa_hse_sections for update to authenticated
using (status='draft' and exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','hse_admin')))
with check (status in ('draft','submitted') and updated_by=(select auth.uid()) and exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','hse_admin')));

drop policy if exists mofasa_medical_read_own on public.mofasa_medical_sections;
create policy mofasa_medical_read_own on public.mofasa_medical_sections for select to authenticated
using (exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','medical_admin')));
drop policy if exists mofasa_medical_insert on public.mofasa_medical_sections;
create policy mofasa_medical_insert on public.mofasa_medical_sections for insert to authenticated
with check (
 created_by=(select auth.uid()) and updated_by=(select auth.uid())
 and exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','medical_admin'))
 and (status='draft' or (status='submitted' and final_decision is not null and exists(select 1 from public.mofasa_assessments a where a.id=assessment_id and a.hse_status='submitted')))
);
drop policy if exists mofasa_medical_update_draft on public.mofasa_medical_sections;
create policy mofasa_medical_update_draft on public.mofasa_medical_sections for update to authenticated
using (status='draft' and exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','medical_admin')))
with check (
 status in ('draft','submitted') and updated_by=(select auth.uid())
 and exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','medical_admin'))
 and (status='draft' or (final_decision is not null and exists(select 1 from public.mofasa_assessments a where a.id=assessment_id and a.hse_status='submitted')))
);
drop policy if exists mofasa_audit_super_admin_read on public.mofasa_audit_log;
create policy mofasa_audit_super_admin_read on public.mofasa_audit_log for select to authenticated
using ((select auth.uid())='47253008-c899-43c9-93b3-b91ac27e1d31'::uuid and exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role='admin'));

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create or replace function private.mofasa_section_audit()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_assessment uuid;
  v_old text;
  v_new text;
  v_section text := TG_ARGV[0];
begin
  v_assessment := NEW.assessment_id;
  v_new := NEW.status;
  if TG_OP = 'UPDATE' then v_old := OLD.status; end if;
  insert into public.mofasa_audit_log(assessment_id,section_name,action,actor_id,old_status,new_status)
  values(v_assessment,v_section,lower(TG_OP),(select auth.uid()),v_old,v_new);
  if v_section='hse' then
    update public.mofasa_assessments set hse_status=v_new where id=v_assessment;
  else
    update public.mofasa_assessments set medical_status=v_new where id=v_assessment;
  end if;
  if TG_OP='INSERT' and NEW.status='submitted' then NEW.submitted_at=now(); end if;
  if TG_OP='UPDATE' then
    NEW.updated_at=now();
    if NEW.status='submitted' then NEW.submitted_at=coalesce(NEW.submitted_at,now()); end if;
  end if;
  return NEW;
end;
$$;
revoke all on function private.mofasa_section_audit() from public, anon, authenticated;

drop trigger if exists mofasa_hse_audit on public.mofasa_hse_sections;
create trigger mofasa_hse_audit before insert or update on public.mofasa_hse_sections
for each row execute function private.mofasa_section_audit('hse');
drop trigger if exists mofasa_medical_audit on public.mofasa_medical_sections;
create trigger mofasa_medical_audit before insert or update on public.mofasa_medical_sections
for each row execute function private.mofasa_section_audit('medical');

-- Existing accounts are retained; only the explicitly selected second admin role is narrowed.
update public.app_users
set role='medical_admin'
where user_id='214b04bc-4efc-4cd8-a1ca-abf2100250b4'::uuid
  and lower(email)='ofmd2026@gmail.com'
  and role='admin';

-- HSE/medical roles may read worker directory but cannot edit worker profiles.
drop policy if exists pofri_workers_read on public.pofri_workers;
create policy pofri_workers_read on public.pofri_workers for select to authenticated
using (exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','data_entry','hse_admin','medical_admin')));
