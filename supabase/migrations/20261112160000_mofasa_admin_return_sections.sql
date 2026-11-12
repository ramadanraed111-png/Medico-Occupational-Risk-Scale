-- Allow only the Super Admin to reopen submitted sections for role-based completion.
-- The existing audit triggers record the status transition and update the parent assessment status.

create policy "mofasa_hse_admin_reopen_submitted"
on public.mofasa_hse_sections
for update
to authenticated
using (
  status = 'submitted'
  and exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid()) and u.role = 'admin'
  )
  and exists (
    select 1 from public.mofasa_assessments a
    where a.id = mofasa_hse_sections.assessment_id and a.archived_at is null
  )
)
with check (
  status = 'draft'
  and updated_by = (select auth.uid())
  and exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid()) and u.role = 'admin'
  )
  and exists (
    select 1 from public.mofasa_assessments a
    where a.id = mofasa_hse_sections.assessment_id and a.archived_at is null
  )
);

create policy "mofasa_medical_admin_reopen_submitted"
on public.mofasa_medical_sections
for update
to authenticated
using (
  status = 'submitted'
  and exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid()) and u.role = 'admin'
  )
  and exists (
    select 1 from public.mofasa_assessments a
    where a.id = mofasa_medical_sections.assessment_id and a.archived_at is null
  )
)
with check (
  status = 'draft'
  and final_decision is null
  and updated_by = (select auth.uid())
  and exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid()) and u.role = 'admin'
  )
  and exists (
    select 1 from public.mofasa_assessments a
    where a.id = mofasa_medical_sections.assessment_id and a.archived_at is null
  )
);
