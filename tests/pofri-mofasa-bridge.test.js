// Run with: node tests/pofri-mofasa-bridge.test.js
const assert=require("node:assert/strict");
global.window=global;
global.POFRI_EXPERIMENTAL_SCORE={calculate:input=>({total:42,band:"متوسط",input})};
require("../pofri-mofasa-bridge.js");
const bridge=global.MOFASA_POFriBridge;
const input={
 "employee-name":"عامل تجريبي","registration-number":"T-100","job-title":"مشغل إنتاج",
 "task-name":"تشغيل وحدة","assessment-date":"2026-11-14",site:"بدر-3",
 "date-of-birth":"1980-01-01",age_years:46,evaluator_name:"مسؤول السلامة",duration:"12 ساعة",
 physical:"moderate",cognitive:"high",height:"yes",confined:"no",isolated:"no",driving:"yes",
 jem_items:[{category:"مخاطر فيزيائية",name:"ضوضاء",severity:"3",severity_label:"مرتفع",frequency:"repeated"}],
 "inherent-risk":"high",controls:"partial","residual-risk":"moderate",permit:"PTW-1","tra-notes":"ملاحظة",
 "site-category":"onshore","care-access":"moderate",evacuation:"partial",communications:"reliable","site-support":"adequate"
};
const parent=bridge.toParent(input);
assert.equal(parent.worker_name,"عامل تجريبي");
assert.equal(parent.shift_duration,"12 ساعة");
const hse=bridge.toHseSection(input);
assert.equal(hse.tasks.items[0],"تشغيل وحدة");
assert.equal(hse.job_task.physical,"moderate");
assert.equal(hse.hazards.items[0].severity,3);
assert.equal(hse.tra.residual,"moderate");
assert.equal(hse.emergency.care_access,"moderate");
assert.equal(hse.preliminary_analysis.status,"awaiting_physician_review");
assert.equal(bridge.scoreInput(hse,{diseases:{items:[],reviewed:false},capacity:{items:[]}},"fit").complete,false);
const medical={diseases:{items:[],reviewed:true},capacity:{items:[{status:"met"},{status:"met"}]}};
const prepared=bridge.scoreInput(hse,medical,"fit");
assert.equal(prepared.complete,true);
assert.equal(prepared.data["medical-fit"],"compatible");
assert.equal(prepared.data.capacity,"adequate");
assert.equal(bridge.calculate(hse,medical,"fit").total,42);
assert.equal(bridge.capacitySummary([{status:"not_met"}]),"insufficient");
assert.equal(bridge.capacitySummary([{status:"restricted"}]),"limited");
console.log("MOFASA/POFRI bridge tests passed.");
