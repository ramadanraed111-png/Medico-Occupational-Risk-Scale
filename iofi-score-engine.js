/* IOFI experimental numeric layer v1.0.
 * Uses the project concept formula. Provisional equal weights/means are explicit
 * software conventions pending occupational expert calibration and governance approval.
 * The evidence/gate layer remains IOFI_ENGINE and is never overridden by this score.
 */
(function(root){
 "use strict";
 const clamp=n=>Math.max(0,Math.min(100,n));
 const score=v=>v!==null&&v!==undefined&&v!==""&&Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=100;
 function calculate({hse={},medical={},finalDecision=null}={}){
  const gaps=[],alerts=[],items=Array.isArray(hse.hazards?.items)?hse.hazards.items:[];
  if(!items.length)gaps.push("OERI: لا توجد أخطار JEM مسجلة.");
  const hazards=items.map((x,i)=>{
   const S=Number(x.severity),F=Number(x.frequency_scale),D=Number(x.duration_scale),P=Number(x.probability_scale),C=Number(x.control_effectiveness);
   const valid=S>=1&&S<=5&&F>=1&&F<=5&&D>=1&&D<=5&&P>=1&&P<=5&&C>=0&&C<=1&&x.control_effectiveness!=="";
   if(!valid)gaps.push("OERI: استكمال الشدة والتكرار والمدة واحتمالية التعرض وفعالية التحكم للخطر رقم "+(i+1)+" ("+(x.name||"غير مسمى")+")");
   const inherent=valid?S*F*D*P:null,residual=valid?inherent*(1-C):null;
   if(x.residual==="critical")alerts.push("خطر متبقٍ حرج مسجل في JEM: "+(x.name||"الخطر رقم "+(i+1)));
   return {name:x.name||"الخطر "+(i+1),severity:S,frequency:F,duration:D,probability:P,control_effectiveness:C,inherent,residual,valid};
  });
  // w_i = 1 is a provisional equal-weight convention; no hazard weighting is yet approved.
  const OERI=hazards.length&&hazards.every(x=>x.valid)?clamp(100*hazards.reduce((a,x)=>a+x.residual,0)/(hazards.length*625)):null;
  const ih=medical.iofi?.ihvi||{},ihFields=[["medical_stability","استقرار الحالة الصحية"],["functional_capacity","القدرة الوظيفية الحالية"],["exposure_susceptibility","القابلية للتأثر بالتعرضات"],["emergency_response","القدرة على الاستجابة للطوارئ"],["treatment_monitoring","متطلبات العلاج والمتابعة"]];
  ihFields.forEach(([k,l])=>{if(!score(ih[k]))gaps.push("IHVI: يلزم تقدير الطبيب لمحور "+l+" من 0 إلى 100.");});
  const IHVI=ihFields.every(([k])=>score(ih[k]))?clamp(ihFields.reduce((a,[k])=>a+Number(ih[k]),0)/ihFields.length):null;
  const jt=medical.iofi?.jtci||{},jtFields=[["physical","المتطلبات البدنية"],["cognitive","المتطلبات الذهنية والمعرفية"],["psychological","المتطلبات النفسية"],["environmental","المتطلبات البيئية"],["safety_critical","المهام الحساسة للسلامة"],["emergency","متطلبات الطوارئ والإخلاء"]];
  jtFields.forEach(([k,l])=>{if(!score(jt[k]))gaps.push("JTCI: يلزم تقدير الطبيب للتوافق في محور "+l+" من 0 إلى 100.");});
  const JTCI=jtFields.every(([k])=>score(jt[k]))?clamp(jtFields.reduce((a,[k])=>a+Number(jt[k]),0)/jtFields.length):null;
  const e=hse.emergency||{},wormFields=[["site_category","فئة الموقع",["onshore","offshore","remote","near_services"]],["care_access","الوصول للرعاية الطبية",["good","moderate","limited","remote"]],["evacuation","الإسعاف والإخلاء",["ready","partial","weak","unknown"]],["communications","الاتصالات",["reliable","intermittent","poor","unknown"]],["medical_support","الدعم الطبي بالموقع",["adequate","limited","inadequate","unknown"]],["shift_pattern","نظام الورديات",["day","night","rotating"]],["isolation","العزلة",["low","moderate","high"]],["task_criticality","أهمية المهمة",["routine","important","critical"]],["environmental_conditions","الظروف البيئية",["normal","challenging","extreme"]]];
  const missingWorm=wormFields.filter(([k,,values])=>!values.includes(e[k]));
  missingWorm.forEach(([,label])=>gaps.push("WORM: استكمال "+label+"."));
  const WORM={complete:missingWorm.length===0,context:Object.fromEntries(wormFields.map(([k,label])=>[label,e[k]||"غير محدد"])),missing:missingWorm.map(x=>x[1])};
  if(e.evacuation==="weak"&&["remote","limited"].includes(e.care_access))alerts.push("قصور محتمل في الإخلاء والوصول للرعاية الطبية في الموقع؛ يلزم تقييم تشغيلي مستقل.");
  if(e.task_criticality==="critical"&&["weak","unknown"].includes(e.evacuation))alerts.push("مهمة حساسة للسلامة مع جاهزية إخلاء غير كافية أو غير متحققة.");
  if(finalDecision==="temporarily_unfit"||finalDecision==="unfit")alerts.push("الرأي الطبي النهائي يتضمن عدم التوافق مع المهمة؛ لا يجوز للمؤشر تجاوزه.");
  if(finalDecision==="specialist_review")alerts.push("الرأي الطبي يتطلب مراجعة اختصاصية.");
  const complete=OERI!==null&&IHVI!==null&&JTCI!==null&&WORM.complete;
  const total=complete?100*Math.pow(IHVI/100,.40)*Math.pow(JTCI/100,.35)*Math.pow(1-OERI/100,.25):null;
  return {model:"IOFI-MULTI-INDEX-DRAFT-1.0",status:complete?"computed_experimental":"incomplete",total:total===null?null:Math.round(total*10)/10,components:{OERI:OERI===null?null:Math.round(OERI*10)/10,IHVI:IHVI===null?null:Math.round(IHVI*10)/10,JTCI:JTCI===null?null:Math.round(JTCI*10)/10,WORM},subdomains:{IHVI:ihFields.map(([key,label])=>({key,label,value:score(ih[key])?Number(ih[key]):null})),JTCI:jtFields.map(([key,label])=>({key,label,value:score(jt[key])?Number(jt[key]):null}))},formula:"IOFI = 100 × (IHVI/100)^0.40 × (JTCI/100)^0.35 × (1 − OERI/100)^0.25",assumptions:["أوزان الأخطار متساوية مؤقتاً (wᵢ=1) لعدم وجود أوزان معتمدة في مواصفات النموذج.","محاور IHVI الخمسة ومحاور JTCI الستة يقيّمها الطبيب من 0 إلى 100، ويستخدم المتوسط المتساوي مؤقتاً.","مقاييس التكرار والمدة والاحتمالية وفعالية الضوابط التشغيلية خيارات أولية يجب تعريفها ومعايرتها.","WORM عامل سياقي لتفسير متطلبات المهمة والضوابط ولا يُستخدم كعقوبة مستقلة.","النتيجة لا تصدر تصنيف لياقة ولا تتجاوز قرار الطبيب أو قواعد السلامة الحرجة."],gaps,alerts,hazards,note:"نموذج بحثي تجريبي غير مُعاير أو مُعتمد طبياً. لا يمثل احتمال الإصابة أو تشخيصاً أو قرار لياقة. يلزم اعتماد المقاييس والأوزان وحدود التصنيف بواسطة اللجنة المختصة."};
 }
 root.MOFASA_IOFI=Object.freeze({calculate,version:"IOFI-MULTI-INDEX-DRAFT-1.0"});
})(typeof globalThis!=="undefined"?globalThis:this);
