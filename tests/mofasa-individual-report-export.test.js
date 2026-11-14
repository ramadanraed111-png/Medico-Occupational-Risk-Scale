// Regression tests for the Super Admin's complete individual PDF/Word report.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const workflow = fs.readFileSync(require.resolve("../mofasa-workflow.js"), "utf8");
const occurrences = (pattern) => [...workflow.matchAll(pattern)].length;

assert.equal(occurrences(/async function buildFtwReportDocument\s*\(/g), 1,
  "There must be one asynchronous individual report builder.");
assert.equal(occurrences(/function printFtwReport\s*\(/g), 1,
  "There must be exactly one PDF print handler.");
assert.equal(occurrences(/function exportFtwWord\s*\(/g), 1,
  "There must be exactly one Word export handler.");
assert.match(workflow, /function printFtwReport\(id\)\s*\{\s*if\(!isAdmin\(\)\)return;/,
  "PDF export remains restricted to the Super Admin.");
assert.match(workflow, /buildFtwReportDocument\(id\)\.then\(html=>/,
  "PDF handler must await the asynchronous report builder.");
assert.match(workflow, /async function exportFtwWord\(id\)\s*\{\s*if\(!isAdmin\(\)\)return;\s*const html=await buildFtwReportDocument\(id\)/,
  "Word export must await the asynchronous report builder.");

assert.match(workflow, /function renderPofriReport\(score\)[\s\S]*indicator-summary[\s\S]*score\.total[\s\S]*score\.band/,
  "The report may show only the compact overall indicator result.");
assert.doesNotMatch(workflow.slice(workflow.indexOf("function renderPofriReport(score)"), workflow.indexOf("async function buildFtwReportDocument(id)")), /0\.30R|components\.R|details\.hazard_count|site_breakdown|المعادلة والأوزان/,
  "The compact indicator must not expose formulas, weights, or component breakdowns.");
assert.match(workflow, /renderCompletedReview\(hseRow,medicalRow,\{includeScore:false,expanded:true,report:true\}\)/,
  "The PDF must render the complete HSE and medical review in report-only mode.");
assert.match(workflow, /function shouldHideReportField\(key,path,options\)[\s\S]*worker_profile[\s\S]*age_years[\s\S]*date_of_birth/,
  "The individual report must omit worker age and date of birth from the HSE worker profile.");
assert.match(workflow, /options\.section==="medical"[\s\S]*department","worker_age","physician_name","physician_pr","assessment_type"/,
  "The individual report must omit administrative and physician identity fields from the medical section.");
assert.match(workflow, /path\.includes\("exam"\)&&path\.includes\("basic"\)&&\["blood_pressure","bp"\]/,
  "Blood pressure must be omitted from the basic clinical examination only.");
assert.match(workflow, /path\.includes\("vitals"\)&&\["glucose","hba1c"\]/,
  "Glucose and HbA1c must be omitted from the vital-signs subsection.");
assert.match(workflow, /path\.includes\("capacity"\)\|\|path\.includes\("functional_capacity"\).*key==="item"/,
  "The functional capacity report must omit the repeated functional-requirement row.");
assert.match(workflow, /path.includes\("diseases"\)&&\["hazard","name","level","severity","severity_label","severity_description","risk_category","category","category_label","risk_level"\]/,
  "The individual report must omit disease risk labels and severity levels from medical-history entries.");
assert.match(workflow, /reviewRows\(x,options,\["diseases"\]\)/,
  "Medical-history entries must be rendered in the disease-specific report context.");
assert.match(workflow, /options\.report\?"":'<span>'/,
  "The exported report must not show item-count labels.");
assert.match(workflow, /renderPofriReport\(medicalRow\?\.section_data\?\.preliminary_analysis\)/,
  "The PDF may append only the compact overall indicator result.");
assert.doesNotMatch(workflow.slice(workflow.indexOf("async function buildFtwReportDocument(id)"), workflow.indexOf("function printFtwReport(id)")), /mofasa_audit_log|mofasa_archive_log|سجل التدقيق|سجل الأرشيف|auditHtml/,
  "The individual report must not load or render audit or archive logs.");
assert.match(workflow, /@page\{size:A4 portrait;margin:5mm 6mm\}/,
  "The individual report must use compact A4 portrait margins.");
assert.match(workflow, /medical-review-section>\.review-disclosure-body\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,
  "Medical subsections must use a compact two-column print layout.");
assert.match(workflow, /font:7\.1pt Tahoma,Arial,sans-serif[\s\S]*line-height:1\.14/,
  "The individual report must use compact, readable typography and spacing.");
assert.match(workflow, /review-section,\.review-entry,\.report-section,\.report-audit\{[^}]*break-inside:auto/,
  "Sections must remain flowable rather than being clipped to force a page break.");
assert.match(workflow, /\.medical-review-section>\.review-disclosure-body>\.review-group\{grid-column:1\/-1\}/,
  "Long medical-history groups must retain full width in the compact layout.");
assert.match(workflow, /section\{break-inside:auto\}table,tr,.worker-card,.completed-review-row\{break-inside:avoid\}/,
  "Long sections must flow across pages while keeping table rows intact.");
assert.match(workflow, /reviewRows\(value,options=\{\},path=\[\]\)[\s\S]*options\.expanded\?' open'/,
  "Nested entries must be expanded in the PDF.");
assert.match(workflow, /oneColumn=options\.report&&group\.keys\.some\(k=>\["ftw","exam","vitals","capacity","functional_capacity"\]\.includes\(k\)\)/,
  "Clinical examination, vital signs, and functional capacity groups must use the report's one-column layout.");
assert.match(workflow, /report-one-column \.completed-review-row\{display:block!important;grid-template-columns:1fr!important\}/,
  "One-column report groups must stack labels and entered values vertically.");
assert.match(workflow, /renderMedicalReviewGroups\(md,options\)\+renderMedicalHistory\(md\.diseases,options\)/,
  "Expanded mode must propagate through all medical groups and conditions.");
assert.match(workflow, /const hseDisplay=\{tasks:hd\.tasks,tra:hd\.tra,job_task:hd\.job_task,emergency:hd\.emergency,ftw:hd\.ftw,notes:hd\.notes\}/,
  "The report must retain and order all completed HSE inputs while excluding internal intake metadata.");
assert.match(workflow, /effective:"فعالة ومتحقق منها"[\s\S]*remote:"نائي \/ معزول"/,
  "HSE and site-readiness enum values must be translated into Arabic.");
assert.match(workflow, /bp:"ضغط الدم",hr:"معدل النبض"/,
  "Vital signs must have clear Arabic labels.");
assert.match(workflow, /medical-review-grid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,
  "The individual report must use a compact two-column page layout.");
assert.match(workflow, /border-right:3px solid #17495a/,
  "The worker header and report sections must use a refined visual hierarchy.");
assert.match(workflow, /const body=reviewRows\(x,options,\["diseases"\]\);[\s\S]*ملاحظات الطبيب على التاريخ المرضي/,
  "Medical history entries and physician notes must be fully rendered in the disease-specific report context.");

console.log("MOFASA individual PDF/Word export regression tests passed.");
