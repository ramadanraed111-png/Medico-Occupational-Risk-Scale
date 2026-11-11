/* POFRI provisional weighted score: transparent presentation/calibration draft only.
 * Higher values mean greater concern or gap, not better performance.
 * It never changes the A/B/C/D rule result.
 */
(() => {
 const clamp=n=>Math.max(0,Math.min(100,Number(n)||0));
 const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
 const maps={
  frequency:{rare:.4,occasional:.6,repeated:.8,continuous:1},
  controls:{effective:.35,partial:.65,weak:1,unknown:1},
  residual:{low:0,moderate:33.3,high:66.7,critical:100},
  medicalFit:{compatible:0,restricted:50,temporary:80,incompatible:100,pending:75},
  capacity:{adequate:0,limited:60,insufficient:100,unknown:75},
  demand:{low:0,moderate:33,high:67,very_high:100},
  care:{good:0,moderate:35,limited:70,remote:100},
  evacuation:{ready:0,partial:60,weak:100,unknown:75},
  communications:{reliable:0,intermittent:60,poor:100,unknown:75},
  support:{adequate:0,limited:60,inadequate:100,unknown:75}
 };
 const has=(m,k)=>Object.prototype.hasOwnProperty.call(m,k);
 const pick=(m,k,f=75)=>has(m,k)?m[k]:f;
 const averageHazard=(items,controls)=>{
  if(!items.length)return null;
  const cf=pick(maps.controls,controls,1);
  const scores=items.map(x=>clamp((Number(x.severity)||1)*25)*pick(maps.frequency,x.frequency,.6)*cf);
  return {score:clamp(.7*Math.max(...scores)+.3*mean(scores)),max:Math.max(...scores),average:mean(scores),count:items.length};
 };
 const siteLabels={
  care:{good:"متاح سريعاً",moderate:"متوسط",limited:"محدود",remote:"بعيد / صعب الوصول"},
  evacuation:{ready:"خطة وموارد جاهزة ومختبرة",partial:"متاحة جزئياً",weak:"غير كافية",unknown:"غير متحقق منها"},
  communications:{reliable:"موثوقة",intermittent:"متقطعة",poor:"ضعيفة",unknown:"غير متحقق منها"},
  support:{adequate:"كافية",limited:"محدودة",inadequate:"غير كافية",unknown:"غير محددة"}
 };
 function calculate(d){
  const hazards=Array.isArray(d.jem_items)?d.jem_items:[];
  const hp=averageHazard(hazards,d.controls);
  const tra=pick(maps.residual,d["residual-risk"],75);
  const R=clamp(hp?.score!==undefined?.65*hp.score+.35*tra:tra);
  const fit=pick(maps.medicalFit,d["medical-fit"],75);
  const conditions=Array.isArray(d.mcm_items)?d.mcm_items:[];
  const conditionScore=conditions.length?Math.max(...conditions.map(x=>clamp((Number(x.level)||1)*25))):0;
  const M=clamp(.7*fit+.3*conditionScore);
  const capacity=pick(maps.capacity,d.capacity,75);
  const demands=[pick(maps.demand,d.physical,50),pick(maps.demand,d.cognitive,50)];
  const F=clamp(.65*capacity+.35*Math.max(...demands));
  const siteInputs=[
   {key:"care",value:d["care-access"],map:maps.care,label:"زمن الوصول للرعاية الطبية"},
   {key:"evacuation",value:d.evacuation,map:maps.evacuation,label:"الإسعاف والإخلاء"},
   {key:"communications",value:d.communications,map:maps.communications,label:"الاتصالات والطوارئ"},
   {key:"support",value:d["site-support"],map:maps.support,label:"ملاءمة دعم الموقع للمخاطر الطبية"}
  ];
  const siteComplete=siteInputs.every(x=>has(x.map,x.value));
  const siteBreakdown=siteInputs.map(x=>({key:x.key,label:x.label,choice:siteLabels[x.key][x.value]||"غير مكتمل",score:has(x.map,x.value)?x.map[x.value]:null}));
  const E=siteComplete?clamp(mean(siteBreakdown.map(x=>x.score))):null;
  const complete=has(maps.residual,d["residual-risk"])&&has(maps.controls,d.controls)&&has(maps.medicalFit,d["medical-fit"])&&has(maps.capacity,d.capacity)&&has(maps.demand,d.physical)&&has(maps.demand,d.cognitive)&&siteComplete;
  const total=complete?Math.round(clamp(.30*R+.30*M+.25*F+.15*E)):null;
  const band=total===null?"غير مكتمل":total<25?"منخفض مبدئياً":total<50?"متوسط مبدئياً":total<75?"مرتفع مبدئياً":"مرتفع جداً مبدئياً";
  return {
   model:"POFRI-WEIGHTED-DRAFT-1.1",total,band,
   components:{R:Math.round(R),M:Math.round(M),F:Math.round(F),E:E===null?null:Math.round(E)},
   details:{hazard_profile:hp?Math.round(hp.score):null,tra_residual:Math.round(tra),medical_compatibility:Math.round(fit),medical_conditions:Math.round(conditionScore),functional_capacity:Math.round(capacity),job_demands:Math.round(Math.max(...demands)),hazard_count:hazards.length,site_breakdown:siteBreakdown,site_complete:siteComplete},
   formula:"0.30R + 0.30M + 0.25F + 0.15E",
   meaning:"المؤشر يقيس مستوى القلق أو الفجوات المحتملة في ملاءمة العامل للمهمة وظروف الموقع. 0 يعني أقل مستوى قلق وفق المدخلات، و100 يعني أعلى مستوى قلق. لا يعني الرقم نسبة احتمال الإصابة أو نسبة اللياقة.",
   band_note:"النطاقات المعروضة وصفية وافتراضية للنقاش فقط، وليست حدوداً سريرية أو مهنية مُعايرة.",
   limitation:"درجة تجريبية غير معايرة؛ لا تغيّر تصنيف A/B/C/D ولا تتجاوز بوابات الأمان أو الحكم الطبي."
  };
 }
 window.POFRI_EXPERIMENTAL_SCORE={calculate};
})();
