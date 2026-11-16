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


## Family-specific validation additions – 16 November 2026

### Logistics & Transportation (family 09)
- Verify vehicle class, route, road type, journey need, shift, driving time, rest opportunity, night driving and trip records.
- Review vehicle maintenance, driver authorisation, seat-belt, telematics and journey-management evidence.
- For forklifts/cranes/loading, verify equipment type, rated capacity, inspection/certification, load mass, exclusion zones, pedestrian segregation and competent team roles.
- Confirm whether a driver personally performs coupling, fuel/chemical transfer, sampling or loading; do not infer these duties from a tanker/heavy-vehicle title.
- Obtain representative personal/area measurements only where task/site evidence warrants them; preserve agent, unit, method, sampling duration and date.

### Security & Emergency Response (family 10)
- Separate gate/patrol/control-room duties from designated firefighting, toxic-atmosphere entry, confined-space rescue, HazMat, first-aid, incident-command and post-incident recovery roles.
- Verify incident command, responder roster, competency, SCBA/respirator inspection, atmospheric monitoring, buddy system, decontamination, rehabilitation and post-deployment follow-up.
- Review responder health information confidentially and only against actual assigned duties and applicable programme requirements; do not use a diagnosis list or generic physical test as a substitute for job analysis.
- Test that HSE exports contain only necessary functional restrictions and control information, not diagnosis or confidential clinical notes.

### Legal and reference verification
- Legal review must use the Official Gazette text of Egyptian Labour Law 14/2025 and confirm employer/workforce scope and current implementing decisions. Do not treat OSHA/NIOSH material as Egyptian law.
- A recognised hazard source supports hazard investigation, not an assumption of personal exposure. Missing measurements, roster data or task evidence must remain Pending / Unknown.
