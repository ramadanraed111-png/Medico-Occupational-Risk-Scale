-- Super Admin may return submitted sections through a narrow RPC, but cannot directly edit section rows.
drop policy if exists "mofasa_hse_admin_reopen_submitted" on public.mofasa_hse_sections;
drop policy if exists "mofasa_medical_admin_reopen_submitted" on public.mofasa_medical_sections;

create or replace function private.mofasa_return_section(
  p_assessment_id uuid,
  p_section text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_now timestamptz := now();
  v_reason text := coalesce(nullif(btrim(p_reason), ''), 'يرجى مراجعة البيانات واستكمال النواقص');
  v_count integer;
begin
  if auth.uid() is null
     or not exists (select 1 from public.app_users u where u.user_id = auth.uid() and u.role = 'admin') then
    raise exception 'Only the Super Admin may return MOFASA sections';
  end if;
  if p_section not in ('hse','medical') then
    raise exception 'Invalid MOFASA section';
  end if;
  if exists (select 1 from public.mofasa_assessments a where a.id=p_assessment_id and a.archived_at is not null) then
    raise exception 'Archived assessments cannot be returned';
  end if;

  if p_section = 'hse' then
    update public.mofasa_hse_sections
    set section_data = jsonb_set(
          coalesce(section_data,'{}'::jsonb),
          '{_meta}',
          coalesce(section_data->'_meta','{}'::jsonb) || jsonb_build_object(
            'admin_returned_at',v_now,
            'admin_returned_by',auth.uid(),
            'admin_returned_by_email',coalesce((select email from auth.users where id=auth.uid()),''),
            'admin_return_reason',v_reason,
            'return_target','hse_admin'
          ),
          true
        ),
        status='draft', submitted_at=null, updated_by=auth.uid()
    where assessment_id=p_assessment_id and status='submitted';
    get diagnostics v_count = row_count;
    if v_count <> 1 then raise exception 'HSE section is not submitted or does not exist'; end if;

    -- Reopening HSE invalidates the previous medical approval and returns it to the physician.
    update public.mofasa_medical_sections
    set section_data = jsonb_set(
          coalesce(section_data,'{}'::jsonb),
          '{_meta}',
          coalesce(section_data->'_meta','{}'::jsonb) || jsonb_build_object(
            'admin_returned_at',v_now,
            'admin_returned_by',auth.uid(),
            'admin_returned_by_email',coalesce((select email from auth.users where id=auth.uid()),''),
            'admin_return_reason','أعيد قسم السلامة للمراجعة؛ يلزم إعادة مراجعة واعتماد الرأي الطبي بعد استكماله.',
            'return_target','medical_admin'
          ),
          true
        ),
        status='draft', submitted_at=null, final_decision=null, updated_by=auth.uid()
    where assessment_id=p_assessment_id and status='submitted';
  else
    update public.mofasa_medical_sections
    set section_data = jsonb_set(
          coalesce(section_data,'{}'::jsonb),
          '{_meta}',
          coalesce(section_data->'_meta','{}'::jsonb) || jsonb_build_object(
            'admin_returned_at',v_now,
            'admin_returned_by',auth.uid(),
            'admin_returned_by_email',coalesce((select email from auth.users where id=auth.uid()),''),
            'admin_return_reason',v_reason,
            'return_target','medical_admin'
          ),
          true
        ),
        status='draft', submitted_at=null, final_decision=null, updated_by=auth.uid()
    where assessment_id=p_assessment_id and status='submitted';
    get diagnostics v_count = row_count;
    if v_count <> 1 then raise exception 'Medical section is not submitted or does not exist'; end if;
  end if;
end;
$$;
revoke all on function private.mofasa_return_section(uuid,text,text) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.mofasa_return_section(uuid,text,text) to authenticated;

create or replace function public.mofasa_return_section(
  p_assessment_id uuid,
  p_section text,
  p_reason text
)
returns void
language sql
security invoker
set search_path = pg_catalog, public, private
as $$
  select private.mofasa_return_section(p_assessment_id,p_section,p_reason);
$$;
revoke all on function public.mofasa_return_section(uuid,text,text) from public, anon, authenticated;
grant execute on function public.mofasa_return_section(uuid,text,text) to authenticated;
