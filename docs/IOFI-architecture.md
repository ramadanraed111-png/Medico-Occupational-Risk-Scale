# IOFI – Integrated Occupational Fitness Intelligence
## Architecture foundation – Draft 0.1 (14 November 2026)

### Purpose
A job-, task-, worksite- and date-specific occupational assessment framework for onshore, offshore, processing, laboratory, logistics, construction, emergency-response and office settings. It supports evidence review; it is not an autonomous medical decision-maker.

### Four independent indices
1. **OERI – Occupational Exposure Risk Index:** occupational health hazards, exposure routes, measured or qualitative intensity, frequency, duration, controls and residual exposure. Preserve hazard-specific units and evidence.
2. **IHVI – Individual Health Vulnerability Index:** physician assessment of whether a health condition or functional vulnerability is relevant to a specific exposure, task or emergency demand. Do not score diagnoses or penalise a worker for having a condition.
3. **JTCI – Job & Task Compatibility Index:** compare actual functional capacity with essential physical, sensory, cognitive, psychological and emergency-response requirements, task by task. A critical requirement cannot be offset by unrelated strengths.
4. **WORM – Worksite & Operational Risk Modifier:** context such as remoteness, access to care, evacuation, communications, transport, shift pattern and emergency support. It changes task planning and controls, not the worker's personal score.

The indices are independent profiles. No overall weighted score is defined in this foundation release.

### Decision layer – IODE
- Apply a Critical Safety Gate before any aggregate interpretation.
- Hold progression when a critical hazard is uncontrolled or emergency arrangements are inadequate.
- Return Pending / Insufficient Data when required evidence is missing or unverified.
- Examine individual-task compatibility without compensatory averaging.
- Require occupational-physician review for medical interpretation and final fitness opinion.
- Preserve scope: one worker, defined job, task set, worksite and assessment date.
- Record reasons, restrictions, accommodations, review date and evidence references.
- Never issue an automated permanent-unfit decision.

### Workflow
1. Identify worker, employer/contractor, job family, position, task, worksite, work mode and assessment date.
2. Select actual tasks from the controlled Job & Task Library.
3. Link applicable health hazards from the JEM; record measured evidence or clearly labelled qualitative assessment.
4. Record operational safety hazards and control verification separately in the Task Risk Assessment.
5. Complete site/emergency context (WORM).
6. Occupational physician reviews health information and exposure-specific relevance (IHVI) in a restricted medical area.
7. Compare functional capacity with essential task demands (JTCI).
8. Apply the Critical Safety Gate and data-completeness checks.
9. Generate an explainable recommendation for authorised professional review.
10. Record physician decision, restrictions, rationale, reviewer, date and reassessment trigger.

### Governance
- Separate identifiable medical data from HSE/operational information.
- Enforce least-privilege, role- and section-level access through database policies, not UI hiding alone.
- Audit create, edit, submission, return, approval, export and archive events.
- Store algorithm, library, job-profile and reference-limit versions with each assessment.
- Distinguish Egyptian legal limits, company limits and international guidance; never label guidance as Egyptian law.
- Preserve existing MORS/POFRI/MOFASA tables, accounts and assessment rows. IOFI changes must be additive and isolated.

### Prototype boundary
iofi-engine.js validates evidence completeness and non-compensatory gates only. It has no weights, cut-offs, diagnosis scoring or final fitness output and is not connected to the production interface or database.
