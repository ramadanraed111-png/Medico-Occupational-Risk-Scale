-- Final medical fitness approval is reserved to the Medical Admin role.
drop policy if exists mofasa_medical_insert on public.mofasa_medical_sections;
create policy mofasa_medical_insert on public.mofasa_medical_sections for insert to authenticated
with check (
 created_by=(select auth.uid()) and updated_by=(select auth.uid())
 and (
   exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role='medical_admin')
   or (status='draft' and final_decision is null and exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role='admin'))
 )
 and (status='draft' or (status='submitted' and final_decision is not null and exists(select 1 from public.mofasa_assessments a where a.id=assessment_id and a.hse_status='submitted')))
);
drop policy if exists mofasa_medical_update_draft on public.mofasa_medical_sections;
create policy mofasa_medical_update_draft on public.mofasa_medical_sections for update to authenticated
using (status='draft' and exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','medical_admin')))
with check (
 status in ('draft','submitted') and updated_by=(select auth.uid())
 and (
   exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role='medical_admin')
   or (status='draft' and final_decision is null and exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role='admin'))
 )
 and (status='draft' or (status='submitted' and final_decision is not null and exists(select 1 from public.mofasa_assessments a where a.id=assessment_id and a.hse_status='submitted')))
);
