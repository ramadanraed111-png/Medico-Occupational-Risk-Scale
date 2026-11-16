// Regression coverage for bilingual MOFASA report indices.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const read = (path) => fs.readFileSync(require.resolve("../" + path), "utf8");
const index = read("index.html");
const workflow = read("mofasa-workflow.js");
const i18n = read("i18n.js");
const cri = read("cri-engine.js");
const pofri = read("pofri-score.js");

assert.match(index, /<script src="pofri-mofasa-bridge\.js"><\/script><script src="cri-engine\.js"><\/script>/,
  "The CRI engine must load before the application workflow.");
assert.match(cri, /window\\.MOFASA_CRI=\\{calculate\\}/,
  "The existing CRI engine must be exposed to the application.");
assert.ok(cri.includes(".40*T+.30*H+.20*F+.10*S"),
  "The CRI calculation must retain its established experimental weights.");
assert.ok(pofri.includes(".30*R+.30*M+.25*F+.15*E"),
  "The POFRI calculation must retain its established experimental weights.");
assert.match(workflow, /function renderIndexReport\(hd=\{\},md=\{\}\)/,
  "The individual report must calculate and render the two indices.");
assert.match(workflow, /POFRI – مؤشر التوافق الطبي والمهني[\s\S]*MOFASA-CRI – مؤشر المخاطر المركب/,
  "The report must show POFRI and MOFASA-CRI as separate index cards.");
assert.match(workflow, /تفسير النطاقات: 0–24 منخفض مبدئياً[\s\S]*75–100 مرتفع جداً مبدئياً/,
  "The POFRI interpretation ranges must be explained in the report.");
assert.match(workflow, /تفسير النطاقات: 0–24 منخفض؛ 25–49 متوسط؛ 50–74 مرتفع؛ 75–100 حرج/,
  "The CRI interpretation ranges must be explained in the report.");
assert.match(workflow, /لا يتم جمعهما أو حساب متوسط بينهما/,
  "The report must explicitly prohibit combining or averaging the two indices.");
assert.match(workflow, /renderPofriReport\(medicalRow\?\.section_data\?\.preliminary_analysis\)/,
  "The individual report must include the dual-index section.");
assert.match(workflow, /mofasa-print-ftw-en[\s\S]*mofasa-word-ftw-en/,
  "The Super Admin must have English PDF and Word report actions.");
assert.match(workflow, /mofasa-print-ftw[\s\S]*mofasa-word-ftw/,
  "The Super Admin must retain Arabic PDF and Word report actions.");
assert.match(workflow, /تظل الملاحظات النصية الحرة باللغة التي أُدخلت بها/,
  "The report must disclose that user-entered free text is preserved as entered.");
assert.match(i18n, /function translateHtml\(html,target="en"\)/,
  "The bilingual layer must support translation of the complete report document.");
assert.match(i18n, /localStorage\.setItem\("mofasa-language",lang\)/,
  "The interface language preference must remain persistent.");
assert.match(workflow, /stored\.total!==null&&stored\.total!==undefined/,
  "A missing stored score must not be misread as a numeric zero.");

console.log("MOFASA bilingual indices and individual-report tests passed.");
