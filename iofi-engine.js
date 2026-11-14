/* IOFI foundation engine v0.1: evidence completeness and non-compensatory gates only. */
(function (root) {
 "use strict";
 const hasText = v => typeof v === "string" && v.trim().length > 0;
 const list = v => Array.isArray(v) ? v : [];
 const status = missing => ({status: missing.length ? "incomplete" : "complete", complete: missing.length === 0, missing});
 function evaluate(input = {}) {
  const e=input.exposure||{}, h=input.health||{}, c=input.compatibility||{}, s=input.site||{}, g=input.critical_safety_gate||{};
  const em=[]; if(e.reviewed!==true) em.push("exposure.reviewed");
  list(e.hazards).forEach((x,i)=>{
   ["hazard_id","exposure_route"].forEach(k=>{if(!hasText(x[k]))em.push("exposure.hazards["+i+"]."+k);});
   if(!["measured","qualitative","not_applicable"].includes(x.evidence_type))em.push("exposure.hazards["+i+"].evidence_type");
   if(x.evidence_type==="measured"&&(!hasText(x.measurement?.value)||!hasText(x.measurement?.unit)||!hasText(x.measurement?.date)||!hasText(x.measurement?.method)))em.push("exposure.hazards["+i+"].measurement");
   if(x.controls_reviewed!==true)em.push("exposure.hazards["+i+"].controls_reviewed");
  });
  const hm=[]; if(h.physician_review?.completed!==true)hm.push("health.physician_review.completed");
  ["review_date","reviewer_id"].forEach(k=>{if(!hasText(h.physician_review?.[k]))hm.push("health.physician_review."+k);});
  list(h.exposure_relevance).forEach((x,i)=>["exposure_id","health_effect_assessed","stability","functional_impact","accommodation"].forEach(k=>{if(!hasText(x[k]))hm.push("health.exposure_relevance["+i+"]."+k);}));
  const cm=[]; if(c.reviewed!==true)cm.push("compatibility.reviewed");
  list(c.tasks).forEach((x,i)=>{
   ["task_id","criticality","requirement","capacity_status","evidence"].forEach(k=>{if(!hasText(x[k]))cm.push("compatibility.tasks["+i+"]."+k);});
   if(x.capacity_status&&!["met","met_with_accommodation","not_met","not_assessed"].includes(x.capacity_status))cm.push("compatibility.tasks["+i+"].capacity_status_invalid");
  });
  const sm=[]; if(s.reviewed!==true)sm.push("site.reviewed");
  ["work_mode","medical_care_access","evacuation","communications","transport","emergency_support","shift_pattern"].forEach(k=>{if(!hasText(s[k]))sm.push("site."+k);});
  const gm=[]; if(g.reviewed!==true)gm.push("critical_safety_gate.reviewed");
  if(!["clear","hold","unknown"].includes(g.status))gm.push("critical_safety_gate.status");
  if(g.status==="hold"&&!hasText(g.reason))gm.push("critical_safety_gate.reason");
  const indices={OERI:status(em),IHVI:status(hm),JTCI:status(cm),WORM:status(sm)};
  const allComplete=Object.values(indices).every(x=>x.complete)&&gm.length===0;
  let state="pending_insufficient_data";
  if(gm.length===0&&g.status==="hold")state="hold_for_critical_safety_review";
  else if(gm.length===0&&g.status==="unknown")state="pending_critical_gate_review";
  else if(allComplete)state="ready_for_occupational_physician_review";
  return {
   model:"IOFI-0.1-FOUNDATION",indices,
   critical_safety_gate:{status:g.status||"unknown",complete:gm.length===0,missing:gm,reason:g.reason||null},
   overall:{state,all_inputs_complete:allComplete,physician_decision_required:true,automated_fitness_decision:false,numeric_score:null,missing:[...em,...hm,...cm,...sm,...gm]},
   safeguards:["No weighted total or cross-domain averaging.","A critical safety hold cannot be offset by another index.","Missing evidence remains pending, never zero risk.","No diagnosis-based penalty.","Final job-specific decision remains with the authorised occupational physician."]
  };
 }
 const api=Object.freeze({evaluate,version:"IOFI-0.1-FOUNDATION"});
 root.IOFI_ENGINE=api;
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
