# POFRI Weighted Risk Index – Draft 1.0

**Purpose:** temporary demonstration and expert-committee discussion only. This is a proposed scoring structure, not a validated instrument.

## Overall formula

`POFRI = 0.30R + 0.30M + 0.25F + 0.15E`

All components are displayed on a 0–100 scale. Higher values indicate greater concern.

| Component | Weight | Meaning |
|---|---:|---|
| R | 30% | Residual occupational risk |
| M | 30% | Medical compatibility with the specific task |
| F | 25% | Functional compatibility with task demands |
| E | 15% | Site emergency readiness |

## Component calculations

### R – Residual occupational risk
For each JEM hazard:
- Severity: level 1–4 converted to 25, 50, 75, 100.
- Frequency multiplier: rare 0.40; occasional 0.60; repeated 0.80; continuous 1.00.
- Control multiplier: effective 0.35; partial 0.65; weak/unknown 1.00.
- Hazard score = severity score × frequency multiplier × control multiplier, capped at 100.
- Multiple-hazard profile = 70% highest hazard score + 30% mean hazard score.
- R = 65% multiple-hazard profile + 35% TRA residual-risk score (low 0; moderate 33.3; high 66.7; critical 100). If no JEM hazards were entered, R uses the TRA residual-risk score alone.

### M – Medical compatibility
- Medical/task compatibility: compatible 0; restricted 50; temporary 80; pending 75; incompatible 100.
- Highest entered MCM condition level: level 1–4 converted to 25, 50, 75, 100; zero if no condition was entered.
- M = 70% medical/task compatibility + 30% highest MCM condition score.

### F – Functional compatibility
- Functional capacity gap: adequate 0; limited 60; insufficient 100; unknown 75.
- Highest task demand (physical or cognitive): low 0; moderate 33; high 67; very high 100.
- F = 65% capacity-gap score + 35% highest task-demand score.

### E – Site emergency readiness
Average of four readiness-deficit scores:
- Medical care access: good 0; moderate 35; limited 70; remote 100.
- Evacuation: ready 0; partial 60; weak 100; unknown 75.
- Communications: reliable 0; intermittent 60; poor 100; unknown 75.
- Site support: adequate 0; limited 60; inadequate 100; unknown 75.

## Display bands (not fitness categories)
- 0–24: low
- 25–49: moderate
- 50–74: high
- 75–100: very high

These bands are provisional descriptive labels only. They are not validated thresholds and must not be translated automatically into A/B/C/D.

## Non-negotiable decision safeguards
1. The existing rule-based A/B/C/D decision remains unchanged.
2. The weighted score is shown alongside the rule-based category; it does not replace, modify, or overrule it.
3. Medical incompatibility, insufficient capacity, critical residual risk, and other existing escalation gates remain independent.
4. A low total score cannot cancel a critical hazard, medical restriction, missing essential information, or a need for specialist review.
5. The numeric score is stored inside the existing `decision` JSON object. No MORS archive tables, accounts, or existing assessment records are changed. The algorithm version is tagged `POFRI-0.2-WEIGHTED-DRAFT`; the score model is tagged `POFRI-WEIGHTED-DRAFT-1.0`.

## Status and limitations
Weights, mappings, aggregation choices, and display bands are provisional design assumptions for the committee demonstration. They have not been derived from empirical worker outcomes, calibrated against expert decisions, or validated against exposure measurements or clinical outcomes. Missing values use conservative defaults in the scoring helper, but required form fields should be completed. The score should not be used for real employment, deployment, restriction, or fitness decisions.

## Committee questions
- Are the four domains and their relative weights appropriate?
- Should the JEM hazard aggregation place more or less emphasis on the maximum hazard versus the average?
- Are the medical and functional mappings clinically defensible?
- What should count as a critical override, and who owns each override?
- Which reference cases and expert panel method should be used for calibration?
- What minimum agreement, sensitivity, and false-negative safeguards are required before any operational pilot?
