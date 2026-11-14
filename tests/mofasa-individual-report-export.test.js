// Regression test: the Super Admin's individual PDF/Word handlers must await the async report builder.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const workflow = fs.readFileSync(require.resolve("../mofasa-workflow.js"), "utf8");

const occurrences = (pattern) => [...workflow.matchAll(pattern)].length;
assert.equal(occurrences(/async function buildFtwReportDocument\s*\(/g), 1,
  "There must be one asynchronous individual report builder.");
assert.equal(occurrences(/function printFtwReport\s*\(/g), 1,
  "There must be exactly one PDF print handler; duplicate declarations override the working handler.");
assert.equal(occurrences(/function exportFtwWord\s*\(/g), 1,
  "There must be exactly one Word export handler.");
assert.match(workflow, /function printFtwReport\(id\)\s*\{\s*if\(!isAdmin\(\)\)return;/,
  "PDF export remains restricted to the Super Admin.");
assert.match(workflow, /buildFtwReportDocument\(id\)\.then\(html=>/,
  "PDF handler must wait for the asynchronous report builder before writing the print window.");
assert.match(workflow, /async function exportFtwWord\(id\)\s*\{\s*if\(!isAdmin\(\)\)return;\s*const html=await buildFtwReportDocument\(id\)/,
  "Word export must await the asynchronous report builder.");

assert.match(workflow, /function renderPofriReport\(score\)/,
  "The individual report must render a dedicated POFRI interpretation section.");
assert.match(workflow, /0–24[\s\S]*منخفض مبدئياً[\s\S]*25–49[\s\S]*متوسط مبدئياً[\s\S]*50–74[\s\S]*مرتفع مبدئياً[\s\S]*75–100[\s\S]*مرتفع جداً مبدئياً/,
  "The report must explain the four provisional POFRI interpretation bands.");
assert.match(workflow, /0 يعني أقل مستوى قلق أو فجوة مرصودة، و100 يعني أعلى مستوى قلق أو فجوة/,
  "The report must explain the direction and meaning of the POFRI scale.");
assert.match(workflow, /0\.30R \+ 0\.30M \+ 0\.25F \+ 0\.15E/,
  "The report must show the weighted POFRI formula.");
assert.match(workflow, /renderCompletedReview\(hseRow,medicalRow,\{includeScore:false\}\)[\s\S]*renderPofriReport\(medicalRow\?\.section_data\?\.preliminary_analysis\)/,
  "The PDF must show complete specialist review and the detailed saved POFRI result.");
assert.match(workflow, /const body=reviewRows\(x\);[\s\S]*ملاحظات الطبيب على التاريخ المرضي/,
  "Medical history entries and physician notes must be fully rendered.");

console.log("MOFASA individual PDF/Word export regression tests passed.");
