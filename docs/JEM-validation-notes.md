# POFRI JEM validation notes

## Scope implemented
- Structured occupational exposure library with 59 hazard entries in 8 categories.
- Four severity descriptions per entry, transcribed from the supplied matrix.
- Universal frequency choices for every category: rare, occasional, repeated, continuous.
- The UI permits multiple hazards per task and a custom unlisted hazard with free-text name and description.
- Each saved assessment stores an `exposures.items` array containing category, hazard, severity, source description, frequency, basis (where supplied), notes, and custom-entry flag.
- The original TRA controls and residual-risk assessment remain separate from JEM exposure severity/frequency.

## Important decision-engine boundary
Exposure frequency is stored independently and is not, by itself, an automatic A/B/C/D escalation trigger. This avoids treating every repeated exposure as inherently disqualifying. The existing preliminary escalation logic still considers the legacy category severity summaries and the separately assessed TRA, medical, and site/emergency domains. This remains a prototype rule set and is not clinically validated.

## Automated data checks
Run:
```sh
node tests/jem-library.test.js
```
Expected result: 59 hazards, 8 categories, four severity levels per hazard, and four universal frequency choices.

## Manual browser checks after deployment
1. Sign in with an authorized test account.
2. Open a new POFRI assessment and verify the eight hazard categories appear.
3. Select a chemical hazard (e.g. H₂S); verify all four severity descriptions appear.
4. Repeat for Shift Work, Dust Storms, and Industrial Radiography; verify severity choices are available.
5. For each of those categories, verify the frequency options are exactly rare, occasional, repeated, continuous.
6. Add two different hazards to one assessment; verify both remain in the list.
7. Remove one hazard; verify only that row disappears.
8. Add a custom hazard; verify the custom name is mandatory and the record can be added.
9. Enter notes and save a test assessment; verify the database record contains the complete `exposures.items` array.
10. Verify the admin assessment list and CSV export still function.
11. Verify the MORS archive tables and existing MORS records are untouched.

## Limitations
- The user-provided matrix did not specify a distinct frequency description or numerical threshold for each hazard; therefore frequency choices are universal labels only.
- A missing description in the source is not silently replaced with a numeric threshold.
- This validation checks data structure and workflow, not occupational exposure limits, industrial hygiene measurements, clinical validity, or fitness-for-work policy approval.
