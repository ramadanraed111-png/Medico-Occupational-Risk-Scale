-- Create a MOFASA parent record and its HSE intake section atomically.
-- HSE-only creation. MCM and clinical data remain in the physician-owned section.
create or replace function public.mofasa_create_assessment_with_hse(
  p_assessment jsonb,
  p_section_data jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null
     or not exists (
       select 1 from public.app_users u
       where u.user_id = (select auth.uid())
         and u.role = 'hse_admin'
     ) then
    raise exception 'Only HSE Admin may create a MOFASA assessment';
  end if;

  if coalesce(btrim(p_assessment->>'worker_name'),'') = ''
     or coalesce(btrim(p_assessment->>'registration_number'),'') = ''
     or coalesce(btrim(p_assessment->>'job_title'),'') = ''
     or coalesce(btrim(p_assessment->>'task_name'),'') = ''
     or coalesce(btrim(p_assessment->>'assessment_date'),'') = ''
     or coalesce(btrim(p_assessment->>'site'),'') = '' then
    raise exception 'Required worker, job, task, date, and site fields are missing';
  end if;

  insert into public.mofasa_assessments (
    worker_name, registration_number, job_title, task_name,
    assessment_date, site, shift_duration, created_by
  ) values (
    btrim(p_assessment->>'worker_name'),
    btrim(p_assessment->>'registration_number'),
    btrim(p_assessment->>'job_title'),
    btrim(p_assessment->>'task_name'),
    (p_assessment->>'assessment_date')::date,
    btrim(p_assessment->>'site'),
    nullif(btrim(p_assessment->>'shift_duration'),''),
    (select auth.uid())
  )
  returning id into v_id;

  insert into public.mofasa_hse_sections (
    assessment_id, section_data, status, created_by, updated_by
  ) values (
    v_id, coalesce(p_section_data,'{}'::jsonb), 'draft',
    (select auth.uid()), (select auth.uid())
  );

  return v_id;
end;
$$;

revoke all on function public.mofasa_create_assessment_with_hse(jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.mofasa_create_assessment_with_hse(jsonb,jsonb) to authenticated;
