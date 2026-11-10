# POFRI Decision Engine – Draft Validation Cases

**Version:** POFRI-0.1-DRAFT  
**Status:** Logic-level test cases only; not clinical, occupational, or regulatory validation.

## Purpose

Record expected outcomes for deterministic checks of the draft A/B/C/D escalation rules. These tests check that known input combinations produce the intended draft category. They do not establish that the category is medically correct for a real worker or task.

## Decision cases

| # | Scenario | Key input change from baseline | Expected |
|---:|---|---|:---:|
| 1 | Baseline with no escalation flags | Compatible medical status, adequate capacity, effective controls, low residual risk, ready site | A |
| 2 | Medical incompatibility | Medical fit = incompatible | D |
| 3 | Insufficient functional capacity | Capacity = insufficient | D |
| 4 | Medical review pending | Medical fit = pending | C |
| 5 | Temporary medical incompatibility | Medical fit = temporary | C |
| 6 | Unknown functional capacity | Capacity = unknown | C |
| 7 | Critical residual risk | Residual risk = critical | C |
| 8 | High residual risk | Residual risk = high | B |
| 9 | High inherent task risk | Inherent risk = high | B |
| 10 | Critical inherent risk with effective controls | Inherent risk = critical; controls = effective | B |
| 11 | Critical inherent risk with weak controls | Inherent risk = critical; controls = weak | C |
| 12 | Partial evacuation arrangements | Evacuation = partial | B |
| 13 | Moderate access to medical care | Care access = moderate | B |
| 14 | Unknown emergency communications | Communications = unknown | B |
| 15 | Isolated work | Isolated work = yes | B |
| 16 | Driving / equipment operation | Driving or equipment operation = yes | B |
| 17 | Partial controls | Controls = partial | B |
| 18 | Medical restrictions | Medical fit = restricted | B |

## Expected precedence

1. D takes precedence when the medical/task compatibility is explicitly incompatible or functional capacity is insufficient.
2. C takes precedence over B for temporary/pending medical review, unknown functional capacity, critical residual risk, or critical inherent risk with ineffective controls.
3. B is a conditional-review category for elevated task demands, exposures, imperfect controls, or gaps in site/emergency readiness.
4. A is only the absence of an escalation flag in the entered data. It is not a certification of fitness and requires professional review.

## Interface and data-entry checks

- All 22 assessment dropdowns must be required and begin with an empty prompt; a default selection must not silently imply a safe condition.
- Job and task datalist markup must be valid.
- Preview must be blocked until required inputs are completed.
- Mission/shift duration must be entered because exposure duration is part of task-specific assessment.
- Final restrictions/recommendations must be non-empty before saving any assessment; whitespace-only entries must be rejected.
- The saved decision must include the category, label, reasons, and algorithm version.
- Only `admin` and `data_entry` roles may insert records; only `admin` may read the full POFRI register.
- A data-entry user must not be able to read the full register through the API even if the interface hides the admin panel.

## Validation result recorded

The 18 logic-level cases above were run against the current draft rules during development; all 18 expected categories matched. Static inspection also confirmed that all 22 assessment dropdowns have required validation and explicit empty prompts.

## Important limitations

- The rules are not calibrated against occupational medicine outcomes, exposure measurements, task risk assessments, or field emergency response data.
- A/B/C/D labels are provisional workflow prompts, not a medical diagnosis or final fitness decision.
- The interface still needs end-to-end browser testing after deployment, including sign-in, save, admin read, data-entry denial of read, and CSV export.
- Any real implementation requires approval by occupational medicine, HSE, operations, information security, and the organization's governance process.

## Additional workflow safeguard

The assessment form now requires mission/shift duration and final restrictions/recommendations. The save handler also trims the recommendations field and refuses to save a whitespace-only value. This is a workflow completeness check; it does not validate the clinical adequacy of the recommendation text.
