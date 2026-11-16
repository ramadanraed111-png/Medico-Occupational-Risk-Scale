// HSE can save a draft or submit its section as complete without waiting for medical review.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const workflow = fs.readFileSync(require.resolve("../mofasa-workflow.js"), "utf8");
const migration = fs.readFileSync(require.resolve("../supabase/migrations/202611160001_mofasa_hse_independent_completion.sql"), "utf8");

const hseFormStart = workflow.indexOf('id="mofasa-hse-form"');
const hseFormEnd = workflow.indexOf('</form>', hseFormStart);
const hseForm = workflow.slice(hseFormStart, hseFormEnd);
assert.match(hseForm, /حفظ الملف كمسودة/);
assert.match(hseForm, /إرسال كمكتمل من مسؤول السلامة/);
assert.match(hseForm, /لا يتطلب إرسال هذا القسم مراجعة الطبيب أو اعتماده/);

const saveStart = workflow.indexOf("async function saveSection(section,status)");
const saveEnd = workflow.indexOf("const flatten=", saveStart);
const save = workflow.slice(saveStart, saveEnd);
const hseBranch = save.slice(save.indexOf("if(isH){"), save.indexOf("\n  else{"));
assert.doesNotMatch(hseBranch, /medicalRow|medical_status|final_decision|canMedical/);
assert.match(save, /if\(section==="hse"&&role!=="hse_admin"\)/);
assert.match(workflow, /\$\("mofasa-hse-draft"\)\.onclick=\(\)=>saveSection\("hse","draft"\)/);
assert.match(workflow, /\$\("mofasa-hse-submit"\)\.onclick=\(\)=>saveSection\("hse","submitted"\)/);
assert.match(workflow, /const isOwnComplete=x=>ownStatus\?x\[ownStatus\]==="submitted":x\.hse_status==="submitted"&&x\.medical_status==="submitted"/);

assert.match(migration, /create policy mofasa_hse_insert[\s\S]*u\.role in \('admin','hse_admin'\)/);
assert.match(migration, /create policy mofasa_hse_update_draft[\s\S]*status = 'draft'[\s\S]*status in \('draft','submitted'\)/);
assert.doesNotMatch(migration, /medical_status|mofasa_medical_sections|medical_admin/);
console.log("MOFASA HSE independent completion tests passed.");
