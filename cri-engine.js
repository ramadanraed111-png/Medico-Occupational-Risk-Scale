/* MOFASA Composite Risk Index (CRI) — independent experimental engine.
 * Higher scores mean greater concern. This engine never approves/rejects fitness.
 * Draft weights and bands require expert review, calibration and validation.
 */
(() => {
  const clamp = n => Math.max(0, Math.min(100, Number(n) || 0));
  const avg = xs => xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : 0;
  const frequency = {rare:.25, occasional:.5, repeated:.75, continuous:1};
  const residual = {low:0, moderate:33.3, high:66.7, critical:100};
  const siteMaps = {
    care_access:{good:0, moderate:35, limited:70, remote:100},
    evacuation:{ready:0, partial:60, weak:100, unknown:75},
    communications:{reliable:0, intermittent:60, poor:100, unknown:75},
    medical_support:{adequate:0, limited:60, inadequate:100, unknown:75}
  };
  const fitMap = {met:0, restricted:50, not_met:100, not_assessed:null};
  const conditionScore = items => items.length ? Math.max(...items.map(x=>clamp((Number(x.level)||1)*25))) : 0;
  function calculate(input={}) {
    const hse=input.hse||{}, medical=input.medical||{};
    const hazards=Array.isArray(hse.hazards?.items)?hse.hazards.items:[];
    const tasks=hse.tasks||{}, emergency=hse.emergency||{};
    const conditions=Array.isArray(medical.diseases?.items)?medical.diseases.items:[];
    const fitness=Array.isArray(medical.capacity?.items)?medical.capacity.items:[];
    const gaps=[];
    if(!hazards.length) gaps.push("لم تُسجل أخطار مهنية");
    if(!Array.isArray(tasks.items)||!tasks.items.length) gaps.push("المهام الأساسية غير مكتملة");
    if(!emergency.care_access||!emergency.evacuation||!emergency.communications||!emergency.medical_support) gaps.push("بيانات جاهزية الموقع والطوارئ غير مكتملة");
    if(!conditions.length&&!String(medical.diseases?.notes||"").trim()) gaps.push("لم يوثق الطبيب مراجعة التاريخ المرضي أو خلوه من الحالات المسجلة");
    if(!fitness.length||fitness.some(x=>!Object.prototype.hasOwnProperty.call(fitMap,x.status)||fitMap[x.status]===null)) gaps.push("متطلبات اللياقة الأساسية غير مكتملة أو لم تُقيّم");
    if(hazards.some(x=>!Object.prototype.hasOwnProperty.call(frequency,x.frequency)||!Object.prototype.hasOwnProperty.call(residual,x.residual)||!(Number(x.severity)>=1&&Number(x.severity)<=4))) gaps.push("بعض سجلات الأخطار ينقصها الشدة أو معدل التعرض أو الخطر المتبقي");
    const hazardScores=hazards.filter(x=>Object.prototype.hasOwnProperty.call(frequency,x.frequency)&&Object.prototype.hasOwnProperty.call(residual,x.residual)&&Number(x.severity)>=1&&Number(x.severity)<=4).map(x=>{
      const exposure=clamp(Number(x.severity)*25*frequency[x.frequency]);
      return {name:x.name||"خطر مهني",score:Math.round(clamp(.4*exposure+.6*residual[x.residual])),severity:Number(x.severity),frequency:x.frequency,residual:x.residual};
    });
    const hazardValues=hazardScores.map(x=>x.score);
    let T=hazardValues.length?clamp(.7*Math.max(...hazardValues)+.3*avg(hazardValues)):null;
    if(T!==null && (tasks.safety_critical||[]).length) T=clamp(T*1.05);
    const H=conditions.length?conditionScore(conditions):(String(medical.diseases?.notes||"").trim()?0:null);
    const fitValues=fitness.map(x=>fitMap[x.status]).filter(x=>x!==null);
    const F=fitness.length&&fitValues.length===fitness.length?clamp(avg(fitValues)):null;
    const siteKeys=Object.keys(siteMaps);
    const siteReady=siteKeys.every(k=>Object.prototype.hasOwnProperty.call(siteMaps[k],emergency[k]));
    const S=siteReady?clamp(avg(siteKeys.map(k=>siteMaps[k][emergency[k]]))):null;
    if(T===null) gaps.push("تعذر حساب محور المهمة والتعرض");
    if(H===null) gaps.push("محور الحالة الصحية غير مكتمل");
    if(F===null) gaps.push("محور القدرة الوظيفية غير مكتمل");
    if(S===null) gaps.push("محور ظروف الموقع غير مكتمل");
    const complete=gaps.length===0;
    const total=complete?Math.round(clamp(.40*T+.30*H+.20*F+.10*S)):null;
    const criticalHazard=hazardScores.some(x=>x.residual==="critical"||(x.severity===4&&x.frequency==="continuous"&&["high","critical"].includes(x.residual)));
    const band=!complete?"incomplete":criticalHazard||total>=75?"critical":total>=50?"high":total>=25?"moderate":"low";
    const labels={low:"خطورة منخفضة – مقبولة",moderate:"خطورة متوسطة – تحتاج إلى قيود",high:"خطورة مرتفعة – تحتاج إلى بحث تفصيلي وتقييم متعمق",critical:"خطورة حرجة – مطلوب وقف النشاط",incomplete:"غير مكتمل – لا تصدر توصية"};
    return {model:"MOFASA-CRI-DRAFT-1.0",total,band,label:labels[band],components:{task_exposure:T===null?null:Math.round(T),health:H===null?null:Math.round(H),functional:F===null?null:Math.round(F),site:S===null?null:Math.round(S)},weights:{task_exposure:40,health:30,functional:20,site:10},formula:"CRI = 0.40T + 0.30H + 0.20F + 0.10S",hazard_details:hazardScores,gaps,critical_override:criticalHazard,note:"مؤشر تجريبي غير مُعاير أو مُعتمد. لا يمثل احتمال الإصابة أو تشخيصاً، ولا يصدر قرار لياقة. النتيجة الحرجة تنبه إلى وقف النشاط المعني مؤقتاً وتطبيق إجراءات السيطرة والتقييم."};
  }
  window.MOFASA_CRI={calculate};
})();