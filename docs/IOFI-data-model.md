# IOFI data model – proposed logical schema (Draft 0.1)
This is a logical model only, not a migration. Do not execute it against Supabase without separate review and approval.

## Core entities
- job_families: family code, name, scope, version, active status.
- job_positions: family, title, employment context, version, approval status.
- job_tasks: position, task code, description, essential/conditional status, criticality, work mode, evidence source.
- worksites: site code, onshore/offshore/processing/lab/office classification, remoteness, emergency profile, version.
- hazard_categories: physical, chemical, biological, ergonomic, psychosocial and other approved categories.
- hazard_library: hazard code, name, exposure routes, health endpoints, measurement methods, units, evidence references, review date.
- job_exposure_matrix: task + site + hazard relation, applicability, route, evidence type, intensity, frequency, duration, measurement, applicable limit, controls, residual exposure, confidence and evidence reference.
- task_risk_assessments: operational safety hazards, inherent risk, criticality, controls, verification, residual risk, permit/JSA references. Keep distinct from health exposure measurements.
- job_demand_profiles: physical, sensory, cognitive, psychological, environmental and emergency demands per essential task.
- site_emergency_profiles: access to care, evacuation, communications, transport, emergency response capability, shift and environmental context.
- medical_assessments: restricted physician-only health data, exposure-specific relevance, stability, functional impact and clinical rationale.
- functional_assessments: task-linked capacity findings, evidence, accommodation and assessor.
- iofi_assessments: worker + job + task set + worksite + date + versioned snapshots of the four indices and decision workflow.
- iofi_decisions: physician decision, scope, rationale, restrictions, accommodations, review date and approval state.
- iofi_audit_log: actor, role, action, entity, timestamp, reason and change reference.

## Exposure evidence fields
Each exposure record should support hazard_id, task_id, worksite_id, exposure_route; evidence_type (measured / qualitative / not_applicable); intensity_value and intensity_unit; measurement_method, sampling_strategy, measurement_date and duration basis; frequency, duration and shift/time basis; limit_value, limit_unit, limit_type (legal / company / guidance), jurisdiction, source, edition and effective_date; controls by hierarchy (elimination, substitution, engineering, administrative, PPE); verification evidence, residual_exposure, confidence, reviewer and review_date.

## Privacy and security
Medical detail must not be copied into HSE-visible JSON or general exports. HSE users receive only functional restrictions and control-relevant information necessary for their role. Physician and Super Admin permissions must be explicitly defined and enforced by RLS and tested using direct API calls. Do not reuse a broad admin role as a substitute for a medical role.

## Migration policy
No existing table, account, policy or record is to be dropped, renamed or repurposed. A future migration must create a new IOFI table set, be idempotent, include RLS and indexes, and be reviewed with backup/rollback plan before manual execution.
