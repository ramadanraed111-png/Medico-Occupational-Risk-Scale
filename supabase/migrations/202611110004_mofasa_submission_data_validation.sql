-- Enforce minimum required section content at the database layer.
do $$
begin
 if not exists(select 1 from pg_constraint where conname='mofasa_hse_submission_complete') then
  alter table public.mofasa_hse_sections add constraint mofasa_hse_submission_complete
  check (status <> 'submitted' or (
    length(btrim(coalesce(section_data->>'tasks',''))) > 0
    and length(btrim(coalesce(section_data->>'hazards',''))) > 0
    and length(btrim(coalesce(section_data->>'emergency',''))) > 0
  ));
 end if;
 if not exists(select 1 from pg_constraint where conname='mofasa_medical_submission_complete') then
  alter table public.mofasa_medical_sections add constraint mofasa_medical_submission_complete
  check (status <> 'submitted' or (
    final_decision is not null
    and length(btrim(coalesce(section_data->>'exam',''))) > 0
    and length(btrim(coalesce(section_data->>'capacity',''))) > 0
  ));
 end if;
end $$;
