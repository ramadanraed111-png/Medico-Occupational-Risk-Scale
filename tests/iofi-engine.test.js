const assert=require("node:assert/strict");
const {evaluate}=require("../iofi-engine.js");
const empty=evaluate({});
assert.equal(empty.overall.state,"pending_insufficient_data");
assert.equal(empty.overall.automated_fitness_decision,false);
assert.equal(empty.overall.numeric_score,null);
const base={
 exposure:{reviewed:true,hazards:[]},
 health:{physician_review:{completed:true,review_date:"2026-11-14",reviewer_id:"physician-test"},exposure_relevance:[]},
 compatibility:{reviewed:true,tasks:[]},
 site:{reviewed:true,work_mode:"onshore",medical_care_access:"available",evacuation:"tested",communications:"reliable",transport:"available",emergency_support:"adequate",shift_pattern:"day"},
 critical_safety_gate:{reviewed:true,status:"clear"}
};
const ready=evaluate(base);
assert.equal(ready.overall.state,"ready_for_occupational_physician_review");
assert.equal(ready.overall.all_inputs_complete,true);
const held=evaluate({...base,critical_safety_gate:{reviewed:true,status:"hold",reason:"Uncontrolled critical hazard"}});
assert.equal(held.overall.state,"hold_for_critical_safety_review");
assert.equal(held.overall.numeric_score,null);
const missing=evaluate({...base,exposure:{reviewed:true,hazards:[{hazard_id:"H2S",exposure_route:"inhalation",evidence_type:"measured",controls_reviewed:true}]}});
assert.equal(missing.indices.OERI.status,"incomplete");
assert.ok(missing.overall.missing.some(x=>x.includes("measurement")));
console.log("IOFI foundation tests passed (4 scenarios).");
