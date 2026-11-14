/* IOFI live-data calculation engine v1.1. Experimental decision support only. */
(function(root){"use strict";
const clamp=n=>Math.max(0,Math.min(100,n)),validScore=v=>v!==null&&v!==undefined&&v!==""&&Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=100,text=v=>String(v??"").trim(),mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null,name=x=>text(x.item||x.name||x.task||"");
const domains=[
{key:"physical",label:"المتطلبات البدنية",words:["بدني","مجهود","تحمل","عضلي","حرك","اتزان","سلم","ارتفاع","تنفس","mobility","balance","ladder","respirator","cardio","strength","physical","climb"]},
{key:"cognitive",label:"المتطلبات الذهنية والمعرفية",words:["تركيز","انتباه","حكم","قرار","إبصار","سمع","تواصل","وعي","concentration","vision","hearing","consciousness","cognitive","decision"]},
{key:"psychological",label:"المتطلبات النفسية والتنظيمية",words:["نفسي","ضغط","ورديات","ليلي","إجهاد","psychological","stress","shift","fatigue"]},
{key:"environmental",label:"المتطلبات البيئية والتعرض",words:["حرارة","كيميائ","ضوضاء","غاز","مغلق","نائي","تعرض","environment","chemical","noise","confined","remote","exposure"]},
{key:"safety_critical",label:"المهام الحساسة للسلامة",words:["قيادة","تشغيل","معدات","رافعة","كهرباء","حفر","حرج","سلامة","driving","vehicle","machinery","crane","electrical","critical","safety"]},
{key:"emergency",label:"متطلبات الطوارئ والإخلاء",words:["طوارئ","إخلاء","استجابة","إنقاذ","حريق","emergency","evacuation","rescue","fire"]}];
function classify(x){const s=name(x).toLocaleLowerCase("ar");return domains.find(d=>d.words.some(w=>s.includes(w)))?.key||"general";}
function calculate({hse={},medical={},finalDecision=null}={}){
const gaps=[],alerts=[],hazards=Array.isArray(hse.hazards?.items)?hse.hazards.items:[];
if(!hazards.length)gaps.push("OERI: لا توجد أخطار JEM مسجلة.");
const hazardRows=hazards.map((x,i)=>{const S=Number(x.severity),F=Number(x.frequency_scale),D=Number(x.duration_scale),P=Number(x.probability_scale),C=Number(x.control_effectiveness),valid=[S,F,D,P].every(n=>Number.isInteger(n)&&n>=1&&n<=5)&&Number.isFinite(C)&&C>=0&&C<=1&&x.control_effectiveness!=="";
if(!valid)gaps.push("OERI: استكمال مقاييس الخطر وفعالية التحكم: "+(x.name||("رقم "+(i+1)))+".");
const inherent=valid?S*F*D*P:null,residual=valid?inherent*(1-C):null,residual_score=valid?clamp(residual/625*100):null;
if(x.residual==="critical")alerts.push("الخطر المتبقي مصنف حرج في JEM: "+(x.name||("الخطر "+(i+1)))+".");
if(valid&&residual_score>=60)alerts.push("درجة الخطر المتبقي الحسابية مرتفعة في: "+(x.name||("الخطر "+(i+1)))+".");
return {category:x.category||"",name:x.name||("الخطر "+(i+1)),severity:S,frequency:F,duration:D,probability:P,control_effectiveness:C,inherent,residual,residual_score,valid,residual_class:x.residual||"غير محدد"};});
const OERI=hazardRows.length&&hazardRows.every(x=>x.valid)?clamp(mean(hazardRows.map(x=>x.residual_score))):null;
const ih=medical.iofi?.ihvi||{},ev=medical.iofi?.ihvi_evidence||{},ihFields=[["medical_stability","استقرار الحالة الصحية"],["functional_capacity","القدرة الوظيفية الحالية"],["exposure_susceptibility","القابلية للتأثر بالتعرضات"],["emergency_response","القدرة على الاستجابة للطوارئ"],["treatment_monitoring","متطلبات العلاج والمتابعة"]];
ihFields.forEach(([k,l])=>{if(!validScore(ih[k]))gaps.push("IHVI: لم يسجل الطبيب درجة صحيحة لمحور "+l+".");if(!text(ev[k]))gaps.push("IHVI: يلزم توثيق أساس التقدير لمحور "+l+".");});
const IHVI=ihFields.every(([k])=>validScore(ih[k])&&text(ev[k]))?clamp(mean(ihFields.map(([k])=>Number(ih[k])))):null;
const fit=Array.isArray(medical.capacity?.items)?medical.capacity.items:[],demands=Array.isArray(hse.demands?.selected)?hse.demands.selected:[],tasks=Array.isArray(hse.tasks?.items)?hse.tasks.items:[];
if(!fit.length)gaps.push("JTCI: لا توجد عناصر Fitness Essentials مرتبطة بالوظيفة.");
const scoreMap={met:100,restricted:60,not_met:0};
const mapped=fit.map(x=>{const status=x.status||"not_assessed",evidence=text(x.evidence),score=scoreMap[status],domain=classify(x);if(score===undefined)gaps.push("JTCI: لم يقيّم عنصر القدرة الوظيفية: "+name(x)+".");if(!evidence)gaps.push("JTCI: يلزم توثيق دليل تقييم العنصر: "+name(x)+".");if(status==="restricted")alerts.push("قيد وظيفي مسجل: "+name(x)+".");if(status==="not_met")alerts.push("متطلب وظيفي غير مستوفٍ: "+name(x)+". يلزم مراجعة الطبيب.");return {item:name(x),status,score:score===undefined?null:score,evidence,domain,valid:score!==undefined&&!!evidence};});
const JTCI=mapped.length&&mapped.every(x=>x.valid)?clamp(mean(mapped.map(x=>x.score))):null;
const subdomains=domains.map(d=>{const a=mapped.filter(x=>x.domain===d.key);return {key:d.key,label:d.label,value:a.length&&a.every(x=>x.valid)?mean(a.map(x=>x.score)):null,items:a.map(x=>x.item),count:a.length};});
const general=mapped.filter(x=>x.domain==="general");subdomains.push({key:"general",label:"متطلبات أخرى مرتبطة بالوظيفة",value:general.length&&general.every(x=>x.valid)?mean(general.map(x=>x.score)):null,items:general.map(x=>x.item),count:general.length});
const e=hse.emergency||{},wf=[["site_category","فئة الموقع"],["care_access","الوصول للرعاية الطبية"],["evacuation","الإسعاف والإخلاء"],["communications","الاتصالات"],["medical_support","الدعم الطبي بالموقع"],["shift_pattern","نظام الورديات"],["isolation","العزلة"],["task_criticality","أهمية المهمة"],["environmental_conditions","الظروف البيئية"]],missing=wf.filter(([k])=>!text(e[k]));
missing.forEach(([,l])=>gaps.push("WORM: استكمال "+l+"."));
const WORM={complete:missing.length===0,context:Object.fromEntries(wf.map(([k,l])=>[l,text(e[k])||"غير مسجل"])),missing:missing.map(x=>x[1])};
if(["weak","unknown"].includes(e.evacuation))alerts.push("جاهزية الإسعاف والإخلاء ضعيفة أو غير متحققة.");
if(["poor","unknown"].includes(e.communications))alerts.push("الاتصالات ضعيفة أو غير متحققة.");
if(["inadequate","unknown"].includes(e.medical_support))alerts.push("الدعم الطبي بالموقع غير كافٍ أو غير متحقق.");
const criticalHazard=hazardRows.some(x=>x.residual_class==="critical"),criticalSite=e.task_criticality==="critical"&&["weak","unknown"].includes(e.evacuation),medicalHold=["temporarily_unfit","unfit","specialist_review"].includes(finalDecision);
if(medicalHold)alerts.push("الرأي الطبي النهائي يتطلب وقف احتساب النتيجة لحين المراجعة.");
if(finalDecision==="fit_with_restrictions")alerts.push("الرأي الطبي يتضمن قيوداً يجب التحقق من تنفيذها.");
const complete=OERI!==null&&IHVI!==null&&JTCI!==null&&WORM.complete,blocked=criticalHazard||criticalSite||medicalHold,raw=complete?100*Math.pow(IHVI/100,.40)*Math.pow(JTCI/100,.35)*Math.pow(1-OERI/100,.25):null,total=raw===null||blocked?null:Math.round(raw*10)/10;
return {model:"IOFI-LIVE-DATA-DRAFT-1.1",status:!complete?"incomplete":blocked?"hold_for_human_review":"computed_experimental",total,components:{OERI:OERI===null?null:Math.round(OERI*10)/10,IHVI:IHVI===null?null:Math.round(IHVI*10)/10,JTCI:JTCI===null?null:Math.round(JTCI*10)/10,WORM},subdomains:{IHVI:ihFields.map(([key,label])=>({key,label,value:validScore(ih[key])?Number(ih[key]):null,evidence:text(ev[key])})),JTCI:subdomains},job_context:{job_title:medical.job_title||"",task_name:medical.task_name||"",selected_demands:demands,tasks,safety_critical:hse.tasks?.safety_critical||[],fitness_items:mapped},formula:"IOFI = 100 × (IHVI/100)^0.40 × (JTCI/100)^0.35 × (1 − OERI/100)^0.25",weights:{IHVI:.40,JTCI:.35,OERI:.25},critical_gate:{blocked,critical_hazard:criticalHazard,critical_site_readiness:criticalSite,medical_hold:medicalHold},gaps,alerts,hazards:hazardRows,assumptions:["الأوزان 40% و35% و25% افتراضات تجريبية غير معتمدة.","IHVI متوسط متساوي للمحاور الطبية الخمسة التي يقيّمها الطبيب؛ لا تُستنتج الدرجات آلياً من التشخيصات أو التحاليل.","JTCI متوسط نتائج Fitness Essentials: مستوفٍ=100، مستوفٍ بقيود=60، غير مستوفٍ=0. يلزم توثيق دليل لكل عنصر.","تصنيف محاور JTCI الفرعية يعتمد على كلمات دلالية ظاهرة وقابلة للمراجعة، وليس تصنيفاً وظيفياً معتمداً.","OERI متوسط متساوي لدرجات الأخطار: الشدة×التكرار×المدة×الاحتمالية×(1−فعالية التحكم)، مقسوماً على 625 ثم ×100.","WORM سياق تشغيلي لا يدخل كخصم عددي؛ القصور الحرج قد يوقف النتيجة.","البيانات الناقصة لا تعامل كصفر أو كدليل سلامة.","المحرك لا يصدر تشخيصاً أو قرار لياقة ولا يتجاوز حكم الطبيب أو قواعد السلامة الحرجة."],note:"نسخة تجريبية للعرض والمراجعة. لا تمثل احتمال الإصابة أو التشخيص أو قرار اللياقة. يلزم اعتماد المقاييس والأوزان وحدود التفسير من اللجنة المختصة."};
}
root.MOFASA_IOFI=Object.freeze({calculate,version:"IOFI-LIVE-DATA-DRAFT-1.1"});
})(typeof globalThis!=="undefined"?globalThis:this);
