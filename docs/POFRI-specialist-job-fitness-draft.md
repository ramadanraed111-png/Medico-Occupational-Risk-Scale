# POFRI Specialist Job Fitness Assessment — Draft 0.1

## Purpose
A separate workflow evaluates an individual against one defined job profile and actual site conditions. It is distinct from the general task screening form.

## Initial profile
The first preconfigured demonstration profile is **Control Room Operator**:
- Essential job tasks: continuous process monitoring, alarm management, emergency response duties, rapid decision making, high concentration, extended screen work, night shifts.
- Suggested JEM hazards are loaded from the existing hazard library and must be individually rated by HSE.
- Initial job-demand defaults: prolonged sitting, shift work, operating process equipment, safety-critical decisions.
- Initial essential fitness checklist: normal consciousness, no uncontrolled epilepsy, adequate mobility, normal balance, adequate hearing, adequate vision, cardiovascular fitness.
- Conditional checks (ladder climbing and respirator use) are shown but are not mandatory unless the actual role/site requires them.

This profile is a prototype and must be reviewed by occupational physicians and HSE before it is used as a formal job standard.

## Assessment sections
1. Worker, job and site identity.
2. Essential job tasks.
3. Occupational hazards: four levels each for severity, exposure frequency, and control measures.
4. Safety-critical duties.
5. Job demands.
6. Site category and emergency readiness.
7. Clinical examination, laboratory/imaging and additional investigations.
8. Existing multi-condition medical matrix.
9. Physical, cognitive and psychological functional capacity.
10. Job-specific fitness essentials and physician opinion.

## Provisional decision logic
The module intentionally uses **non-compensatory gates**, not a weighted average:
- **Meets job requirements** only when required identity and assessment fields are complete, job tasks and demands are defined, each listed hazard is assessed, site/emergency readiness is documented, the basic clinical examination is completed, all required fitness essentials are confirmed, all functional capacity items are Good, all explicitly required additional investigations have results, and the physician records a compatible opinion.
- **Requires specialist review / further investigations** when information is missing, any essential item is not confirmed, a functional capacity item is impaired or not assessed, a required investigation is incomplete, a Level 4 medical condition is recorded, or a severe hazard lacks verified effective controls.
- **Does not meet requirements for this job** only when the physician explicitly records that the worker is incompatible with the requirements of the selected job.

The system does not convert lab values into diagnoses, does not infer fitness from a disease name, and does not use a numerical cut-off. A failed essential requirement cannot be offset by a good score elsewhere.

## Storage and compatibility
The assessment is saved in the existing `pofri_assessments` table using its JSONB fields and a distinct `assessment_type` / `algorithm_version`. No MORS archive tables, legacy user accounts, or legacy assessment rows are changed. No database migration is required for this draft.

## Important limitations / committee decisions still required
- Review and approve every job profile, essential task, hazard, demand and fitness essential.
- Agree the formal interpretation of an impaired functional capacity and the clinical criteria for an incompatible opinion.
- Define job-specific mandatory investigations and reference ranges under approved clinical protocols; the app only records values.
- Add dedicated HSE and occupational-physician user roles and enforce section-level authorization before operational deployment. Current authentication roles remain the existing admin/data_entry roles.
- Complete privacy, audit, validation and usability testing.
- Do not use this draft for employment, deployment, restriction or medical clearance decisions before formal institutional approval and validation.
