/* POFRI provisional weighted score: presentation/calibration draft only.
 * Higher values mean greater concern. It never changes the A/B/C/D rule result.
 */
(() => {
  const clamp = n => Math.max(0, Math.min(100, Number(n) || 0));
  const mean = xs => xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : 0;
  const maps = {
    frequency: {rare:0.4, occasional:0.6, repeated:0.8, continuous:1},
    controls: {effective:0.35, partial:0.65, weak:1, unknown:1},
    residual: {low:0, moderate:33.3, high:66.7, critical:100},
    medicalFit: {compatible:0, restricted:50, temporary:80, incompatible:100, pending:75},
    capacity: {adequate:0, limited:60, insufficient:100, unknown:75},
    demand: {low:25, moderate:50, high:75, very_high:100},
    care: {good:0, moderate:35, limited:70, remote:100},
    evacuation: {ready:0, partial:60, weak:100, unknown:75},
    communications: {reliable:0, intermittent:60, poor:100, unknown:75},
    support: {adequate:0, limited:60, inadequate:100, unknown:75}
  };
  const pick = (map, key, fallback=75) => Object.prototype.hasOwnProperty.call(map,key) ? map[key] : fallback;
  const averageHazard = (items, controls) => {
    if (!items.length) return null;
    const controlFactor = pick(maps.controls, controls, 1);
    const scores = items.map(x => {
      const severity = clamp((Number(x.severity)||1) * 25);
      const frequency = pick(maps.frequency, x.frequency, 0.6);
      return clamp(severity * frequency * controlFactor);
    });
    const profile = 0.7 * Math.max(...scores) + 0.3 * mean(scores);
    return {score:clamp(profile), max:Math.max(...scores), average:mean(scores), count:items.length};
  };
  function calculate(d) {
    const hazards = Array.isArray(d.jem_items) ? d.jem_items : [];
    const hazardProfile = averageHazard(hazards, d.controls);
    const tra = pick(maps.residual, d["residual-risk"], 75);
    const R = hazardProfile ? clamp(0.65*hazardProfile.score + 0.35*tra) : clamp(tra);

    const fit = pick(maps.medicalFit, d["medical-fit"], 75);
    const conditions = Array.isArray(d.mcm_items) ? d.mcm_items : [];
    const conditionScore = conditions.length ? Math.max(...conditions.map(x=>clamp((Number(x.level)||1)*25))) : 0;
    const M = clamp(0.7*fit + 0.3*conditionScore);

    const capacity = pick(maps.capacity, d.capacity, 75);
    const demands = [pick(maps.demand,d.physical,50),pick(maps.demand,d.cognitive,50)];
    const F = clamp(0.65*capacity + 0.35*Math.max(...demands));

    const E = clamp(mean([
      pick(maps.care,d["care-access"],75),
      pick(maps.evacuation,d.evacuation,75),
      pick(maps.communications,d.communications,75),
      pick(maps.support,d["site-support"],75)
    ]));

    const total = Math.round(clamp(0.30*R + 0.30*M + 0.25*F + 0.15*E));
    const band = total < 25 ? "منخفض" : total < 50 ? "متوسط" : total < 75 ? "مرتفع" : "مرتفع جداً";
    return {
      model:"POFRI-WEIGHTED-DRAFT-1.0", total, band,
      components:{R:Math.round(R),M:Math.round(M),F:Math.round(F),E:Math.round(E)},
      details:{hazard_profile:hazardProfile?Math.round(hazardProfile.score):null,tra_residual:Math.round(tra),medical_compatibility:Math.round(fit),medical_conditions:Math.round(conditionScore),functional_capacity:Math.round(capacity),job_demands:Math.round(Math.max(...demands)),hazard_count:hazards.length},
      formula:"0.30R + 0.30M + 0.25F + 0.15E",
      limitation:"درجة تجريبية غير معايرة؛ لا تغيّر تصنيف A/B/C/D ولا تتجاوز بوابات السلامة أو الحكم الطبي."
    };
  }
  window.POFRI_EXPERIMENTAL_SCORE = {calculate};
})();
