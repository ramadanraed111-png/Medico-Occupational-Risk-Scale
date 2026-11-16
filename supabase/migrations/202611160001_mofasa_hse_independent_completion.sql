-- Make the HSE section's own save/submit permissions explicit and independent.
-- HSE completion must never depend on medical review or medical_status.
-- Medical approval rules remain unchanged.
drop policy if exists mofasa_hse_insert on public.mofasa_hse_sections;
create policy mofasa_hse_insert on public.mofasa_hse_sections
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and status in ('draft','submitted')
  and exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid())
      and u.role in ('admin','hse_admin')
  )
);

drop policy if exists mofasa_hse_update_draft on public.mofasa_hse_sections;
create policy mofasa_hse_update_draft on public.mofasa_hse_sections
for update to authenticated
using (
  status = 'draft'
  and exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid())
      and u.role in ('admin','hse_admin')
  )
)
with check (
  status in ('draft','submitted')
  and updated_by = (select auth.uid())
  and exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid())
      and u.role in ('admin','hse_admin')
  )
);
