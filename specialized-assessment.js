/* POFRI Specialist Job Fitness Assessment — provisional gate-based workflow.
 * Uses existing pofri_assessments JSONB fields; no legacy MORS data or schema is changed.
 */
(()=> {
 const $=id=>document.getElementById(id);
 const root=$("specialist-content"); if(!root)return;
 const jem=window.POFRI_JEM_LIBRARY||[], med=window.POFRI_MEDICAL_LIBRARY||[];
 const profiles={
  "Control Room Operator":{
   title:"Control Room Operator",
   tasks:["Continuous process monitoring","Alarm management","Emergency response duties","Rapid decision making","High concentration","Extended screen work","Night shifts"],
   hazards:["الضوضاء","الجلوس الطويل","الإجهاد الوظيفي","العمل بنظام الورديات","العمل بالمواقع النائية"],
   demands:["Prolonged Sitting","Shift Work","Operating Process Equipment","Safety Critical Decisions"],
   essentials:["Normal Consciousness","No Uncontrolled Epilepsy","Adequate Mobility","Normal Balance","Adequate Hearing","Adequate Vision","Cardiovascular Fitness"],
   conditional:["Safe Ladder Climbing (if applicable)","Ability to Wear Respirator (if required by emergency duties)"]
  }
 };
 const duties=["Driving","Crane operation","Working at height","Confined space entry","First aid and Emergency response","Firefighting team","Rescue team"];
 const demandList=["Walking","Stair Climbing","Manual Handling","Prolonged Standing","Prolonged Sitting","Climbing Ladders","Heavy Lifting","Kneeling","Working Outdoors","Shift Work","Working at Height","Operating Process Equipment","Respirator Usage","Driving Vehicles","Operating Heavy Equipment","Safety Critical Decisions"];
 const siteList=["Off-Shore Location","Remote Areas","Town Based"];
 const physical=["Lifting","Carrying","Climbing","Kneeling","Reaching","Long standing","Walking","Balance","Exercise"];
 const cognitive=["Concentration","Judgement","Decision-Making","Reaction time"];
 const psychological=["Emotional Stability","Stress Tolerance","Impulse Control"];
 let hazards=[], diseases=[], extraTests=[], extraTasks=[];
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const opts=(arr,selected="")=>'<option value="">اختر</option>'+arr.map(x=>'<option value="'+esc(x.value??x)+'" '+((x.value??x)===selected?"selected":"")+'>'+esc(x.label??x)+'</option>').join("");
 const checkList=(items,name,checked=[])=>'<div class="specialist-checks">'+items.map((x,i)=>'<label class="specialist-check"><input type="checkbox" name="'+name+'" value="'+esc(x)+'" '+(checked.includes(x)?"checked":"")+'><span>'+esc(x)+'</span></label>').join("")+'</div>';
 const section=(n,title,desc,body)=>'<section class="specialist-section"><h4>'+n+'. '+title+'</h4><p>'+desc+'</p>'+body+'</section>';
 function hazardNames(){return jem.map(x=>({category:x.category,name:x.name,levels:x.levels||[]}));}
 function hazardOptionList(){return hazardNames().map(x=>({value:x.name,label:x.category+" — "+x.name}));}
 function renderBase(){
  const workerOpts=((typeof workerRows!=="undefined"?workerRows:[])).map(w=>({value:w.id,label:w.full_name+" — "+w.registration_number}));
  root.innerHTML=
   section("بيانات","بيانات العامل والوظيفة","اختر الوظيفة أولاً لتحميل ملف متطلباتها. يمكن تحميل بيانات عامل مسجل.",'<div class="specialist-grid"><label>الوظيفة المحددة *<select id="sp-job">'+opts([{value:"Control Room Operator",label:"Control Room Operator"},{value:"__custom__",label:"وظيفة أخرى — إعداد يدوي"}])+'</select></label><label id="sp-custom-job-wrap" hidden>اسم الوظيفة المخصصة<input id="sp-custom-job" placeholder="اكتب المسمى الوظيفي"></label><label>تحميل عامل مسجل<select id="sp-worker">'+opts(workerOpts)+'</select></label><label>اسم العامل *<input id="sp-name" required></label><label>الرقم الوظيفي *<input id="sp-reg" required></label><label>تاريخ الميلاد<input id="sp-dob" type="date"></label><label>تاريخ التقييم *<input id="sp-date" type="date" required></label><label>الموقع *<input id="sp-site" required placeholder="مثال: بدر-3 / Offshore"></label><label>الطبيب / المقيم *<input id="sp-doctor" required></label><label>مسؤول السلامة<input id="sp-hse"></label><label>مدة الوردية / المهمة<input id="sp-duration" placeholder="مثال: 12 ساعة"></label></div>')+
   '<div id="sp-profile-note" class="notice">سيتم تحميل متطلبات الوظيفة المختارة تلقائياً. راجعها وعدّل ما ينطبق على الوظيفة الفعلية.</div>'+
   section("1","Essential Job Tasks","تظهر من ملف الوظيفة. حدّد المهام التي تنطبق فعلياً على العامل.",'<div id="sp-tasks" class="specialist-checks"></div><div class="specialist-grid"><label>مهمة إضافية<input id="sp-extra-task-input" placeholder="أضف مهمة أساسية خاصة بالموقع"></label><button type="button" class="secondary" id="sp-add-task">إضافة مهمة</button></div><div id="sp-extra-task-list"></div><label>ملاحظات حول المهام<textarea id="sp-extra-tasks" rows="2"></textarea></label>')+
   section("2","Occupational Hazards","تظهر الأخطار المقترحة من مكتبة JEM الحالية. يستكمل مسؤول السلامة الشدة والتعرض وفعالية الضوابط لكل خطر.",'<div class="specialist-grid"><label>إضافة خطر من مكتبة JEM<select id="sp-hazard-select">'+opts(hazardOptionList())+'</select></label><button type="button" class="secondary" id="sp-add-hazard">إضافة خطر</button><label>خطر مخصص<input id="sp-custom-hazard" placeholder="اسم الخطر غير الموجود"></label><button type="button" class="secondary" id="sp-add-custom-hazard">إضافة خطر مخصص</button></div><div id="sp-hazards"></div>')+
   section("3","Safety-Critical Duties","حدد الواجبات الحساسة للسلامة التي يؤديها العامل فعلياً.",checkList(duties,"sp-duty"))+
   section("4","Job Demands","تظهر المتطلبات الافتراضية للوظيفة ويمكن لمسؤول السلامة تعديلها وإضافة متطلبات أخرى.",checkList(demandList,"sp-demand",profiles["Control Room Operator"].demands)+'<label>متطلبات أخرى<input id="sp-extra-demand" placeholder="اكتب متطلباً ثم اضغط إضافة"></label><button type="button" class="secondary" id="sp-add-demand">إضافة متطلب</button><div id="sp-extra-demands"></div>')+
   section("5","Site Category & Emergency Readiness","حدد فئة الموقع، ثم استكمل تجهيزات الرعاية الطبية والاتصالات والإخلاء.",checkList(siteList,"sp-site-category")+'<label>فئة / وصف موقع آخر<input id="sp-other-site"></label><div class="specialist-grid"><label>الوصول للرعاية الطبية<select id="sp-care">'+opts([{value:"good",label:"متاح سريعاً"},{value:"moderate",label:"متوسط"},{value:"limited",label:"محدود"},{value:"remote",label:"بعيد / صعب الوصول"}])+'</select></label><label>الإسعاف والإخلاء<select id="sp-evac">'+opts([{value:"ready",label:"خطة وموارد جاهزة ومختبرة"},{value:"partial",label:"متاحة جزئياً"},{value:"weak",label:"غير كافية"},{value:"unknown",label:"غير متحقق منها"}])+'</select></label><label>الاتصالات والطوارئ<select id="sp-comms">'+opts([{value:"reliable",label:"موثوقة"},{value:"intermittent",label:"متقطعة"},{value:"poor",label:"ضعيفة"},{value:"unknown",label:"غير متحقق منها"}])+'</select></label><label>ملاءمة دعم الموقع للمخاطر الطبية<select id="sp-support">'+opts([{value:"adequate",label:"كافية"},{value:"limited",label:"محدودة"},{value:"inadequate",label:"غير كافية"},{value:"unknown",label:"غير محددة"}])+'</select></label></div>')+
   section("6","Clinical Examination Findings","يستكمل طبيب الموقع النتائج الفعلية. أدخل القياسات كما وردت في الملف الطبي؛ لا يقوم النظام بتفسير القيم المخبرية أو تشخيص الأمراض.",'<fieldset class="specialist-fieldset"><legend>Basic Examination</legend><div class="specialist-grid">'+["General Appearance","Blood Pressure","Cardiovascular System","Respiratory System","Musculoskeletal System","Neurological System","Vision","Hearing","Balance & Coordination","Other"].map((x,i)=>'<label>'+x+'<input data-clinical="'+esc(x)+'" placeholder="النتيجة / الملاحظة"></label>').join("")+'</div></fieldset><fieldset class="specialist-fieldset"><legend>Labs & Imaging — Basic</legend><div class="specialist-grid">'+["CBC","AST","ALT","Creatinine","Lipid Profile","FBS","HbA1c","Chest X-Ray","Ultrasound","Other"].map(x=>'<label>'+x+'<input data-lab="'+esc(x)+'" placeholder="النتيجة / التاريخ"></label>').join("")+'</div></fieldset><fieldset class="specialist-fieldset"><legend>Additional Investigations</legend><div class="specialist-grid">'+["ECG","Spirometry","Audiometry"].map(x=>'<label>'+x+'<input data-additional="'+esc(x)+'" placeholder="النتيجة / التاريخ"></label>').join("")+'</div><label>فحوصات إضافية أخرى<input id="sp-additional-other"></label></fieldset><fieldset class="specialist-fieldset"><legend>Required Investigations — يحددها الطبيب حسب الوظيفة</legend><div class="specialist-grid"><label>الفحص المطلوب<input id="sp-required-name"></label><label>النتيجة / الحالة<input id="sp-required-result" placeholder="لم يُجرَ / النتيجة"></label><button type="button" class="secondary" id="sp-add-required">إضافة فحص مطلوب</button></div><div id="sp-required-list"></div></fieldset>')+
   section("7","Diseases Matrix","نفس مكتبة الأمراض الحالية ذات المستويات الأربعة؛ تسجيل المرض لا يصدر قراراً آلياً بمفرده.",'<div class="specialist-grid"><label>فئة المرض<select id="sp-disease-category">'+opts(med.map(c=>({value:c.category,label:c.label})))+'</select></label><label>المرض<select id="sp-disease" disabled>'+opts([])+'</select></label><label>مستوى الحالة<select id="sp-disease-level" disabled>'+opts([{value:"1",label:"Level 1"},{value:"2",label:"Level 2"},{value:"3",label:"Level 3"},{value:"4",label:"Level 4"}])+'</select></label></div><label>ملاحظات سريرية<input id="sp-disease-note"></label><button type="button" class="secondary" id="sp-add-disease">إضافة الحالة</button><div id="sp-diseases"></div>')+
   section("8","Functional Capacity Assessment","يحدد الطبيب حالة كل قدرة مقارنة بمتطلبات الوظيفة: Good أو Impaired أو Not assessed. أي قصور أو نقص بيانات يستلزم مراجعة قبل اعتماد الملاءمة.",'<div id="sp-capacities"></div>')+
   section("9","Fitness Essentials","تظهر المتطلبات الأساسية حسب الوظيفة. ضع علامة فقط على المتطلب الذي تم التحقق من استيفائه. أي متطلب غير محدد يمنع إصدار نتيجة «مستوفي» ويؤجل القرار.",'<div id="sp-essentials" class="specialist-checks"></div><label>متطلبات أساسية إضافية<input id="sp-extra-essential"></label><button type="button" class="secondary" id="sp-add-essential">إضافة متطلب أساسي</button><div id="sp-extra-essentials"></div><div class="specialist-grid"><label>الرأي الطبي النهائي *<select id="sp-medical-opinion">'+opts([{value:"",label:"اختر الرأي الطبي"},{value:"compatible",label:"متوافق مع متطلبات الوظيفة"},{value:"review",label:"يحتاج مراجعة / فحوصات إضافية"},{value:"incompatible",label:"غير متوافق مع متطلبات الوظيفة"}])+'</select></label><label>ملاحظات الطبيب<textarea id="sp-doctor-notes" rows="2"></textarea></label></div>');
  $("sp-job").value="Control Room Operator";
  renderProfile("Control Room Operator");
  renderCapacities();renderHazards();renderDiseases();renderExtras();
 }
 function renderProfile(job){
  const p=profiles[job]||null;$("sp-custom-job-wrap").hidden=job!=="__custom__";
  $("sp-profile-note").textContent=p?"تم تحميل ملف تجريبي أولي لوظيفة "+p.title+". يجب على مسؤول السلامة والطبيب مراجعة المتطلبات وتأكيد ملاءمتها للموقع الفعلي قبل الاعتماد.":"لم يتم إعداد ملف معتمد لهذه الوظيفة. أدخل المتطلبات يدوياً، وسيظل القرار مؤجلاً حتى استكمالها ومراجعتها.";
  $("sp-tasks").innerHTML=(p?.tasks||[]).map(x=>'<label class="specialist-check"><input type="checkbox" name="sp-task" value="'+esc(x)+'" checked><span>'+esc(x)+'</span></label>').join("")||'<p>أضف المهام الإلزامية يدوياً في الملاحظات.</p>';
  document.querySelectorAll('input[name="sp-demand"]').forEach(x=>x.checked=!!p?.demands.includes(x.value));
  $("sp-essentials").innerHTML=(p?.essentials||[]).map(x=>'<label class="specialist-check"><input type="checkbox" name="sp-essential" value="'+esc(x)+'"><span>'+esc(x)+'</span></label>').join("");
  if(p?.conditional?.length){$("sp-essentials").insertAdjacentHTML("beforeend",p.conditional.map(x=>'<label class="specialist-check"><input type="checkbox" name="sp-essential-conditional" value="'+esc(x)+'"><span>'+esc(x)+' <em>(مشروط بالانطباق)</em></span></label>').join(""));}
  const matches=(p?.hazards||[]).map(term=>jem.find(x=>x.name.toLowerCase().includes(term.toLowerCase()))).filter(Boolean);
  hazards=matches.map(x=>({name:x.name,category:x.category,levels:x.levels,severity:"",exposure:"",control:"",notes:"",source:"JEM"}));
  renderHazards();
 }
 function renderHazards(){
  const box=$("sp-hazards");if(!hazards.length){box.innerHTML='<p class="specialist-help">لم تتم إضافة أخطار بعد. يجب على مسؤول السلامة تحديد الأخطار الفعلية وإكمال تقييمها.</p>';return;}
  box.innerHTML=hazards.map((h,i)=>'<div class="specialist-section"><div class="workspace-head"><strong>'+esc(h.category)+" — "+esc(h.name)+'</strong><button type="button" class="secondary" data-sp-remove-hazard="'+i+'">حذف</button></div><div class="specialist-grid"><label>Hazard Severity<select data-hazard="'+i+'" data-key="severity">'+opts(h.levels.map((x,j)=>({value:String(j+1),label:"Level "+(j+1)+" — "+x})),h.severity)+'</select></label><label>Hazard Exposure<select data-hazard="'+i+'" data-key="exposure">'+opts([{value:"1",label:"1 — Rare"},{value:"2",label:"2 — Occasional"},{value:"3",label:"3 — Repeated"},{value:"4",label:"4 — Continuous"}],h.exposure)+'</select></label><label>Control Measures<select data-hazard="'+i+'" data-key="control">'+opts([{value:"1",label:"1 — Effective, verified"},{value:"2",label:"2 — Partially effective"},{value:"3",label:"3 — Weak / incomplete"},{value:"4",label:"4 — Absent / unverified"}],h.control)+'</select></label></div><label>تفاصيل القياس والضوابط<input data-hazard="'+i+'" data-key="notes" value="'+esc(h.notes)+'"></label></div>').join("");
 }
 function renderCapacities(){
  const groups=[["Physical Capacity Condition",physical],["Cognitive Capacity Condition",cognitive],["Psychological Capacity Condition",psychological]];
  $("sp-capacities").innerHTML=groups.map(([g,items])=>'<fieldset class="specialist-fieldset"><legend>'+g+'</legend><div class="specialist-grid">'+items.map(x=>'<label>'+x+'<select data-capacity="'+esc(g)+'" data-item="'+esc(x)+'">'+opts([{value:"",label:"Not assessed"},{value:"good",label:"Good"},{value:"impaired",label:"Impaired"}])+'</select></label>').join("")+'</div></fieldset>').join("")+'<label>قدرات أخرى<input id="sp-capacity-other"></label><button type="button" class="secondary" id="sp-add-capacity">إضافة قدرة</button><div id="sp-extra-capacities"></div>';
 }
 function renderDiseases(){
  const c=med.find(x=>x.category===$("sp-disease-category").value);
  const d=$("sp-disease");d.innerHTML=opts((c?.diseases||[]).map(x=>({value:x.name,label:x.name})));d.disabled=!c;
  const l=$("sp-disease-level");l.innerHTML=opts(["None","Controlled / Mild","Uncontrolled / Significant","Severe + Complications"].map((x,i)=>({value:String(i+1),label:"Level "+(i+1)+" — "+x})));l.disabled=!c;
 }
 function renderExtras(){
  $("sp-extra-task-list").innerHTML=extraTasks.map((x,i)=>'<label class="specialist-check"><input type="checkbox" name="sp-task-extra" value="'+esc(x)+'" checked><span>'+esc(x)+'</span><button type="button" data-remove-task="'+i+'">حذف</button></label>').join("");
  $("sp-extra-demands").innerHTML=extraDemand.map((x,i)=>'<label class="specialist-check"><input type="checkbox" name="sp-demand-extra" value="'+esc(x)+'" checked><span>'+esc(x)+'</span><button type="button" data-remove-demand="'+i+'">حذف</button></label>').join("");
  $("sp-extra-essentials").innerHTML=extraEssential.map((x,i)=>'<label class="specialist-check"><input type="checkbox" name="sp-essential-extra" value="'+esc(x)+'"><span>'+esc(x)+'</span><button type="button" data-remove-essential="'+i+'">حذف</button></label>').join("");
  $("sp-required-list").innerHTML=extraTests.map((x,i)=>'<div class="specialist-grid"><label>'+esc(x.name)+'<input data-required-result="'+i+'" value="'+esc(x.result)+'" placeholder="النتيجة / الحالة"></label><button type="button" class="secondary" data-remove-test="'+i+'">حذف</button></div>').join("");
  $("sp-diseases").innerHTML=diseases.map((x,i)=>'<div class="specialist-check"><span>'+esc(x.category)+" — "+esc(x.name)+" — Level "+x.level+" ("+esc(x.description)+") "+esc(x.notes)+'</span><button type="button" class="secondary" data-remove-disease="'+i+'">حذف</button></div>').join("")||'<p class="specialist-help">لا توجد أمراض مسجلة.</p>';
  document.querySelectorAll("[data-remove-task]").forEach(b=>b.onclick=()=>{extraTasks.splice(+b.dataset.removeTask,1);renderExtras()});
  document.querySelectorAll("[data-remove-demand]").forEach(b=>b.onclick=()=>{extraDemand.splice(+b.dataset.removeDemand,1);renderExtras()});
  document.querySelectorAll("[data-remove-essential]").forEach(b=>b.onclick=()=>{extraEssential.splice(+b.dataset.removeEssential,1);renderExtras()});
  document.querySelectorAll("[data-remove-test]").forEach(b=>b.onclick=()=>{extraTests.splice(+b.dataset.removeTest,1);renderExtras()});
  document.querySelectorAll("[data-remove-disease]").forEach(b=>b.onclick=()=>{diseases.splice(+b.dataset.removeDisease,1);renderExtras()});
 }
 let extraDemand=[],extraEssential=[];
 function addHazard(name){
  if(!name)return;if(hazards.some(x=>x.name===name)){alert("هذا الخطر مضاف بالفعل.");return;}
  const lib=jem.find(x=>x.name===name);hazards.push({name,category:lib?.category||"خطر مخصص",levels:lib?.levels||["منخفض","متوسط","مرتفع","حرج"],severity:"",exposure:"",control:"",notes:"",source:lib?"JEM":"custom"});renderHazards();
 }
 function read(){
  const val=id=>$(id)?.value||"";
  const checks=name=>[...document.querySelectorAll('input[name="'+name+'"]:checked')].map(x=>x.value);
  const clinical=Object.fromEntries([...document.querySelectorAll("[data-clinical]")].map(x=>[x.dataset.clinical,x.value.trim()]));
  const labs=Object.fromEntries([...document.querySelectorAll("[data-lab]")].map(x=>[x.dataset.lab,x.value.trim()]));
  const additional=Object.fromEntries([...document.querySelectorAll("[data-additional]")].map(x=>[x.dataset.additional,x.value.trim()]));
  const capacities=[...document.querySelectorAll("[data-capacity]")].map(x=>({group:x.dataset.capacity,item:x.dataset.item,status:x.value||"pending"}));
  const siteCategories=checks("sp-site-category");
  return {job:val("sp-job")==="__custom__"?(val("sp-custom-job").trim()||"وظيفة أخرى"):val("sp-job"),worker:{name:val("sp-name").trim(),registration:val("sp-reg").trim(),dob:val("sp-dob"),assessment_date:val("sp-date"),site:val("sp-site").trim(),doctor:val("sp-doctor").trim(),hse:val("sp-hse").trim(),duration:val("sp-duration").trim()},tasks:[...checks("sp-task"),...checks("sp-task-extra")],extraTasks:val("sp-extra-tasks").trim(),hazards:hazards.map(x=>({...x})),safetyCriticalDuties:checks("sp-duty"),jobDemands:[...checks("sp-demand"),...checks("sp-demand-extra")],site:{categories:siteCategories,other:val("sp-other-site"),care:val("sp-care"),evacuation:val("sp-evac"),communications:val("sp-comms"),support:val("sp-support")},clinical:{basic:clinical,labs,additional,additionalOther:val("sp-additional-other"),requiredInvestigations:extraTests.map((x,i)=>({...x,result:document.querySelector('[data-required-result="'+i+'"]')?.value||""}))},diseases:diseases.map(x=>({...x})),capacities,extraCapacity:val("sp-capacity-other"),essentials:[...checks("sp-essential"),...checks("sp-essential-conditional"),...checks("sp-essential-extra")],allEssentials:[...document.querySelectorAll('input[name="sp-essential"],input[name="sp-essential-conditional"],input[name="sp-essential-extra"]')].map(x=>({name:x.value,required:!x.name.includes("conditional"),present:x.checked})),medicalOpinion:val("sp-medical-opinion"),doctorNotes:val("sp-doctor-notes"),extraDemands:extraDemand,extraEssentials};
 }
 function decide(d){
  const reasons=[];
  if(d.medicalOpinion==="incompatible")return {code:"not_fit",label:"غير مستوفٍ لمتطلبات الوظيفة",reasons:["الرأي الطبي النهائي المسجل: غير متوافق مع متطلبات الوظيفة.",d.doctorNotes].filter(Boolean)};
  if(!d.worker.name||!d.worker.registration||!d.worker.assessment_date||!d.worker.site||!d.worker.doctor)reasons.push("بيانات العامل أو الموقع أو الطبيب غير مكتملة.");
  if(!d.tasks.length)reasons.push("لم يتم تأكيد المهام الأساسية المنطبقة.");
  if(!d.allEssentials.some(x=>x.required))reasons.push("لم يتم تحديد متطلبات اللياقة الأساسية الخاصة بهذه الوظيفة.");
  if(Object.entries(d.clinical.basic).some(([k,v])=>k!=="Other"&&!v.trim()))reasons.push("الفحص السريري الأساسي غير مكتمل؛ استكمل نتائج الفحص أو وثّق سبب عدم إجرائه.");
  if(!d.hazards.length)reasons.push("لم يتم توثيق الأخطار المهنية للوظيفة.");
  d.hazards.forEach(h=>{if(!h.severity||!h.exposure||!h.control)reasons.push("تقييم الخطر غير مكتمل: "+h.name);});
  if(!d.site.categories.length)reasons.push("لم يتم تحديد فئة الموقع.");
  if(!d.site.care||!d.site.evacuation||!d.site.communications||!d.site.support)reasons.push("تقييم جاهزية الرعاية الطبية أو الإخلاء أو الاتصالات أو دعم الموقع غير مكتمل.");
  if(d.capacities.some(x=>x.status!=="good"))reasons.push("توجد قدرة وظيفية لم تُقيّم أو سُجلت كمتأثرة؛ يلزم مراجعة الطبيب.");
  if(d.allEssentials.some(x=>x.required&&!x.present))reasons.push("يوجد متطلب أساسي للياقة لم يتم تأكيد استيفائه.");
  if(d.clinical.requiredInvestigations.some(x=>!x.result.trim()))reasons.push("توجد فحوصات إضافية مطلوبة لم تُستكمل أو لم تُسجل نتائجها.");
  if(!d.medicalOpinion||d.medicalOpinion==="review")reasons.push("الرأي الطبي يحتاج مراجعة أو لم يتم اعتماده.");
  if(d.diseases.some(x=>x.level===4))reasons.push("توجد حالة مرضية بمستوى 4 تستلزم مراجعة طبية متخصصة قبل القرار.");
  if(d.hazards.some(x=>x.severity==="4"&&x.control!=="1"))reasons.push("يوجد خطر شديد المستوى 4 دون ضابط فعّال متحقق منه؛ يلزم تقييم متخصص وإجراءات تحكم.");
  if(d.site.evacuation==="weak"||d.site.communications==="poor"||d.site.support==="inadequate")reasons.push("توجد فجوة جوهرية في جاهزية الموقع للطوارئ أو دعم الحالة الطبية.");
  if(reasons.length)return {code:"review",label:"يحتاج عرضاً على متخصص – فحوصات إضافية / استكمال بيانات",reasons};
  return {code:"fit",label:"مستوفٍ لمتطلبات الوظيفة المحددة",reasons:["تم استكمال الحقول المطلوبة، وتأكيد جميع Fitness Essentials، وتسجيل رأي طبي متوافق. يجب اعتماد النتيجة من الطبيب المسؤول والجهة المخولة."]};
 }
 function preview(){
  const d=read(),r=decide(d),box=$("specialist-result");box.hidden=false;box.className="decision "+(r.code==="fit"?"":r.code==="review"?"specialist-pending":"critical");
  $("specialist-result-label").textContent=r.label;$("specialist-result-reasons").textContent=r.reasons.join(" • ");
  $("specialist-result-note").textContent="هذه نتيجة فرز أولية مبنية على استيفاء المتطلبات الوظيفية. لا توجد أوزان أو حدود سريرية معتمدة في هذه النسخة. القرار النهائي للطبيب المختص واللجنة المخولة.";
  return {d,r};
 }
 $("sp-job").addEventListener("change",()=>{const job=$("sp-job").value;renderProfile(job);});
 $("sp-worker").addEventListener("change",()=>{const w=((typeof workerRows!=="undefined"?workerRows:[])).find(x=>x.id===$("sp-worker").value);if(!w)return;$("sp-name").value=w.full_name;$("sp-reg").value=w.registration_number;$("sp-dob").value=w.date_of_birth;$("sp-site").value=w.site||"";if(w.job_title&&profiles[w.job_title])$("sp-job").value=w.job_title;});
 $("sp-add-task").addEventListener("click",()=>{const x=$("sp-extra-task-input").value.trim();if(x&&!extraTasks.includes(x))extraTasks.push(x);$("sp-extra-task-input").value="";renderExtras();});
 $("sp-add-hazard").addEventListener("click",()=>addHazard($("sp-hazard-select").value));
 $("sp-add-custom-hazard").addEventListener("click",()=>{addHazard($("sp-custom-hazard").value.trim());$("sp-custom-hazard").value="";});
 $("sp-hazards").addEventListener("change",e=>{const i=e.target.dataset.hazard,k=e.target.dataset.key;if(i!==undefined&&k)hazards[+i][k]=e.target.value;});
 $("sp-hazards").addEventListener("input",e=>{const i=e.target.dataset.hazard,k=e.target.dataset.key;if(i!==undefined&&k)hazards[+i][k]=e.target.value;});
 $("sp-hazards").addEventListener("click",e=>{const b=e.target.closest("[data-sp-remove-hazard]");if(b){hazards.splice(+b.dataset.spRemoveHazard,1);renderHazards();}});
 $("sp-add-demand").addEventListener("click",()=>{const x=$("sp-extra-demand").value.trim();if(x&&!extraDemand.includes(x))extraDemand.push(x);$("sp-extra-demand").value="";renderExtras();});
 $("sp-add-essential").addEventListener("click",()=>{const x=$("sp-extra-essential").value.trim();if(x&&!extraEssential.includes(x))extraEssential.push(x);$("sp-extra-essential").value="";renderExtras();});
 $("sp-add-required").addEventListener("click",()=>{const name=$("sp-required-name").value.trim();if(!name)return;extraTests.push({name,result:$("sp-required-result").value.trim()});$("sp-required-name").value="";$("sp-required-result").value="";renderExtras();});
 $("sp-add-disease").addEventListener("click",()=>{const c=med.find(x=>x.category===$("sp-disease-category").value),d=c?.diseases.find(x=>x.name===$("sp-disease").value),level=+$("sp-disease-level").value;if(!c||!d||!level){alert("اختر فئة المرض والمرض والمستوى.");return;}if(diseases.some(x=>x.name===d.name)){alert("تمت إضافة المرض بالفعل.");return;}diseases.push({category:c.label,name:d.name,level,description:d.levels[level-1],notes:$("sp-disease-note").value.trim()});$("sp-disease-note").value="";renderExtras();});
 $("sp-disease-category").addEventListener("change",renderDiseases);
 $("sp-add-capacity").addEventListener("click",()=>{const x=$("sp-capacity-other").value.trim();if(!x)return;const box=$("sp-extra-capacities");box.insertAdjacentHTML("beforeend",'<label>'+esc(x)+'<select data-capacity="Other" data-item="'+esc(x)+'">'+opts([{value:"",label:"Not assessed"},{value:"good",label:"Good"},{value:"impaired",label:"Impaired"}])+'</select></label>');$("sp-capacity-other").value="";});
 $("specialist-preview").addEventListener("click",()=>preview());
 $("specialist-form").addEventListener("submit",async e=>{
  e.preventDefault();if(!user){msg("specialist-message","انتهت الجلسة؛ سجل الدخول مجدداً.","error");return;}
  const {d,r}=preview();
  if(!d.worker.name||!d.worker.registration||!d.worker.assessment_date||!d.worker.site||!d.worker.doctor){msg("specialist-message","أكمل بيانات العامل والوظيفة والموقع والطبيب قبل الحفظ.","error");return;}
  const taskName="Specialist fitness assessment — "+d.job;
  const payload={employee_name:d.worker.name,registration_number:d.worker.registration,job_title:d.job,task_name:taskName,assessment_date:d.worker.assessment_date,site:d.worker.site,evaluator_name:d.worker.doctor,duration:d.worker.duration||null,job_task:{assessment_type:"specialist_job_fitness",profile_job:d.job,essential_tasks:d.tasks,additional_tasks:d.extraTasks,safety_critical_duties:d.safetyCriticalDuties,job_demands:d.jobDemands,other_demands:d.extraDemands},exposures:{items:d.hazards,assessment_model:"job_specific_hazard_assessment"},task_risk:{site_category:d.site.categories,other_site_category:d.site.other,controls_model:"four_level_control_measures"},medical:{date_of_birth:d.worker.dob,clinical_exam:d.clinical,diseases:d.diseases,functional_capacity:d.capacities,extra_capacity:d.extraCapacity,fitness_essentials:d.allEssentials,medical_opinion:d.medicalOpinion,doctor_notes:d.doctorNotes},location_emergency:{care_access:d.site.care,evacuation:d.site.evacuation,communications:d.site.communications,site_support:d.site.support},decision:{assessment_type:"specialist_job_fitness",code:r.code,label:r.label,reasons:r.reasons,method:"Gate-based job-specific assessment; no weighted clinical score",provisional:true},algorithm_version:"POFRI-SPECIALIST-GATE-DRAFT-0.1",created_by:user.id};
  const b=$("specialist-save");b.disabled=true;b.textContent="جارٍ الحفظ...";
  const {error}=await client.from("pofri_assessments").insert(payload);
  b.disabled=false;b.textContent="حفظ التقييم المتخصص";
  if(error){msg("specialist-message","تعذر حفظ التقييم: "+error.message,"error");return;}
  msg("specialist-message","تم حفظ التقييم المتخصص بنجاح. تم حفظ التفاصيل في سجل POFRI دون تعديل بيانات أرشيف MORS.","success");
 });
 $("sp-date").value=new Date().toISOString().slice(0,10);
 $("specialist-form").addEventListener("reset",()=>{hazards=[];diseases=[];extraTests=[];extraDemand=[];extraEssential=[];extraTasks=[];});
 function refreshWorkers(){const s=$("sp-worker"),old=s.value;s.innerHTML=opts(((typeof workerRows!=="undefined"?workerRows:[])).map(w=>({value:w.id,label:w.full_name+" — "+w.registration_number})));if(((typeof workerRows!=="undefined"?workerRows:[])).some(w=>w.id===old))s.value=old;}
 document.addEventListener("pofri-specialized-page-open",refreshWorkers);
 renderBase();
})();