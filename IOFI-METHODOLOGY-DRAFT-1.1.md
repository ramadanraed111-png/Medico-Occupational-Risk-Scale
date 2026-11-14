# IOFI — Experimental calculation methodology (Draft 1.1)

Purpose: transparent occupational decision-support calculation for committee review. Not clinically validated; does not diagnose or issue a fitness-for-work decision.

## Source records
- IHVI: five physician-entered ratings (0–100) stored in medical section data. Each rating requires a written rationale in ihvi_evidence. Clinical findings, conditions, investigations and fitness records are source material; software does not infer severity from diagnoses or laboratory values.
- JTCI: derived from actual Fitness Essentials items in the medical section. Items are selected from the assessed worker's job/task and HSE task/demand context. Provisional mapping: met=100; met with restrictions=60; not met=0. Not assessed or missing evidence means incomplete.
- OERI: each HSE JEM hazard uses severity (1–5), frequency (1–5), duration (1–5), probability (1–5), and control effectiveness (0–1).
- WORM: site category, medical-care access, evacuation, communications, medical support, shift pattern, isolation, task criticality, and environmental conditions. WORM is contextual and is not a numeric multiplier.

## Provisional equations
Residual = Severity × Frequency × Duration × Probability × (1 − ControlEffectiveness)
OERI = mean(Residual / 625 × 100)
IHVI = mean(the five physician-rated domains)
JTCI = mean(the assessed Fitness Essentials item scores)
IOFI = 100 × (IHVI/100)^0.40 × (JTCI/100)^0.35 × (1−OERI/100)^0.25

The 40% / 35% / 25% weights and equal weighting within components are provisional assumptions, not validated weights. JTCI domain labels use visible keyword mapping and are not an approved job taxonomy.

## Incompleteness and safety gates
- No IOFI total if any component or required WORM field is incomplete.
- A critical residual hazard, critical task with weak/unknown evacuation readiness, or medical decision of temporarily unfit / unfit / specialist review blocks the total and requests human review.
- Restrictions and alerts remain visible for professional review.
- Missing information is never treated as zero risk or evidence of fitness.
- WORM does not numerically penalize a worker; it contextualizes task/site controls.

## Committee decisions required
1. Confirm or replace component weights.
2. Approve hazard scales and control-effectiveness definitions.
3. Approve JTCI mapping and job/task-to-Fitness-Essentials library.
4. Define clinically justified IHVI anchors and evidence standards.
5. Validate WORM field definitions and operational stop rules.
6. Approve sample testing, inter-rater reliability, version control, audit trail and governance before operational use.

Current engine version: IOFI-LIVE-DATA-DRAFT-1.1.
