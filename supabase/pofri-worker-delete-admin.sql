-- Allow users with the admin role to delete POFRI worker profiles.
-- This does not delete assessment snapshots, MORS legacy records, or Auth users.
drop policy if exists pofri_workers_delete_admin on public.pofri_workers;
create policy pofri_workers_delete_admin
on public.pofri_workers
for delete
to authenticated
using (
  exists (
    select 1 from public.app_users u
    where u.user_id = (select auth.uid())
      and u.role = 'admin'
  )
);
grant delete on table public.pofri_workers to authenticated;
