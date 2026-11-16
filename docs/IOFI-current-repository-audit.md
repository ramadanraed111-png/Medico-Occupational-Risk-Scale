# Current repository audit before IOFI integration
## Read-only review – 16 November 2026

Repository: ramadanraed111-png/Medico-Occupational-Risk-Scale
Reviewed baseline: main at 44da784a8a68265c313a666b58801dd783035d97

## Confirmed current components
- The repository contains MOFASA shared-assessment workflow files, POFRI assessment modules, JEM and medical libraries, a CRI helper, bilingual UI resources, and Supabase SQL/migrations.
- Existing roles represented in the application include admin, hse_admin, medical_admin and data_entry. The shared MOFASA workflow has distinct HSE and physician sections.
- POFRI uses a separate pofri_assessments table and an app_users role lookup.
- The current POFRI schema draft creates a separate table and does not intentionally alter the legacy MORS assessment tables or Auth users.
- The current weighted POFRI helper and the older MOFASA CRI helper are distinct experimental implementations. Neither is an IOFI-approved model.
- Existing bilingual interface work and Super Admin / Physician / HSE workflow changes have already been merged in PRs #44 and #43.

## Integration risks requiring resolution
1. Naming and product boundary: README describes POFRI, the HTML title and visible header identify MOFASA, and IOFI is the newly approved umbrella architecture. A controlled naming transition is needed; do not silently rename or remove historical modules.
2. Parallel assessment stores: POFRI inserts into pofri_assessments, while the legacy administrative loader in app.js references mofasa_assessments. The separate shared MOFASA workflow also uses mofasa_assessments and related section tables. Map every UI action to its intended table before connecting IOFI.
3. Role boundaries: the existing shared workflow has HSE and physician-specific roles, while the POFRI schema draft's example RLS policies use admin/data_entry. IOFI must not inherit those broad policies for medical data. Design and test section-level RLS before any IOFI persistence.
4. Data separation: keep medical assessment details in physician-restricted storage. HSE views and operational exports should contain only functional restrictions and controls needed for the task.
5. Existing CRI / weighted helpers: do not reuse their weights, mappings, thresholds or labels as IOFI indices. Preserve them only as clearly marked historical prototype code until a governance decision is made.
6. Deployment: do not merge the IOFI branch into main or change the production Pages branch until the committee-facing preview is reviewed and role-based tests pass.

## Safe next implementation sequence
- Map current HTML modules, script loading order, auth roles, table access and all save/read/export routes.
- Build the full job-family, position and task library with source/version fields.
- Expand JEM and connect it to task + worksite applicability and measured/qualitative evidence.
- Add job-demand profiles and separate operational TRA from health exposure evidence.
- Design physician-only IHVI and task-linked JTCI with explicit HSE-safe summaries.
- Add WORM site/emergency profiles and the Critical Safety Gate.
- Only then design a new additive IOFI schema with RLS, audit trail, version snapshots and rollback.
- Connect UI and run role-by-role, API-level, export, accessibility and mobile tests.

## Scope of this audit
This is a source-code and repository-structure review only. It is not a live database audit, security penetration test, clinical validation or confirmation that every historical branch is deployed.


## Addendum – 16 November 2026: standalone IOFI boundary

The current main branch is at 44da784a8a68265c313a666b58801dd783035d97. The merged change that removed IOFI module assets from the MOFASA application was a product-boundary separation, not evidence that the IOFI framework or its library was completed. This review branch restores IOFI as a separate development track only.

The standalone IOFI set in this review contains architecture/data-model/validation documents, the job-library drafts, the pure evidence-completeness engine and its unit tests, and a static bilingual preview. It does not import IOFI scripts into index.html or mofasa-workflow.js, does not change the active application entry point, and does not connect to Supabase/Auth or existing assessment records.

No database migration, table, policy, user, role, assessment row, production route or live fitness decision is changed by this branch. Any future persistence or role integration requires a separate data-flow/RLS review, security review, backup/rollback plan and explicit approval.
