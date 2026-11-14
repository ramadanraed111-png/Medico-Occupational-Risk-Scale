-- Allow HSE and physician sections to be completed and submitted independently.
-- Preserve the live role restrictions and physician-only final approval.
drop policy if exists mofasa_medical_insert on public.mofasa_medical_sections;
create policy mofasa_medical_insert on public.mofasa_medical_sections
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid()) and u.role = 'medical_admin'
  )
  and (
    status = 'draft'
    or (status = 'submitted' and final_decision is not null)
  )
);

drop policy if exists mofasa_medical_update_draft on public.mofasa_medical_sections;
create policy mofasa_medical_update_draft on public.mofasa_medical_sections
for update to authenticated
using (
  status = 'draft'
  and exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid()) and u.role = 'medical_admin'
  )
)
with check (
  status in ('draft','submitted')
  and updated_by = (select auth.uid())
  and exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid()) and u.role = 'medical_admin'
  )
  and (
    status = 'draft'
    or (status = 'submitted' and final_decision is not null)
  )
);
