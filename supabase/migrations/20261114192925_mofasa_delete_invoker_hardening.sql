-- Harden full MOFASA deletion with invoker rights and admin-only RLS.
-- The RPC runs as the caller; table policies enforce Super Admin-only deletion.
grant delete on public.mofasa_assessments, public.mofasa_hse_sections,
  public.mofasa_medical_sections, public.mofasa_audit_log to authenticated;

drop policy if exists mofasa_assessments_delete_super_admin on public.mofasa_assessments;
create policy mofasa_assessments_delete_super_admin on public.mofasa_assessments
for delete to authenticated
using (exists (select 1 from public.app_users u where u.user_id = (select auth.uid()) and u.role = 'admin'));

drop policy if exists mofasa_hse_delete_super_admin on public.mofasa_hse_sections;
create policy mofasa_hse_delete_super_admin on public.mofasa_hse_sections
for delete to authenticated
using (exists (select 1 from public.app_users u where u.user_id = (select auth.uid()) and u.role = 'admin'));

drop policy if exists mofasa_medical_delete_super_admin on public.mofasa_medical_sections;
create policy mofasa_medical_delete_super_admin on public.mofasa_medical_sections
for delete to authenticated
using (exists (select 1 from public.app_users u where u.user_id = (select auth.uid()) and u.role = 'admin'));

drop policy if exists mofasa_audit_delete_super_admin on public.mofasa_audit_log;
create policy mofasa_audit_delete_super_admin on public.mofasa_audit_log
for delete to authenticated
using ((select auth.uid()) = '47253008-c899-43c9-93b3-b91ac27e1d31'::uuid
  and exists (select 1 from public.app_users u where u.user_id = (select auth.uid()) and u.role = 'admin'));

create or replace function public.mofasa_delete_assessment(p_assessment_id uuid)
returns void
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is null
     or not exists (select 1 from public.app_users u where u.user_id = auth.uid() and u.role = 'admin') then
    raise exception 'Only the Super Admin may permanently delete a MOFASA assessment';
  end if;
  if not exists (select 1 from public.mofasa_assessments a where a.id = p_assessment_id) then
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
