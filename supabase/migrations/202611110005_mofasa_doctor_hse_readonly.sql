-- Site doctors may read the HSE section for job-demand context, but cannot modify it.
drop policy if exists mofasa_hse_read_own on public.mofasa_hse_sections;
create policy mofasa_hse_read_own on public.mofasa_hse_sections for select to authenticated
using (exists(select 1 from public.app_users u where u.user_id=(select auth.uid()) and u.role in ('admin','hse_admin','medical_admin')));
