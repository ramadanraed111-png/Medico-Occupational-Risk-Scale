-- Super Admin governance: no direct editing of HSE or medical sections.
-- Full deletion is a single, narrowly-scoped privileged operation.
-- Section editing is reserved to the specialist role; Super Admin retains read/review and reopen rights.
drop policy if exists mofasa_assessments_create_hse on public.mofasa_assessments;
create policy mofasa_assessments_create_hse on public.mofasa_assessments for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (select 1 from public.app_users u where u.user_id = (select auth.uid()) and u.role = 'hse_admin')
);

drop policy if exists mofasa_hse_insert on public.mofasa_hse_sections;
create policy mofasa_hse_insert on public.mofasa_hse_sections for insert to authenticated
with check (
  created_by = (select auth.uid()) and updated_by = (select auth.uid())
  and status in ('draft','submitted')
  and exists (select 1 from public.app_users u where u.user_id = (select auth.uid()) and u.role = 'hse_admin')
);
drop policy if exists mofasa_hse_update_draft on public.mofasa_hse_sections;
create policy mofasa_hse_update_draft on public.mofasa_hse_sections for update to authenticated
using (status = 'draft' and exists (select 1 from public.app_users u where u.user_id = (select auth.uid()) and u.role = 'hse_admin'))
with check (status in ('draft','submitted') and updated_by = (select auth.uid())
  and exists (select 1 from public.app_users u where u.user_id = (select auth.uid()) and u.role = 'hse_admin'));

drop policy if exists mofasa_medical_insert on public.mofasa_medical_sections;
create policy mofasa_medical_insert on public.mofasa_medical_sections for insert to authenticated
with check (
  created_by = (select auth.uid()) and updated_by = (select auth.uid())
  and exists (select 1 from public.app_users u where u.user_id = (select auth.uid()) and u.role = 'medical_admin')
  and (status = 'draft' or (status = 'submitted' and final_decision is not null and exists (select 1 from public.mofasa_assessments a where a.id = assessment_id and a.hse_status = 'submitted')))
);
drop policy if exists mofasa_medical_update_draft on public.mofasa_medical_sections;
create policy mofasa_medical_update_draft on public.mofasa_medical_sections for update to authenticated
using (status = 'draft' and exists (select 1 from public.app_users u where u.user_id = (select auth.uid()) and u.role = 'medical_admin'))
with check (
  status in ('draft','submitted') and updated_by = (select auth.uid())
  and exists (select 1 from public.app_users u where u.user_id = (select auth.uid()) and u.role = 'medical_admin')
  and (status = 'draft' or (final_decision is not null and exists (select 1 from public.mofasa_assessments a where a.id = assessment_id and a.hse_status = 'submitted')))
);
create or replace function public.mofasa_delete_assessment(p_assessment_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is null
     or not exists (
       select 1
       from public.app_users u
       where u.user_id = auth.uid()
         and u.role = 'admin'
     ) then
    raise exception 'Only the Super Admin may permanently delete a MOFASA assessment';
  end if;

  if not exists (
    select 1 from public.mofasa_assessments a where a.id = p_assessment_id
  ) then
    raise exception 'MOFASA assessment not found';
  end if;

  delete from public.mofasa_hse_sections where assessment_id = p_assessment_id;
  delete from public.mofasa_medical_sections where assessment_id = p_assessment_id;
  delete from public.mofasa_audit_log where assessment_id = p_assessment_id;
  delete from public.mofasa_assessments where id = p_assessment_id;
end;
$$;

revoke all on function public.mofasa_delete_assessment(uuid) from public, anon, authenticated;
grant execute on function public.mofasa_delete_assessment(uuid) to authenticated;
