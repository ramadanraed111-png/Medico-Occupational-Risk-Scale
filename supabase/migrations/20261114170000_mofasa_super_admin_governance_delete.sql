-- Super Admin governance: no direct editing of HSE or medical sections.
-- Full deletion is a single, narrowly-scoped privileged operation.
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
