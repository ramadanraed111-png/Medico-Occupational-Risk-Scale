// Regression test: HSE and physician sections must submit independently.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const workflow = fs.readFileSync(require.resolve("../mofasa-workflow.js"), "utf8");
const migration = fs.readFileSync(require.resolve("../supabase/migrations/20261114212427_mofasa_parallel_section_submission.sql"), "utf8");

// Neither role's submission may be gated by the other section's status.
assert.doesNotMatch(workflow, /parent\.hse_status\s*!==\s*["']submitted["']/);
assert.doesNotMatch(workflow, /parent\.medical_status\s*!==\s*["']submitted["']/);
assert.match(workflow, /\$\("mofasa-hse-submit"\)\.onclick=\(\)=>saveSection\("hse","submitted"\)/);
assert.match(workflow, /if\(ms&&!isAdmin\(\)\)ms\.onclick=\(\)=>saveSection\("medical","submitted"\)/);
assert.match(workflow, /const ownStatus=role==="hse_admin"\?"hse_status":role==="medical_admin"\?"medical_status":null/);
assert.match(workflow, /const isOwnComplete=x=>ownStatus\?x\[ownStatus\]==="submitted":x\.hse_status==="submitted"&&x\.medical_status==="submitted"/,
  "Each specialist's completion list must depend on their own submitted section, not the other role.");
assert.match(workflow, /if\(isH\?!canHse\(\):!canMedical\(\)\)return null/,
  "Each specialist may generate only their own section report.");
assert.match(workflow, /const reportOptions=\{expanded:true,report:true\};[\s\S]*renderMedicalReviewGroups\(md,reportOptions\)\+renderMedicalHistory\(md\.diseases,reportOptions\)/,
  "The physician report must build from the physician's own submitted section without requiring HSE completion.");
assert.match(workflow, /if\(hseRow\?\.status!=="submitted"\)return null;[\s\S]*if\(medicalRow\?\.status!=="submitted"\)return null/,
  "Section reports become printable when that individual section is submitted.");

// Database RLS keeps the physician role and final-decision requirement,
// but no longer requires the HSE parent status to be submitted first.
assert.match(migration, /u\.role\s*=\s*'medical_admin'/);
assert.match(migration, /status\s*=\s*'submitted'\s+and\s+final_decision\s+is\s+not\s+null/);
assert.doesNotMatch(migration, /hse_status|mofasa_assessments\s+a/i);
console.log("MOFASA independent section submission tests passed.");
