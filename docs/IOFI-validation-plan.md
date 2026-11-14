# IOFI validation and committee plan – Draft 0.1

## Phase 1 – content and face validity
Occupational physicians, industrial hygienists, HSE, operations, emergency response, HR/legal and information security review job families, task profiles, exposure library and access boundaries. Verify that each hazard applies to the actual task/site. Distinguish measured values from qualitative estimates and identify missing evidence explicitly.

## Phase 2 – software verification
- Unit tests for index completeness, invalid data, version capture and gate precedence.
- Missing data must never become zero risk or a safe status.
- A critical safety hold cannot be offset by any other index.
- Medical diagnosis text must not be exposed to HSE users or operational exports.
- Test role permissions against Supabase RLS directly, not only hidden UI controls.
- Test audit events, export restrictions, retention and rollback.

## Phase 3 – expert reference cases
Build de-identified hypothetical cases across onshore/offshore, remote sites, laboratories, transport, maintenance, emergency response and office work. Have independent experts assess the same cases; document disagreement and adjudication. Evaluate false-negative risk for critical hazards and essential task requirements.

## Phase 4 – field pilot and calibration
Pilot in shadow mode only after governance approval. Compare structured outputs with independent professional assessments and actual exposure evidence. If a numerical model is later proposed, pre-register rationale, dataset, missing-data rules, calibration method, performance metrics and subgroup fairness checks. Do not introduce weights or cut-offs from intuition alone.

## Release criteria
No operational fitness decision use until clinical/occupational validation, legal review, security/privacy assessment, user acceptance testing, incident response, backup/restore test and institutional approval are complete.
