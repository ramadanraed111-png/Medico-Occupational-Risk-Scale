# MOFASA – Individual FTW Examination Report

## Purpose
This note documents the individual employee report implemented to follow the supplied **Individual FTW Examination Report** form. The report combines HSE and Medical Department outputs with the physician's recorded Fitness to Work decision.

## Output options
- **PDF:** use the in-app individual report action. The browser print dialog opens; select **Save as PDF**.
- **Word:** use the in-app Word action to download a Word-compatible HTML-based `.doc` file. This is not a native OOXML `.docx` file.

## Report sections
1. Employee information: name, payroll/registration number, age, job title, department, location, task, assessment type and date.
2. HSE output: core tasks, safety-critical duties, job demands, hazardous exposures, exposure severity/frequency, controls, residual risk and site/emergency evaluation.
3. Medical Department output: medical history, current diseases where recorded, occupational history, medication review, mental-status entry where recorded, vital signs and clinical examination findings.
4. Functional capacity: physical/functional and cognitive capacity where recorded, plus assessed fitness essentials.
5. Labs, imaging and additional investigations.
6. Fitness to Work decision, restrictions/justification, medical rationale, review date and physician/HSE sign-off details.

## Display rules
- Empty rows and sections are omitted. The report shows only information actually recorded in the assessment.
- A pending decision remains labelled **Pending**; the report does not create a decision.
- HSE-only users do not receive the combined medical report. The combined export is limited to roles already authorized to read medical information (System Admin and Medical Admin).
- The individual report is a record of entered information and the authorized physician's decision. The experimental CRI does not determine fitness.

## Data and security boundaries
The implementation uses existing MOFASA assessment and HSE/medical section data. It does not alter Supabase schema, assessment records, user accounts, roles, RLS policies, or decision/scoring logic. HSE representative name and reference number are captured as report sign-off details in the existing HSE section data.
