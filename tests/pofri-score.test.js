// Run with: node tests/pofri-score.test.js
const assert = require("node:assert/strict");
global.window = global;
require("../pofri-score.js");
const calculate = global.POFRI_EXPERIMENTAL_SCORE.calculate;
const baseline = {
  "medical-fit":"compatible", capacity:"adequate", physical:"low", cognitive:"low",
  controls:"effective", "residual-risk":"low", "care-access":"good",
  evacuation:"ready", communications:"reliable", "site-support":"adequate",
  jem_items:[], mcm_items:[]
};
const low = calculate(baseline);
assert.equal(low.total, 0);
assert.deepEqual(low.components,{R:0,M:0,F:0,E:0});
const elevated = calculate({...baseline,
  "medical-fit":"restricted",capacity:"limited",physical:"very_high",cognitive:"high",
  controls:"partial","residual-risk":"high","care-access":"limited",
  evacuation:"partial",communications:"intermittent","site-support":"limited",
  jem_items:[{severity:3,frequency:"repeated"},{severity:4,frequency:"continuous"}],
  mcm_items:[{level:3}]
});
assert.ok(elevated.total > low.total);
assert.equal(elevated.details.hazard_count,2);
const critical = calculate({...baseline,
  "medical-fit":"incompatible",capacity:"insufficient",controls:"weak",
  "residual-risk":"critical","care-access":"remote",evacuation:"weak",
  communications:"poor","site-support":"inadequate",
  jem_items:[{severity:4,frequency:"continuous"}],mcm_items:[{level:4}]
});
assert.ok(critical.total > elevated.total);
assert.ok(critical.total >= 75);
assert.equal(critical.model,"POFRI-WEIGHTED-DRAFT-1.0");
console.log("POFRI weighted score tests passed:",{low:low.total,elevated:elevated.total,critical:critical.total});
