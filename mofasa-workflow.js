/* MOFASA shared assessment workflow: section data is isolated by database RLS. */
(()=> {
 const root=document.getElementById("mofasa-panel"); if(!root)return;
 const $=id=>document.getElementById(id), esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let selected=null, parent=null, hseRow=null, medicalRow=null, rows=[], showingArchive=false;
 const isAdmin=()=>role==="admin", canHse=()=>role==="hse_admin", canHseRead=()=>isAdmin()||role==="hse_admin"||role==="medical_admin", canMedical=()=>role==="medical_admin", canMedicalRead=()=>isAdmin()||role==="medical_admin";
 const statusLabel=s=>({pending:"لم يبدأ",draft:"مسودة",submitted:"مكتمل ومُرسل"}[s]||"غير معروف");
 const msg=(t,kind="")=>{const n=$("mofasa-message");if(n){n.textContent=t;n.className="status "+kind;}};
 function field(id,label,placeholder="",type="text"){return '<label>'+label+'<input id="'+id+'" type="'+type+'" placeholder="'+placeholder+'" required></label>';}
 function area(id,label,placeholder){return '<label>'+label+'<textarea id="'+id+'" rows="3" placeholder="'+placeholder+'"></textarea></label>';}

 const hazardLibrary=window.POFRI_JEM_LIBRARY||[];
 const demandGroups={
  "المتطلبات البدنية":["المشي لمسافات طويلة","صعود السلالم والسلالم الرأسية","الوقوف لفترات طويلة","الجلوس لفترات طويلة","الرفع والحمل اليدوي","الدفع والسحب","الركوع والانحناء والعمل في أوضاع غير مريحة","الاتزان والعمل على ارتفاعات","العمل في درجات حرارة مرتفعة","ارتداء معدات الوقاية الثقيلة"],
  "المتطلبات الذهنية والمعرفية":["التركيز المستمر","مراقبة الإنذارات والمؤشرات","الحكم واتخاذ القرار","سرعة الاستجابة","تعدد المهام","التواصل وفهم التعليمات","التعامل مع المواقف الطارئة"],
  "المتطلبات الوظيفية والتنظيمية":["العمل بنظام الورديات","العمل الليلي","القيادة","تشغيل المعدات والآلات","دخول الأماكن المغلقة","استخدام أجهزة التنفس","العمل المنفرد أو في موقع ناءٍ","المشاركة في الاستجابة للطوارئ"]
 };
 const safetyDuties=["القيادة","تشغيل الرافعات وعمليات الرفع","العمل على ارتفاعات","دخول الأماكن المغلقة","تشغيل معدات حرجة","العزل والتحكم في الطاقة","الاستجابة للحريق والطوارئ","الإسعافات الأولية والإنقاذ"];
 const exposureLabels={rare:"نادر",occasional:"ظرفي",repeated:"متكرر",continuous:"مستمر"};
 const hseEsc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let hseHazards=[];
 function renderHseEditors(data={}){
  const tasks=Array.isArray(data.tasks?.items)?data.tasks.items:(typeof data.tasks==="string"?data.tasks.split("\n").filter(Boolean):[]);
  const duties=Array.isArray(data.tasks?.safety_critical)?data.tasks.safety_critical:[];
  $("mh-tasks-editor").innerHTML='<div class="specialist-section"><h4>المهام الأساسية</h4><p>سجل المهام الفعلية للعامل، وحدد الواجبات الحساسة للسلامة.</p><label>المهام الأساسية (كل مهمة في سطر)<textarea id="mh-task-items" rows="4" placeholder="مثال: تشغيل ومراقبة وحدة الإنتاج\nالفحص الدوري للمعدات"></textarea></label><fieldset class="specialist-fieldset"><legend>الواجبات الحساسة للسلامة</legend>'+Object.entries(safetyDuties).map(([i,x])=>'<label class="specialist-check"><input type="checkbox" name="mh-duty" value="'+hseEsc(x)+'"><span>'+x+'</span></label>').join("")+'</fieldset><label>ملاحظات ومتطلبات خاصة بالمهمة<textarea id="mh-task-notes" rows="2"></textarea></label><fieldset class="specialist-fieldset"><legend>مصفوفة متطلبات الوظيفة والمهام</legend><div class="specialist-grid"><label>المجهود البدني<select id="mh-job-physical"><option value="">اختر</option><option value="low">منخفض</option><option value="moderate">متوسط</option><option value="high">مرتفع</option><option value="very_high">مرتفع جداً</option></select></label><label>المتطلبات الذهنية / الانتباه<select id="mh-job-cognitive"><option value="">اختر</option><option value="low">منخفضة</option><option value="moderate">متوسطة</option><option value="high">مرتفعة</option><option value="very_high">مرتفعة جداً</option></select></label><label>العمل على ارتفاعات<select id="mh-job-height"><option value="">اختر</option><option value="no">لا</option><option value="yes">نعم</option></select></label><label>العمل في أماكن مغلقة<select id="mh-job-confined"><option value="">اختر</option><option value="no">لا</option><option value="yes">نعم</option></select></label><label>العمل المنفرد / العزلة<select id="mh-job-isolated"><option value="">اختر</option><option value="no">لا</option><option value="yes">نعم</option></select></label><label>القيادة / تشغيل المعدات<select id="mh-job-driving"><option value="">اختر</option><option value="no">لا</option><option value="yes">نعم</option></select></label></div></fieldset></div>';
  $("mh-task-items").value=tasks.join("\n");
  document.querySelectorAll('input[name="mh-duty"]').forEach(x=>x.checked=duties.includes(x.value));
  $("mh-task-notes").value=data.tasks?.notes||"";
  const jobTask=data.job_task||{};
  for(const [id,key] of [["mh-job-physical","physical"],["mh-job-cognitive","cognitive"],["mh-job-height","height"],["mh-job-confined","confined_space"],["mh-job-isolated","isolated_work"],["mh-job-driving","driving"]])$(id).value=jobTask[key]||"";
  renderFtwHse(data.ftw||{});
  $("mh-hazards-editor").innerHTML='<div class="specialist-section"><h4>سجل الأخطار المهنية JEM</h4><p>أضف كل خطر على حدة. الشدة ومعدل التعرض مستقلان، ويجب توثيق الضوابط والخطر المتبقي.</p><div class="specialist-grid"><label>فئة الخطر<select id="mh-hazard-category"><option value="">اختر الفئة</option>'+[...new Set(hazardLibrary.map(x=>x.category))].map(x=>'<option>'+hseEsc(x)+'</option>').join("")+'</select></label><label>الخطر من المكتبة<select id="mh-hazard-name" disabled><option value="">اختر الخطر</option></select></label><label>الشدة<select id="mh-hazard-severity"><option value="">اختر</option><option value="1">1 — منخفض</option><option value="2">2 — متوسط</option><option value="3">3 — مرتفع</option><option value="4">4 — شديد / حرج</option></select></label><label>معدل التعرض<select id="mh-hazard-frequency"><option value="">اختر</option><option value="rare">نادر</option><option value="occasional">ظرفي</option><option value="repeated">متكرر</option><option value="continuous">مستمر</option></select></label><label>إجراءات التحكم القائمة<input id="mh-hazard-controls" placeholder="مثال: عزل، تهوية، PPE، تصريح عمل"></label><label>تكرار التعرض (1–5)<select id="mh-hazard-frequency-scale"><option value="">اختر</option><option value="1">1 — نادر جداً</option><option value="2">2 — نادر</option><option value="3">3 — أحياناً</option><option value="4">4 — متكرر</option><option value="5">5 — مستمر / شبه مستمر</option></select></label><label>مدة التعرض (1–5)<select id="mh-hazard-duration-scale"><option value="">اختر</option><option value="1">1 — قصيرة جداً</option><option value="2">2 — قصيرة</option><option value="3">3 — متوسطة</option><option value="4">4 — طويلة</option><option value="5">5 — معظم الوردية</option></select></label><label>احتمالية التعرض الفعلي (1–5)<select id="mh-hazard-probability-scale"><option value="">اختر</option><option value="1">1 — نادرة جداً</option><option value="2">2 — منخفضة</option><option value="3">3 — ممكنة</option><option value="4">4 — مرجحة</option><option value="5">5 — شبه مؤكدة</option></select></label><label>فعالية وسائل التحكم (0–1)<select id="mh-hazard-control-effectiveness"><option value="">اختر</option><option value="0">0.00 — غير فعالة</option><option value="0.25">0.25 — محدودة</option><option value="0.5">0.50 — متوسطة</option><option value="0.75">0.75 — فعالة بدرجة كبيرة</option><option value="1">1.00 — فعالة ومتحقق منها</option></select></label><label>الخطر المتبقي بعد التحكم<select id="mh-hazard-residual"><option value="">اختر</option><option value="low">منخفض</option><option value="moderate">متوسط</option><option value="high">مرتفع</option><option value="critical">حرج</option><option value="not_assessed">لم يقيّم</option></select></label><label>ملاحظات / قياسات<input id="mh-hazard-notes" placeholder="قياسات التعرض أو ظروف الموقع"></label></div><button type="button" class="secondary" id="mh-hazard-add">إضافة الخطر إلى السجل</button><div id="mh-hazard-list" class="table-wrap"></div><label>ملاحظات عامة على تقييم الأخطار<textarea id="mh-hazard-notes-general" rows="2"></textarea></label></div>';
  hseHazards=Array.isArray(data.hazards?.items)?data.hazards.items:(Array.isArray(data.hazards)?data.hazards:[]);
  $("mh-hazard-category").addEventListener("change",()=>{const c=$("mh-hazard-category").value,sel=$("mh-hazard-name");sel.innerHTML='<option value="">اختر الخطر</option>'+hazardLibrary.filter(x=>x.category===c).map(x=>'<option>'+hseEsc(x.name)+'</option>').join("");sel.disabled=!c;$("mh-hazard-severity").innerHTML='<option value="">اختر الشدة</option>';});
  $("mh-hazard-name").addEventListener("change",()=>{const h=hazardLibrary.find(x=>x.category===$("mh-hazard-category").value&&x.name===$("mh-hazard-name").value),sel=$("mh-hazard-severity");sel.innerHTML='<option value="">اختر الشدة</option>'+(h?.levels||[]).map((d,i)=>'<option value="'+(i+1)+'">'+(i+1)+' — '+hseEsc(i===3?(h.criticalLabel||"شديد"):["منخفض","متوسط","مرتفع"][i])+' — '+hseEsc(d)+'</option>').join("")+'<option value="5">5 — كارثي / عواقب جسيمة</option>';});
  $("mh-hazard-add").onclick=()=>{const category=$("mh-hazard-category").value,name=$("mh-hazard-name").value,severity=$("mh-hazard-severity").value,frequency=$("mh-hazard-frequency").value,residual=$("mh-hazard-residual").value;const fs=$("mh-hazard-frequency-scale").value,ds=$("mh-hazard-duration-scale").value,ps=$("mh-hazard-probability-scale").value,ce=$("mh-hazard-control-effectiveness").value;if(!category||!name||!severity||!frequency||!residual||!fs||!ds||!ps||ce===""){msg("أكمل بيانات الخطر ومقاييس التكرار والمدة والاحتمالية وفعالية التحكم.","error");return;}const selectedHazard=hazardLibrary.find(x=>x.category===category&&x.name===name),severityDescription=selectedHazard?.levels?.[Number(severity)-1]||"",severityLabel=Number(severity)===5?"كارثي":Number(severity)===4?(selectedHazard?.criticalLabel||"شديد"):["","منخفض","متوسط","مرتفع"][Number(severity)];hseHazards.push({category,name,severity:Number(severity),severity_label:severityLabel,severity_description:severityDescription,frequency,frequency_scale:Number(fs),duration_scale:Number(ds),probability_scale:Number(ps),control_effectiveness:Number(ce),controls:$("mh-hazard-controls").value.trim(),residual,notes:$("mh-hazard-notes").value.trim()});["mh-hazard-category","mh-hazard-severity","mh-hazard-frequency","mh-hazard-controls","mh-hazard-frequency-scale","mh-hazard-duration-scale","mh-hazard-probability-scale","mh-hazard-control-effectiveness","mh-hazard-residual","mh-hazard-notes"].forEach(id=>$(id).value="");$("mh-hazard-name").innerHTML='<option value="">اختر الخطر</option>'; $("mh-hazard-name").disabled=true;renderHseHazardList();};
  $("mh-hazard-notes-general").value=data.hazards?.notes||"";
  renderHseHazardList();
  const tra=data.tra||{};
  $("mh-tra-editor").innerHTML='<div class="specialist-section"><h4>تقييم مخاطر المهمة – Task Risk Assessment (TRA)</h4><div class="specialist-grid"><label>الخطر قبل التحكم<select id="mh-tra-inherent"><option value="">اختر</option><option value="low">منخفض</option><option value="moderate">متوسط</option><option value="high">مرتفع</option><option value="critical">حرج</option></select></label><label>فعالية وسائل التحكم<select id="mh-tra-controls"><option value="">اختر</option><option value="effective">فعالة ومتحقق منها</option><option value="partial">فعالة جزئياً</option><option value="weak">ضعيفة / غير مكتملة</option><option value="unknown">غير متحقق منها</option></select></label><label>الخطر المتبقي<select id="mh-tra-residual"><option value="">اختر</option><option value="low">منخفض</option><option value="moderate">متوسط</option><option value="high">مرتفع</option><option value="critical">حرج</option></select></label><label>تصريح / إجراء عمل آمن<input id="mh-tra-permit" maxlength="180"></label></div><label>تفاصيل المخاطر وإجراءات التحكم<textarea id="mh-tra-notes" rows="3"></textarea></label></div>';
  for(const [id,key] of [["mh-tra-inherent","inherent"],["mh-tra-controls","controls"],["mh-tra-residual","residual"],["mh-tra-permit","permit"],["mh-tra-notes","notes"]])$(id).value=tra[key]||"";
  const demandSelected=Array.isArray(data.demands?.selected)?data.demands.selected:(typeof data.demands==="string"?data.demands.split("\n"):[]);
  $("mh-demands-editor").innerHTML='<div class="specialist-section"><h4>متطلبات أداء الوظيفة</h4>'+Object.entries(demandGroups).map(([group,items])=>'<fieldset class="specialist-fieldset"><legend>'+group+'</legend>'+items.map(x=>'<label class="specialist-check"><input type="checkbox" name="mh-demand" value="'+hseEsc(x)+'"><span>'+hseEsc(x)+'</span></label>').join("")+'</fieldset>').join("")+'<label>متطلبات أخرى<textarea id="mh-demand-other" rows="2" placeholder="متطلبات خاصة بالموقع أو المهمة"></textarea></label><label>مستوى المجهود / طبيعة العمل<textarea id="mh-demand-notes" rows="2"></textarea></label></div>';
  document.querySelectorAll('input[name="mh-demand"]').forEach(x=>x.checked=demandSelected.includes(x.value));
  $("mh-demand-other").value=data.demands?.other||"";
  $("mh-demand-notes").value=data.demands?.notes||"";
  const em=typeof data.emergency==="string"?{notes:data.emergency}:(data.emergency||{});
  $("mh-emergency-editor").innerHTML='<div class="specialist-section"><h4>جاهزية الموقع والاستجابة للطوارئ</h4><div class="specialist-grid"><label>فئة الموقع<select id="mh-site-category"><option value="">اختر</option><option value="onshore">بري</option><option value="offshore">بحري</option><option value="remote">نائي / معزول</option><option value="near_services">قريب من الخدمات</option></select></label><label>توافر الرعاية الطبية<select id="mh-care-access"><option value="">اختر</option><option value="good">متاحة سريعاً</option><option value="moderate">متوسطة</option><option value="limited">محدودة</option><option value="remote">بعيدة / صعبة الوصول</option></select></label><label>الإسعاف والإخلاء الطبي<select id="mh-evacuation"><option value="">اختر</option><option value="ready">خطة وموارد جاهزة ومختبرة</option><option value="partial">متاحة جزئياً</option><option value="weak">غير كافية</option><option value="unknown">غير متحقق منها</option></select></label><label>الاتصالات والطوارئ<select id="mh-communications"><option value="">اختر</option><option value="reliable">موثوقة</option><option value="intermittent">متقطعة</option><option value="poor">ضعيفة</option><option value="unknown">غير متحقق منها</option></select></label><label>دعم الموقع الطبي<select id="mh-medical-support"><option value="">اختر</option><option value="adequate">كافٍ</option><option value="limited">محدود</option><option value="inadequate">غير كافٍ</option><option value="unknown">غير محدد</option></select></label><label>المستشفى / المركز المرجعي<input id="mh-referral" placeholder="اسم الجهة المرجعية"></label><label>زمن الوصول / الإخلاء المتوقع<input id="mh-evac-time" placeholder="بالدقائق أو الساعات"></label><label>وسيلة النقل والإخلاء<input id="mh-transport" placeholder="سيارة إسعاف / طائرة / غير ذلك"></label></div><label>تفاصيل خطة الطوارئ وأرقام الاتصال<textarea id="mh-emergency-notes" rows="3"></textarea></label><label>آخر اختبار أو تمرين لخطة الإخلاء<input id="mh-drill-date" type="date"></label></div>';
  for(const [id,key] of [["mh-site-category","site_category"],["mh-care-access","care_access"],["mh-evacuation","evacuation"],["mh-communications","communications"],["mh-medical-support","medical_support"],["mh-referral","referral_facility"],["mh-evac-time","evacuation_time"],["mh-transport","transport"],["mh-emergency-notes","notes"],["mh-drill-date","last_drill_date"]])$(id).value=em[key]||"";
 }
 function renderHseHazardList(){
  const el=$("mh-hazard-list");if(!el)return;
  el.innerHTML=hseHazards.length?'<table><thead><tr><th>الفئة / الخطر</th><th>الشدة</th><th>التعرض</th><th></th></tr></thead><tbody>'+hseHazards.map((x,i)=>'<tr><td>'+hseEsc(x.category)+' / '+hseEsc(x.name)+'</td><td>'+(x.severity_label||["","منخفض","متوسط","مرتفع","شديد"][Number(x.severity)])+(x.severity_description?" — "+hseEsc(x.severity_description):"")+'</td><td>'+(exposureLabels[x.frequency]||"—")+'</td><td><button type="button" class="secondary" data-hse-remove="'+i+'">حذف</button></td></tr>').join("")+'</tbody></table>':'لم تتم إضافة أخطار بعد.';
  el.querySelectorAll("[data-hse-remove]").forEach(b=>b.onclick=()=>{hseHazards.splice(Number(b.dataset.hseRemove),1);renderHseHazardList();});
 }
 function collectHseData(){
  return {
   tasks:{items:$("mh-task-items").value.split("\n").map(x=>x.trim()).filter(Boolean),safety_critical:[...document.querySelectorAll('input[name="mh-duty"]:checked')].map(x=>x.value),notes:$("mh-task-notes").value.trim()},
   job_task:{physical:$("mh-job-physical").value,cognitive:$("mh-job-cognitive").value,height:$("mh-job-height").value,confined_space:$("mh-job-confined").value,isolated_work:$("mh-job-isolated").value,driving:$("mh-job-driving").value,worker_profile:hseRow?.section_data?.job_task?.worker_profile||{}},
   hazards:{items:hseHazards.map(x=>({...x})),notes:$("mh-hazard-notes-general").value.trim()},
   tra:{inherent:$("mh-tra-inherent").value,controls:$("mh-tra-controls").value,residual:$("mh-tra-residual").value,permit:$("mh-tra-permit").value.trim(),notes:$("mh-tra-notes").value.trim()},
   demands:{selected:[...document.querySelectorAll('input[name="mh-demand"]:checked')].map(x=>x.value),other:$("mh-demand-other").value.trim(),notes:$("mh-demand-notes").value.trim()},
   emergency:Object.fromEntries([["site_category","mh-site-category"],["care_access","mh-care-access"],["evacuation","mh-evacuation"],["communications","mh-communications"],["medical_support","mh-medical-support"],["referral_facility","mh-referral"],["evacuation_time","mh-evac-time"],["transport","mh-transport"],["notes","mh-emergency-notes"],["last_drill_date","mh-drill-date"]].map(([k,id])=>[k,$(id).value.trim()])),
   notes:$("mh-notes").value.trim(),ftw:collectFtwHse()
  };
 }

 const clinicalGroups={
  basic:[["general","المظهر العام"],["blood_pressure","ضغط الدم"],["cardiovascular","الجهاز القلبي الوعائي"],["respiratory","الجهاز التنفسي"],["musculoskeletal","الجهاز العضلي الهيكلي"],["neurological","الجهاز العصبي"],["vision","الإبصار"],["hearing","السمع"],["balance","الاتزان والتناسق الحركي"]],
  labs_basic:[["cbc","CBC"],["ast","AST"],["alt","ALT"],["creatinine","CREAT."],["lipid","LIPID"],["fbs","FBS"],["hba1c","HbA1c"],["chest_xray","Chest X-ray"],["ultrasound","US"]],
  additional:[["ecg","ECG"],["spirometry","Spirometry"],["audiometry","Audiometry"]]
 };
 const jobClinicalHints=[
  {match:/driver|سائق|قيادة|vehicle/i,items:["Vision / Color vision","Hearing and warning-signal detection","Neurological status and reaction","Sleepiness / alertness","Musculoskeletal mobility"]},
  {match:/operator|مشغل|control room|تحكم/i,items:["Vision","Hearing and communication","Attention and judgement","Cardiovascular status"]},
  {match:/drill|حفر|rig|حفار/i,items:["Cardiorespiratory fitness","Musculoskeletal strength and mobility","Balance / heights","Hearing","Respiratory fitness"]},
  {match:/electric|كهرب|instrument|آلات|maintenance|صيانة/i,items:["Vision / color discrimination","Hearing","Balance / heights","Hand function and musculoskeletal status"]},
  {match:/hse|safety|سلامة|fire|إطفاء/i,items:["Cardiorespiratory fitness","Mobility / emergency response","Vision and hearing","Psychomotor function"]},
  {match:/lab|مختبر|laboratory/i,items:["Vision / color discrimination","Fine motor function","Respiratory / chemical exposure review"]}
 ];
 function renderClinicalExam(data={},job={},hse={}){
  const old=typeof data==="string"?{legacy_notes:data}:data||{};
  const hints=jobClinicalHints.find(x=>x.match.test((job.job_title||"")+" "+(job.task_name||"")));
  const input=(group,key,label)=>'<label>'+label+'<input data-clinical-group="'+group+'" data-clinical-key="'+key+'" value="'+esc(old[group]?.[key]||"")+'" placeholder="يُستكمل بواسطة طبيب الموقع"></label>';
  const areaInput=(group,key,label)=>'<label>'+label+'<textarea rows="2" data-clinical-group="'+group+'" data-clinical-key="'+key+'" placeholder="يُستكمل بواسطة طبيب الموقع">'+esc(old[group]?.[key]||"")+'</textarea></label>';
  const custom=(group,label)=>'<div class="clinical-custom"><h5>'+label+'</h5><div data-clinical-custom-list="'+group+'">'+(Array.isArray(old[group])?old[group]:[]).map(x=>'<div class="clinical-custom-row"><input data-custom-name value="'+esc(x.name||"")+'" placeholder="اسم الفحص / البند"><input data-custom-value value="'+esc(x.value||"")+'" placeholder="النتيجة / الملاحظات"><button type="button" class="secondary" data-remove-clinical>حذف</button></div>').join("")+'</div><button type="button" class="secondary" data-add-clinical="'+group+'">إضافة بند</button></div>';
  const section=(group,title,fields)=>'<fieldset class="specialist-fieldset clinical-fieldset"><legend>'+title+'</legend><div class="specialist-grid">'+fields.map(([k,l])=>input(group,k,l)).join("")+areaInput(group,"other","Other / ملاحظات إضافية")+'</div>'+custom(group+"_other","فحوصات أو عناصر أخرى")+'</fieldset>';
  const required=Array.isArray(old.required)?old.required:[];
  $("mm-exam").innerHTML='<div class="clinical-exam"><p class="specialist-help">تُعرض خانات الفحص القياسية، مع تنبيه بالمجالات الإضافية ذات الصلة بالوظيفة والمهمة المسجلة. على الطبيب إدخال النتائج الفعلية فقط؛ لا تُملأ أي نتيجة تلقائياً ولا يصدر عن هذا النموذج تشخيص أو قرار لياقة.</p><div class="notice"><strong>الوظيفة محل التقييم:</strong> '+esc(job.job_title||"غير محددة")+' — <strong>المهمة:</strong> '+esc(job.task_name||"غير محددة")+(hints?'<br><strong>محاور إضافية يُنصح بمراجعتها:</strong> '+hints.items.map(esc).join("، "):"")+'</div>'+section("basic","a) Basic Examination / الفحص الأساسي",clinicalGroups.basic)+section("labs_basic","b) Labs & Imaging Findings — Basic",clinicalGroups.labs_basic)+section("additional","c) Additional Investigations",clinicalGroups.additional)+'<fieldset class="specialist-fieldset clinical-fieldset"><legend>Required / فحوصات مطلوبة حسب الوظيفة أو الحالة</legend><div data-clinical-custom-list="required">'+required.map(x=>'<div class="clinical-custom-row"><input data-custom-name value="'+esc(x.name||"")+'" placeholder="الفحص المطلوب"><input data-custom-value value="'+esc(x.value||"")+'" placeholder="النتيجة / الملاحظات"><button type="button" class="secondary" data-remove-clinical>حذف</button></div>').join("")+'</div><button type="button" class="secondary" data-add-clinical="required">إضافة فحص مطلوب</button></fieldset><label>ملاحظات الفحص السريري العامة<textarea id="mm-exam-notes" rows="3" placeholder="ملاحظات الطبيب">'+esc(old.notes||old.legacy_notes||"")+'</textarea></label></div>';
  $("mm-exam").querySelectorAll("[data-add-clinical]").forEach(b=>b.onclick=()=>{const list=$("mm-exam").querySelector('[data-clinical-custom-list="'+b.dataset.addClinical+'"]');const row=document.createElement("div");row.className="clinical-custom-row";row.innerHTML='<input data-custom-name placeholder="اسم الفحص / البند"><input data-custom-value placeholder="النتيجة / الملاحظات"><button type="button" class="secondary" data-remove-clinical>حذف</button>';list.appendChild(row);});
  $("mm-exam").querySelectorAll("[data-remove-clinical]").forEach(b=>b.onclick=()=>b.closest(".clinical-custom-row").remove());
 }
 function collectClinicalExam(){
  const out={basic:{},labs_basic:{},additional:{},notes:$("mm-exam-notes")?.value.trim()||"",required:[]};
  $("mm-exam").querySelectorAll("[data-clinical-group]").forEach(el=>{const g=el.dataset.clinicalGroup,k=el.dataset.clinicalKey;out[g][k]=el.value.trim();});
  for(const g of ["basic_other","labs_basic_other","additional_other","required"]){out[g]=[...$("mm-exam").querySelectorAll('[data-clinical-custom-list="'+g+'"] .clinical-custom-row')].map(row=>({name:row.querySelector("[data-custom-name]").value.trim(),value:row.querySelector("[data-custom-value]").value.trim()})).filter(x=>x.name||x.value);}
  return out;
 }
 const medMap={lab:{normal:"ضمن الحدود المرجعية",abnormal:"خارج الحدود المرجعية",review:"تحتاج مراجعة",pending:"قيد الانتظار"},condition:{stable:"مستقرة",controlled:"مسيطر عليها",under_treatment:"تحت العلاج",uncontrolled:"غير مسيطر عليها",historical:"تاريخ مرضي"},fit:{met:"مستوفٍ",restricted:"مستوفٍ بقيود",not_met:"غير مستوفٍ",not_assessed:"لم يقيّم"}};
 const fitCatalog=["القدرة على المجهود البدني","التحمل القلبي التنفسي","القوة العضلية","الحركة والاتزان","التركيز والانتباه","الحكم واتخاذ القرار","الإبصار وتمييز الألوان","السمع والتواصل","الاستجابة للطوارئ","العمل بنظام الورديات","القيادة وتشغيل المركبات","تشغيل المعدات الحرجة","العمل على ارتفاعات","دخول الأماكن المغلقة","استخدام أجهزة التنفس","العمل بالمواقع النائية"];
 let medLabs=[],medConditions=[],fitItems=[];
 function medicalRows(type){const a=type==="labs"?medLabs:type==="conditions"?medConditions:fitItems;if(!a.length)return '<p class="medical-empty">لم تتم إضافة سجلات بعد.</p>';const heads=type==="labs"?["الفحص","النتيجة","الوحدة","التاريخ","التفسير"]:type==="conditions"?["التخصص","المرض","المستوى","وصف المستوى","العلاج / المتابعة","الأثر الوظيفي"]:["عنصر اللياقة","التقييم","الدليل / الملاحظات"];return '<div class="table-wrap"><table><thead><tr>'+heads.map(x=>'<th>'+x+'</th>').join("")+'<th>إجراء</th></tr></thead><tbody>'+a.map((x,i)=>{const cells=type==="labs"?[x.test,x.result,x.unit||"—",x.date||"—",medMap.lab[x.status]||"—"]:type==="conditions"?[x.category_label||x.category||"—",x.disease||x.name, x.level?("المستوى "+x.level): (medMap.condition[x.status]||"—"),x.description||"—",x.treatment||"—",x.impact||"—"]:[x.item,medMap.fit[x.status]||"لم يقيّم",x.evidence||"—"];return '<tr>'+cells.map((v,j)=>'<td>'+(type==="fit"&&j===1?'<select data-fit-status="'+i+'"><option value="not_assessed" '+(x.status==="not_assessed"?'selected':'')+'>لم يقيّم</option><option value="met" '+(x.status==="met"?'selected':'')+'>موجود / مستوفٍ</option><option value="restricted" '+(x.status==="restricted"?'selected':'')+'>موجود بقيود</option><option value="not_met" '+(x.status==="not_met"?'selected':'')+'>غير مستوفٍ</option></select>':esc(v))+'</td>').join("")+'<td><button type="button" class="secondary" data-med-remove="'+type+':'+i+'">حذف</button></td></tr>';}).join("")+'</tbody></table></div>';}
 function fitnessEssentialsForJob(job={},hse={}){
 const jobText=[job.job_title,job.task_name,...(hse.demands?.selected||[]),...(hse.tasks?.items||[]),...(hse.tasks?.safety_critical||[]),...(hse.hazards?.items||[]).map(x=>x.name)].join(" ").toLowerCase();
 const all={consciousness:"Normal Consciousness / مستوى وعي طبيعي",epilepsy:"No Uncontrolled Epilepsy / عدم وجود صرع غير مسيطر عليه",mobility:"Adequate Mobility / قدرة حركية مناسبة",ladder:"Safe Ladder Climbing / القدرة على صعود السلالم بأمان",balance:"Normal Balance / اتزان طبيعي",hearing:"Adequate Hearing / كفاءة سمعية مناسبة",vision:"Adequate Vision / كفاءة إبصار مناسبة",respirator:"Ability to Wear Respirator / القدرة على ارتداء جهاز التنفس",cardio:"Cardiovascular Fitness / الكفاءة القلبية الوعائية"};
 const has=words=>words.some(w=>jobText.includes(w));
 const selected=["consciousness","mobility","hearing","vision"];
 if(has(["driver","سائق","قيادة","vehicle","مركب","رافعة","crane","lifting","رفع","height","ارتفاع","confined","مغلق","critical","حرج","معدات","machinery","حفار","drill","rig","حفر","كهرب","electric","صيانة","maintenance","fire","حريق","طوارئ","emergency"]))selected.push("epilepsy");
 if(has(["height","ارتفاع","ladder","سلم","climb","تسلق","drill","rig","حفار","حفر","maintenance","صيانة","scaffold","سقالة"]))selected.push("ladder","balance");
 if(has(["confined","مغلق","h2s","كبريتيد","chemical","كيميائ","respirator","تنفس","gas","غاز","paint","دهان","weld","لحام"]))selected.push("respirator");
 if(has(["heavy","شاق","مجهود","physical","بدني","drill","rig","حفار","حفر","fire","حريق","طوارئ","emergency","rescue","إنقاذ","lifting","رفع","remote","ناءٍ"]))selected.push("cardio");
 return [...new Set(selected)].map(k=>({item:all[k],status:"not_assessed",evidence:""}));
}
function renderMedicalRegisters(d={},job={},hse={}){const l=d.labs,c=d.diseases,f=d.capacity;medLabs=Array.isArray(l?.items)?l.items.map(x=>({...x})):Array.isArray(l)?l.map(x=>({...x})):typeof l==="string"&&l.trim()?[{test:"بيانات سابقة (نص)",result:l,unit:"",date:"",status:"review"}]:[];medConditions=Array.isArray(c?.items)?c.items.map(x=>({...x})):Array.isArray(c)?c.map(x=>({...x})):typeof c==="string"&&c.trim()?[{name:"حالة مدخلة سابقاً (نص)",status:"historical",treatment:"",impact:c}]:[];fitItems=Array.isArray(f?.items)?f.items.map(x=>({...x})):Array.isArray(f?.essentials)?f.essentials.map(x=>({item:x.item||x.key,status:x.status||"not_assessed",evidence:x.evidence||x.note||""})):typeof f==="string"&&f.trim()?[{item:"بيانات قدرة وظيفية سابقة",status:"not_assessed",evidence:f}]:fitnessEssentialsForJob(job,hse);
  $("mm-labs").innerHTML='<div class="medical-register"><h5>سجل التحاليل والفحوصات <small id="mm-lab-count"></small></h5><div class="medical-entry-grid"><label>اسم الفحص<input id="mm-lab-test"></label><label>النتيجة<input id="mm-lab-result"></label><label>الوحدة<input id="mm-lab-unit"></label><label>التاريخ<input id="mm-lab-date" type="date"></label><label>تفسير النتيجة<select id="mm-lab-status"><option value="">اختر</option><option value="normal">ضمن الحدود المرجعية</option><option value="abnormal">خارج الحدود المرجعية</option><option value="review">تحتاج مراجعة</option><option value="pending">قيد الانتظار</option></select></label></div><button type="button" class="secondary" id="mm-lab-add">إضافة الفحص</button><div id="mm-labs-table"></div><label>ملاحظات عامة<textarea id="mm-labs-notes" rows="2"></textarea></label></div>';
  const conditionLibrary=window.POFRI_MEDICAL_LIBRARY||[]; $("mm-diseases").innerHTML='<div class="medical-register"><h5>سجل التاريخ المرضي والحالات الطبية – Medical Conditions Matrix <small id="mm-condition-count"></small></h5><p class="specialist-help">اختر التخصص ثم المرض ثم المستوى المطابق للوصف السريري. المستويات مرجعية وصفية وليست درجة لياقة آلية.</p><div class="medical-entry-grid"><label>التخصص الطبي<select id="mm-condition-category"><option value="">اختر التخصص</option>'+conditionLibrary.map(x=>'<option value="'+esc(x.category)+'">'+esc(x.label)+'</option>').join("")+'</select></label><label>المرض / الحالة<select id="mm-condition-disease" disabled><option value="">اختر المرض</option></select></label><label>مستوى الحالة<select id="mm-condition-level" disabled><option value="">اختر المستوى</option></select></label><label class="entry-wide">الوصف المرجعي للمستوى<textarea id="mm-condition-description" rows="2" readonly></textarea></label><label>العلاج / المتابعة<input id="mm-condition-treatment"></label><label class="entry-wide">الأثر الوظيفي<textarea id="mm-condition-impact" rows="2" placeholder="الأثر على مهام الوظيفة المحددة، إن وجد"></textarea></label></div><button type="button" class="secondary" id="mm-condition-add">إضافة الحالة الطبية</button><div id="mm-conditions-table"></div><label>ملاحظات عامة<textarea id="mm-diseases-notes" rows="2"></textarea></label><label class="specialist-check"><input type="checkbox" id="mm-diseases-reviewed"> أؤكد أنني راجعت التاريخ المرضي والحالات الطبية ذات الصلة بهذه الوظيفة، بما في ذلك توثيق عدم وجود حالات عند انطباق ذلك.</label></div>';
  $("mm-capacity").innerHTML='<div class="medical-register"><h5>سجل Fitness Essentials <small id="mm-fit-count"></small></h5><p>قيّم كل عنصر على حدة ووثّق الدليل. لا ينتج عن هذا السجل قرار آلي.</p><div class="medical-entry-grid"><label>عنصر اللياقة<select id="mm-fit-item"><option value="">اختر</option>'+[...new Set([...fitCatalog,...fitnessEssentialsForJob(job,hse).map(x=>x.item)])].map(x=>'<option>'+esc(x)+'</option>').join("")+'<option value="custom">عنصر آخر</option></select></label><label id="mm-fit-custom-wrap" hidden>عنصر مخصص<input id="mm-fit-custom"></label><label>نتيجة التقييم<select id="mm-fit-status"><option value="">اختر</option><option value="met">مستوفٍ</option><option value="restricted">مستوفٍ بقيود</option><option value="not_met">غير مستوفٍ</option><option value="not_assessed">لم يقيّم</option></select></label><label class="entry-wide">الدليل / الملاحظات<input id="mm-fit-evidence"></label></div><button type="button" class="secondary" id="mm-fit-add">إضافة عنصر اللياقة</button><div id="mm-fit-table"></div><label>ملخص القدرة الوظيفية<textarea id="mm-capacity-notes" rows="2"></textarea></label></div>';
  $("mm-labs-notes").value=l?.notes||d.labs_notes||"";$("mm-diseases-notes").value=c?.notes||"";$("mm-diseases-reviewed").checked=!!c?.reviewed||medConditions.length>0;$("mm-capacity-notes").value=f?.notes||"";
  const refresh=()=>{for(const [t,id,count] of [["labs","mm-labs-table","mm-lab-count"],["conditions","mm-conditions-table","mm-condition-count"],["fit","mm-fit-table","mm-fit-count"]]){const rows=t==="labs"?medLabs:t==="conditions"?medConditions:fitItems;const level4=t==="conditions"?rows.filter(x=>Number(x.level)===4):[];$(id).innerHTML=(level4.length?'<div class="mcm-warning" role="alert"><strong>تنبيه للمراجعة الطبية:</strong> توجد حالة أو أكثر بمستوى 4: '+level4.map(x=>esc(x.disease||x.name)).join("، ")+'. يلزم تقييم سريري متخصص وربط الحالة بمتطلبات الوظيفة ومخاطر الموقع. هذا التنبيه لا يصدر قرار لياقة تلقائياً.</div>':"")+medicalRows(t);$(count).textContent=rows.length+" سجل";}document.querySelectorAll("[data-med-remove]").forEach(b=>b.onclick=()=>{const [t,i]=b.dataset.medRemove;(t==="labs"?medLabs:t==="conditions"?medConditions:fitItems).splice(Number(i),1);refresh();});document.querySelectorAll("[data-fit-status]").forEach(s=>s.onchange=()=>{fitItems[Number(s.dataset.fitStatus)].status=s.value;});};
  $("mm-lab-add").onclick=()=>{const test=$("mm-lab-test").value.trim(),result=$("mm-lab-result").value.trim(),status=$("mm-lab-status").value;if(!test||!result||!status){msg("أدخل اسم الفحص والنتيجة وحدد تفسيرها.","error");return;}const unit=$("mm-lab-unit").value.trim(),date=$("mm-lab-date").value,normalized=test.toLocaleLowerCase("ar").replace(/\s+/g," ").trim();if(medLabs.some(x=>String(x.test||"").toLocaleLowerCase("ar").replace(/\s+/g," ").trim()===normalized&&String(x.date||"")===date)){msg("هذا التحليل مسجل بالفعل بالتاريخ نفسه. يمكنك تعديل السجل السابق أو اختيار تاريخ آخر.","error");return;}medLabs.push({test,result,unit,date,status});["mm-lab-test","mm-lab-result","mm-lab-unit","mm-lab-date","mm-lab-status"].forEach(id=>$(id).value="");refresh();};
  const getConditionCategory=()=>conditionLibrary.find(x=>x.category===$("mm-condition-category").value); const getConditionDisease=()=>getConditionCategory()?.diseases?.find(x=>x.name===$("mm-condition-disease").value); $("mm-condition-category").onchange=()=>{const c=getConditionCategory(),sel=$("mm-condition-disease");sel.innerHTML='<option value="">اختر المرض</option>'+(c?.diseases||[]).map(x=>'<option value="'+esc(x.name)+'">'+esc(x.name)+'</option>').join("");sel.disabled=!c;$("mm-condition-level").innerHTML='<option value="">اختر المستوى</option>';$("mm-condition-level").disabled=true;$("mm-condition-description").value="";}; $("mm-condition-disease").onchange=()=>{const d=getConditionDisease(),sel=$("mm-condition-level");sel.innerHTML='<option value="">اختر المستوى</option>'+(d?.levels||[]).map((x,i)=>'<option value="'+(i+1)+'">المستوى '+(i+1)+' — '+esc(x)+'</option>').join("");sel.disabled=!d;$("mm-condition-description").value="";}; $("mm-condition-level").onchange=()=>{const d=getConditionDisease(),n=Number($("mm-condition-level").value);$("mm-condition-description").value=d&&n?d.levels[n-1]:"";}; $("mm-condition-add").onclick=()=>{const c=getConditionCategory(),d=getConditionDisease(),level=Number($("mm-condition-level").value);if(!c||!d||!level){msg("اختر التخصص والمرض ومستوى الحالة.","error");return;}if(medConditions.some(x=>(x.category===c.category&&x.disease===d.name)||(!x.category&&x.name===d.name))){msg("هذا المرض مسجل بالفعل في الملف. احذف السجل السابق إذا أردت تحديث مستواه.","error");return;}medConditions.push({category:c.category,category_label:c.label,disease:d.name,name:d.name,level,description:d.levels[level-1],status:"matrix_level_"+level,treatment:$("mm-condition-treatment").value.trim(),impact:$("mm-condition-impact").value.trim()});["mm-condition-category","mm-condition-disease","mm-condition-level","mm-condition-treatment","mm-condition-impact"].forEach(id=>$(id).value="");$("mm-condition-disease").disabled=true;$("mm-condition-level").disabled=true;$("mm-condition-description").value="";refresh();};
  $("mm-fit-item").onchange=()=>{$("mm-fit-custom-wrap").hidden=$("mm-fit-item").value!=="custom";};
  $("mm-fit-add").onclick=()=>{const v=$("mm-fit-item").value,item=v==="custom"?$("mm-fit-custom").value.trim():v,status=$("mm-fit-status").value;if(!item||!status){msg("اختر عنصر اللياقة وحدد نتيجة تقييمه.","error");return;}if(fitItems.some(x=>x.item===item)){msg("عنصر اللياقة موجود بالفعل.","error");return;}fitItems.push({item,status,evidence:$("mm-fit-evidence").value.trim()});["mm-fit-item","mm-fit-custom","mm-fit-status","mm-fit-evidence"].forEach(id=>$(id).value="");$("mm-fit-custom-wrap").hidden=true;refresh();};refresh();}
 function collectMedicalData(){return {exam:collectClinicalExam(),labs:{items:medLabs.map(x=>({...x})),notes:$("mm-labs-notes").value.trim()},diseases:{items:medConditions.map(x=>({...x})),notes:$("mm-diseases-notes").value.trim(),reviewed:$("mm-diseases-reviewed").checked||medConditions.length>0},medical_fit:$("mm-fit-compatibility").value,capacity:{items:fitItems.map(x=>({...x})),notes:$("mm-capacity-notes").value.trim()},restrictions:$("mm-restrictions").value.trim(),notes:$("mm-notes").value.trim(),ftw:{...(medicalRow?.section_data?.ftw||{}),...collectFtwMedical()}};}
 function renderPreliminaryScore(){
  const box=$("mm-preliminary-score-result");if(!box)return;
  const medical=collectMedicalData(),decision=$("mm-decision").value||"";
  const score=window.MOFASA_POFriBridge?.calculate(hseRow?.section_data||{},medical,decision);
  if(!score){box.textContent="تعذر تحميل محرك المؤشر التجريبي.";return;}
  if(score.total===null){box.textContent=score.reason||"المؤشر غير مكتمل؛ استكمل البيانات الطبية المطلوبة.";return;}
  box.textContent="النتيجة: "+score.total+" / 100 — "+score.band+" | المعادلة: "+score.formula+" | المكونات: R "+score.components.R+"، M "+score.components.M+"، F "+score.components.F+"، E "+score.components.E+". هذا مؤشر تجريبي غير معاير ولا يصدر قرار لياقة.";
 }
 function clinicalExamHasData(x){if(typeof x==="string")return !!x.trim();if(!x||typeof x!=="object")return false;return Object.entries(x).some(([k,v])=>k==="notes"?!!String(v||"").trim():Array.isArray(v)?v.some(y=>!!(y.name||y.value)):v&&typeof v==="object"?Object.values(v).some(y=>!!String(y||"").trim()):!!String(v||"").trim());}
 function clinicalExamText(x){if(!x)return "لم يتم إدخال بيانات";if(typeof x==="string")return x;const out=[];for(const [g,title] of [["basic","Basic Examination"],["labs_basic","Basic Labs & Imaging"],["additional","Additional Investigations"]]){const vals=Object.entries(x[g]||{}).filter(([k,v])=>v).map(([k,v])=>k+": "+v);if(vals.length)out.push(title+": "+vals.join(" | "));}for(const g of ["basic_other","labs_basic_other","additional_other","required"]){(x[g]||[]).forEach(v=>out.push((v.name||"بند إضافي")+": "+(v.value||"—")));}if(x.notes)out.push("ملاحظات: "+x.notes);return out.join("\n")||"لم يتم إدخال بيانات";}
 function medicalRegisterSummary(d){
  const labs=Array.isArray(d.labs?.items)?d.labs.items:(Array.isArray(d.labs)?d.labs:typeof d.labs==="string"&&d.labs.trim()?[{test:"بيانات سابقة",result:d.labs,status:"review"}]:[]);
  const conditions=Array.isArray(d.diseases?.items)?d.diseases.items:(Array.isArray(d.diseases)?d.diseases:typeof d.diseases==="string"&&d.diseases.trim()?[{name:"بيانات سابقة",status:"historical",impact:d.diseases}]:[]);
  const fitness=Array.isArray(d.capacity?.items)?d.capacity.items:(Array.isArray(d.capacity?.essentials)?d.capacity.essentials.map(x=>({item:x.item||x.key,status:x.status||"not_assessed",evidence:x.evidence||x.note||""})):typeof d.capacity==="string"&&d.capacity.trim()?[{item:"بيانات قدرة وظيفية سابقة",status:"not_assessed",evidence:d.capacity}]:[]);
  const groups=[
   ["التحاليل والفحوصات",labs.filter(x=>hasReviewValue(x.test)||hasReviewValue(x.result)||hasReviewValue(x.date)||hasReviewValue(x.status)),"labs"],
   ["الحالات الطبية",conditions.filter(x=>hasReviewValue(x.disease)||hasReviewValue(x.name)||hasReviewValue(x.level)||hasReviewValue(x.impact)||hasReviewValue(x.treatment)),"conditions"],
   ["Fitness Essentials",fitness.filter(x=>(x.status&&x.status!=="not_assessed")||hasReviewValue(x.evidence)),"fit"]
  ];
  return groups.filter(([,items])=>items.length).map(([title,items,kind])=>'<article class="medical-review-card"><h5>'+title+' ('+items.length+')</h5><ul>'+items.map(x=>'<li>'+esc(kind==="labs"?[x.test,x.result,x.unit,x.date,medMap.lab[x.status]].filter(Boolean).join(" — "):kind==="conditions"?[x.category_label||x.category,x.disease||x.name,x.level?"المستوى "+x.level:"",x.description,medMap.condition[x.status],x.treatment,x.impact].filter(Boolean).join(" — "):[x.item,medMap.fit[x.status],x.evidence].filter(Boolean).join(" — "))+'</li>').join("")+'</ul></article>').join("");
 }


 function renderFtwHse(data={}){
  const obs=["Reduced Concentration","Reduced Physical Capability","Behavioral Changes","Frequent Absence","Fatigue","Difficulty Performing Duties","Safety Concern","Security Concern","Other"];
  const checked=(arr,v)=>Array.isArray(arr)&&arr.includes(v)?" checked":"";
  $("mh-ftw-hse-editor").innerHTML='<div class="specialist-section ftw-subsection"><h4>Fitness to Work Form — Supervisor & HSE Input</h4><fieldset class="specialist-fieldset"><legend>Supervisor Observations / ملاحظات المشرف</legend><div class="ftw-observation-checks">'+obs.map(x=>'<label class="ftw-observation-check"><input type="checkbox" data-ftw-hse-observation value="'+hseEsc(x)+'"'+checked(data.supervisor_observations,x)+'><span>'+hseEsc(x)+'</span></label>').join("")+'</div></fieldset><div class="specialist-grid"><label>HSE Health Risk Category<select data-ftw-hse="risk_category"><option value="">اختر</option><option value="I — High Risk">I — High Risk</option><option value="II — Medium Risk">II — Medium Risk</option><option value="III — Low Risk">III — Low Risk</option></select></label><label>Safety-Critical Decision Maker<select data-ftw-hse="safety_critical"><option value="">اختر</option><option value="yes">Yes</option><option value="no">No</option></select></label><label>Specify Safety-Critical Role<input data-ftw-hse="safety_critical_specify"></label><label>Emergency Response Duties<select data-ftw-hse="emergency_duties"><option value="">اختر</option><option value="yes">Yes</option><option value="no">No</option></select></label><label>Specify Emergency Duties<input data-ftw-hse="emergency_specify"></label><label>HSE Representative Name<input data-ftw-hse="hse_name"></label><label>HSE Reference Number<input data-ftw-hse="hse_pr"></label></div></div>';
  document.querySelectorAll("#mh-ftw-hse-editor [data-ftw-hse]").forEach(el=>el.value=data[el.dataset.ftwHse]||"");
 }
 function collectFtwHse(){
  const out={};document.querySelectorAll("#mh-ftw-hse-editor [data-ftw-hse]").forEach(el=>out[el.dataset.ftwHse]=el.value.trim());
  out.supervisor_observations=[...document.querySelectorAll("#mh-ftw-hse-editor [data-ftw-hse-observation]:checked")].map(x=>x.value);return out;
 }
 function renderFtwMedical(data={}){
  const types=["Pre-Employment","Return-to-Work","Job Transfer","Periodic Medical Examination","Post-Incident Assessment","Other"];
  const functional=["Walk Long Distances","Carrying","Climbing","Kneeling","Reaching","Long standing","Lifting","Balance","Repetitive Movements","Enter Confined Spaces","Wearing PPE","Wear Respiratory"];
  const tests=["ECG","Spirometry","Audiometry","Additional Labs","Additional Imaging","Others"];
  const val=(k)=>esc(data[k]||"");
  const vitals=data.vitals||{};
  $("mm-ftw-medical").innerHTML='<div class="medical-step"><div class="medical-step-title"><span>FTW</span><div><h4>Fitness to Work Evaluation Form — Medical Details</h4><p>الحقول الإضافية المطلوبة في النموذج المرجعي.</p></div></div><div class="specialist-grid"><label>Age<input data-ftw-med="worker_age" value="'+val("worker_age")+'"></label><label>Department<input data-ftw-med="department" value="'+val("department")+'"></label><label>Assessment Type<select data-ftw-med="assessment_type"><option value="">Select</option>'+types.map(x=>'<option>'+x+'</option>').join("")+'</select></label><label>Review Date<input type="date" data-ftw-med="review_date" value="'+val("review_date")+'"></label><label>Physician Name<input data-ftw-med="physician_name" value="'+val("physician_name")+'"></label><label>Physician PR<input data-ftw-med="physician_pr" value="'+val("physician_pr")+'"></label></div><fieldset class="specialist-fieldset"><legend>History Findings</legend><div class="specialist-grid"><label>Medical History Findings<textarea data-ftw-med="medical_history">'+val("medical_history")+'</textarea></label><label>Current Diseases<textarea data-ftw-med="current_diseases">'+val("current_diseases")+'</textarea></label><label>Occupational History<textarea data-ftw-med="occupational_history">'+val("occupational_history")+'</textarea></label><label>Medication Review<textarea data-ftw-med="medication_review">'+val("medication_review")+'</textarea></label></div></fieldset><fieldset class="specialist-fieldset"><legend>General Examination / Vital Signs</legend><div class="specialist-grid">'+[["bp","BP"],["hr","HR"],["spo2","PO2 / SpO2"],["glucose","Blood Glucose"],["hba1c","HbA1c"],["weight","Weight (kg)"],["height","Height (cm)"],["bmi","BMI (kg/m²)"]].map(([k,l])=>{const calculated=k==="bmi";const step=(k==="weight"||k==="height")?"0.1":"any";return '<label>'+l+'<input data-ftw-vital="'+k+'" type="number" min="0" step="'+step+'" '+(calculated?'readonly aria-readonly="true" title="يُحسب تلقائياً من الوزن والطول"':'placeholder="أدخل القيمة"')+' value="'+esc(vitals[k]||"")+'"></label>';}).join("")+'</div></fieldset></div>';
  const sel=$("mm-ftw-medical").querySelector('[data-ftw-med="assessment_type"]');if(sel)sel.value=data.assessment_type||"";
  const updateBmi=()=>{const w=Number($("mm-ftw-medical").querySelector('[data-ftw-vital="weight"]')?.value),h=Number($("mm-ftw-medical").querySelector('[data-ftw-vital="height"]')?.value),b=$("mm-ftw-medical").querySelector('[data-ftw-vital="bmi"]');if(!b)return;b.value=w>0&&h>0?(w/Math.pow(h/100,2)).toFixed(1):"";};
  ["weight","height"].forEach(k=>$("mm-ftw-medical").querySelector('[data-ftw-vital="'+k+'"]')?.addEventListener("input",updateBmi));updateBmi();
 }
 function collectFtwMedical(){
  const out={};document.querySelectorAll("#mm-ftw-medical [data-ftw-med]").forEach(el=>out[el.dataset.ftwMed]=el.value.trim());
  out.vitals={};document.querySelectorAll("#mm-ftw-medical [data-ftw-vital]").forEach(el=>out.vitals[el.dataset.ftwVital]=el.value.trim());
  return out;
 }
 function ftwPrintValue(v){
  if(v===null||v===undefined)return "";
  if(Array.isArray(v))return v.map(ftwPrintValue).filter(Boolean).join(" · ");
  if(typeof v==="object")return Object.entries(v).map(([k,x])=>x!==""&&x!==null&&x!==undefined?k+": "+ftwPrintValue(x):"").filter(Boolean).join(" · ");
  return String(v).trim();
 }
 function ftwPrintTable(rows){
  const clean=(rows||[]).map(([k,v])=>[k,ftwPrintValue(v)]).filter(([,v])=>v!==""&&v!=="—");
  if(!clean.length)return "";
  return '<table class="ftw-table"><tbody>'+clean.map(([k,v])=>'<tr><th>'+esc(k)+'</th><td>'+esc(v).replace(/\n/g,"<br>")+'</td></tr>').join("")+'</tbody></table>';
 }
 function ftwPrintSection(title,rows){
  const table=ftwPrintTable(rows);
  return table?'<section class="report-section"><h2>'+esc(title)+'</h2>'+table+'</section>':"";
 }
 function ftwPrintHazards(items){
  const clean=(items||[]).filter(x=>[x.category,x.name,x.severity_label,x.severity,x.frequency,x.controls,x.residual,x.notes].some(v=>ftwPrintValue(v)));
  if(!clean.length)return "";
  return '<section class="report-section"><h2>Hazardous Exposures</h2><table class="ftw-table"><thead><tr><th>Hazard Category</th><th>Hazard</th><th>Severity</th><th>Exposure Frequency</th><th>Frequency Scale</th><th>Duration Scale</th><th>Probability Scale</th><th>Control Effectiveness</th><th>Controls</th><th>Residual Risk</th></tr></thead><tbody>'+clean.map(x=>'<tr>'+[x.category,x.name,x.severity_label||x.severity,exposureLabels[x.frequency]||x.frequency,x.frequency_scale,x.duration_scale,x.probability_scale,x.control_effectiveness,x.controls,x.residual].map(v=>'<td>'+esc(ftwPrintValue(v)||"—")+'</td>').join("")+'</tr>').join("")+'</tbody></table></section>';
 }
 function renderIndexReport(hd={},md={}){
  const calculated=window.MOFASA_POFriBridge?.calculate?.(hd,md,"")||null,stored=md.preliminary_analysis||{};
  const pofri=calculated?.total!==null&&calculated?.total!==undefined?calculated:(Number.isFinite(Number(stored.total))?stored:calculated);
  const cri=window.MOFASA_CRI?.calculate?.({hse:hd,medical:md})||null;
  const componentText=items=>Object.entries(items||{}).filter(([,v])=>v!==null&&v!==undefined).map(([k,v])=>k+": "+v).join(" · ");
  const card=(title,score,band,formula,components,meaning,notes,gaps)=>'<article class="index-report-card"><h3>'+esc(title)+'</h3>'+(score!==null&&score!==undefined&&Number.isFinite(Number(score))?'<div class="index-report-score"><strong>'+esc(score)+'</strong><span>/ 100</span></div><b class="index-report-band">'+esc(band||"نتيجة استرشادية")+'</b>':'<div class="index-report-incomplete">غير مكتمل – لا توجد نتيجة قابلة للحساب</div>')+(formula?'<p><strong>المعادلة:</strong> '+esc(formula)+'</p>':'')+(components?'<p><strong>المحاور:</strong> '+esc(components)+'</p>':'')+'<p>'+esc(meaning)+'</p>'+(gaps?'<p class="index-report-gaps"><strong>النواقص:</strong> '+esc(gaps)+'</p>':'')+(notes?'<p class="index-report-note">'+esc(notes)+'</p>':'')+'</article>';
  const pofriGap=pofri?.reason||pofri?.gaps?.join("؛ ")||"يلزم استكمال بيانات المهمة والمخاطر والحالة الطبية والقدرة الوظيفية وجاهزية الموقع.";
  const criGaps=Array.isArray(cri?.gaps)?cri.gaps.join("؛ "):"";
  const pofriHtml=card("POFRI – مؤشر التوافق الطبي والمهني",pofri?.total,pofri?.band,pofri?.formula||"0.30R + 0.30M + 0.25F + 0.15E",componentText(pofri?.components),"يقيس مستوى القلق أو الفجوات المحتملة في توافق العامل مع المهمة وظروف الموقع. الصفر يعني أقل مستوى قلق وفق المدخلات، و100 أعلى مستوى قلق؛ ولا يمثل الرقم نسبة احتمال إصابة أو نسبة لياقة.",pofri?.band_note||pofri?.limitation||"مؤشر تجريبي غير معاير، ولا يغيّر قرار اللياقة أو تصنيف A/B/C/D.",pofri?.total===null?pofriGap:"");
  const criHtml=card("MOFASA-CRI – مؤشر المخاطر المركب",cri?.total,cri?.label||cri?.band,cri?.formula||"CRI = 0.40T + 0.30H + 0.20F + 0.10S",componentText(cri?.components),"يقيس مستوى المخاطر المهنية والصحية والوظيفية وظروف الموقع وفق البيانات المسجلة. القيم الأعلى تعني مستوى قلق أعلى، ولا تمثل احتمالاً إحصائياً للإصابة أو تشخيصاً طبياً.",cri?.note||"مؤشر تجريبي غير مُعاير أو مُعتمد؛ لا يصدر قرار لياقة.",cri?.total===null?criGaps||"استكمل سجل الأخطار والمهام والحالات الطبية ومتطلبات اللياقة وجاهزية الموقع.":"");
  return '<section class="report-data-section index-report"><h2>المؤشرات الرقمية الاسترشادية</h2><div class="index-report-grid">'+pofriHtml+criHtml+'</div><p class="index-separation-note"><strong>ملاحظة منهجية:</strong> المؤشران مستقلان ويقيس كل منهما أبعاداً مختلفة؛ لا يتم جمعهما أو حساب متوسط بينهما. ولا يحل أي منهما محل قرار الطبيب المختص أو قواعد السلامة الحرجة.</p></section>';
 }
 async function buildFtwReportDocument(id){
  if(!isAdmin())return null;
  const p=parent||{};
  const hd=hseRow?.section_data||{},md=medicalRow?.section_data||{},adminFtw=md.ftw||{};
  const actorName=value=>{const raw=String(value||"").trim();if(!raw)return "";const part=raw.includes("@")?raw.split("@")[0]:raw;return part.replace(/[._-]+/g," ").trim();};
  const hseOfficer=hd._meta?.safety_officer_name||hd.ftw?.safety_officer_name||actorName(hd._meta?.last_edited_by_email);
  const physician=adminFtw.physician_name||actorName(md._meta?.last_edited_by_email);
  const adminData={"العمر عند التقييم":adminFtw.worker_age,"الإدارة":adminFtw.department,"نوع التقييم":adminFtw.assessment_type,"اسم الطبيب":physician,"اسم مسؤول السلامة":hseOfficer};
  const professionalData={"المسمى الوظيفي":p.job_title,"المهمة":p.task_name,"مدة الوردية":p.shift_duration};
  const adminSection=renderReportKeyValueTable(adminData,"report-admin-table");
  const professionalRows=[];
  const professionalMeta=renderReportKeyValueTable(professionalData,"report-professional-table");
  if(professionalMeta)professionalRows.push(professionalMeta);
  if(canHseRead()&&hasCompletedReviewValue(hd)){
   const hseDisplay={tasks:hd.tasks,tra:hd.tra,job_task:hd.job_task,emergency:hd.emergency,ftw:hd.ftw,notes:hd.notes};
   const hseRows=reviewRows(hseDisplay,{expanded:true,report:true,section:"hse"});
   if(hseRows)professionalRows.push('<div class="report-subsection"><h3>بيانات السلامة والمهام</h3>'+hseRows+'</div>');
   const jem=renderJemReview(hseRow);if(jem)professionalRows.push(jem);
   const demands=renderSelectedDemands(hd.demands);if(demands)professionalRows.push(demands);
  }
  const professionalSection=professionalRows.length?'<section class="report-data-section report-professional-section"><h2>ثانياً: البيانات المهنية</h2>'+professionalRows.join("")+'</section>':'';
  const medicalRows=[];
  if(canMedicalRead()&&(hasCompletedReviewValue(md)||medicalRow?.final_decision)){
   const history=renderMedicalHistory(md.diseases,{expanded:true,report:true});
   const groups=renderMedicalReviewGroups(md,{expanded:true,report:true});
   if(history)medicalRows.push(history);if(groups)medicalRows.push(groups);
   if(medicalRow?.final_decision)medicalRows.push('<div class="completed-review-row"><strong>الرأي الطبي النهائي</strong><div>'+esc(reviewValue(medicalRow.final_decision))+'</div></div>');
  }
  const medicalSection=medicalRows.length?'<section class="report-data-section report-medical-section"><h2>ثالثاً: البيانات الطبية</h2>'+medicalRows.join("")+'</section>':'';
  const review='<section class="report-data-section report-admin-section"><h2>أولاً: البيانات الإدارية</h2>'+adminSection+'</section>'+professionalSection+medicalSection;
  const logo='<svg class="brand-logo" viewBox="0 0 64 64" role="img" aria-label="MOFASA"><path d="M32 3 55 16v28L32 61 9 44V16Z" fill="#123b4a"/><path d="M19 43V22l13 12 13-12v21" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 49h16" stroke="#9bc5c8" stroke-width="3" stroke-linecap="round"/></svg>';
  const header='<header class="report-header" dir="rtl"><div class="brand-lockup">'+logo+'<div><strong>MOFASA</strong><span>نظام التقييم الطبي والمهني المتكامل للياقة للعمل</span><small>Medico-Occupational Fitness Assessment Scale Advance</small></div></div><div class="report-title"><h1>ملف تقييم MOFASA</h1><span>تقرير فردي سري</span></div></header>';
  const workerRows=[["الرقم الوظيفي",p.registration_number],["تاريخ التقييم",p.assessment_date],["الموقع",p.site]];const worker='<section class="worker-card"><div class="worker-main"><span class="eyebrow">MOFASA Individual Assessment</span><h2>'+esc(p.worker_name||"")+"</h2></div><div class=\"worker-meta\">"+workerRows.filter(([,v])=>v!==null&&v!==undefined&&String(v).trim()!=="").map(([k,v])=>'<div><span>'+esc(k)+'</span><strong>'+esc(v)+'</strong></div>').join("")+'</div></section>';
  const signatures='<section class="report-signatures"><div class="signature-box"><strong>توقيع الطبيب</strong><span>الاسم: ........................................</span><span>التوقيع: .....................................</span><span>التاريخ: ......................................</span></div><div class="signature-box"><strong>توقيع مسؤول السلامة</strong><span>الاسم: ........................................</span><span>التوقيع: .....................................</span><span>التاريخ: ......................................</span></div></section>';
  const report=header+worker+(review||'<section class="empty-review">لا توجد بيانات مكتملة مسجلة لهذا العامل.</section>')+renderPofriReport(medicalRow?.section_data?.preliminary_analysis)+signatures+'<footer><strong>MOFASA – نسخة تطويرية تجريبية.</strong> هذا التقرير يعرض البيانات المسجلة فقط. لا يُعد تشخيصاً طبياً أو قراراً نهائياً بشأن اللياقة أو التوظيف. المؤشرات الرقمية استرشادية غير معايرة ولا تحل محل الحكم الطبي المختص.</footer>';
  return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ملف تقييم MOFASA — '+esc(p.registration_number||p.worker_name||id)+'</title><style>'+
  '@page{size:A4 portrait;margin:9mm 10mm}*{box-sizing:border-box}html,body{margin:0;padding:0}body{font:8pt Tahoma,Arial,sans-serif;color:#18323a;direction:rtl;line-height:1.3;background:#fff}.report-header{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1.5px solid #17495a;padding:0 0 3px;margin-bottom:4px}.brand-lockup{display:flex;align-items:center;gap:6px}.brand-logo{width:36px;height:36px;flex:0 0 36px}.brand-lockup strong{display:block;font-size:12pt;letter-spacing:.4px;color:#123b4a}.brand-lockup span,.brand-lockup small{display:block;color:#536b72;font-size:6.8pt}.brand-lockup small{font-size:6pt;direction:ltr;text-align:right}.report-title{text-align:left}.report-title h1{font-size:11pt;color:#123b4a;margin:0 0 1px}.report-title span{font-size:6.8pt;color:#64777d}.worker-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 6px;padding:4px 6px;margin:0 0 4px;border:1px solid #d4e0e3;border-right:3px solid #17495a;border-radius:5px;background:#f7fafb;break-inside:avoid}.worker-main h2{font-size:11pt;margin:1px 0;color:#173f4b}.worker-main p{margin:1px 0;color:#526a72;font-size:7.5pt}.eyebrow{font-size:6.5pt;color:#607982}.worker-id{align-self:center;padding:3px 7px;border-radius:4px;background:#e4eef0;color:#17495a;font-weight:700;direction:ltr;font-size:7pt}.worker-meta{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px}.worker-meta>div{padding:2px 3px;background:#fff;border:1px solid #e0e8ea;border-radius:3px;min-width:0}.worker-meta span,.worker-meta strong{display:block}.worker-meta span{font-size:6pt;color:#657a80}.worker-meta strong{font-size:6.8pt;margin-top:1px;overflow-wrap:anywhere}.completed-review{margin:0!important;padding:0!important;border:0!important}.completed-review>h4{font-size:9pt;margin:3px 0 2px;padding:0 0 2px;border-bottom:1px solid #cbdadd;color:#123b4a}.completed-review>.specialist-help{font-size:6.3pt;color:#60747a;margin:0 0 2px}.medical-review-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px 5px;align-items:start}.review-section{grid-column:1/-1}.jem-review,.demand-review{grid-column:1/-1}.review-section,.review-entry,.report-section,.report-audit{border:1px solid #d5e1e4;border-radius:4px;padding:3px 4px;margin:0 0 3px;background:#fff;box-shadow:none;break-inside:auto;min-width:0}.review-disclosure summary{display:flex;justify-content:space-between;align-items:center;gap:5px;list-style:none;color:#123b4a;font-size:7.4pt;font-weight:700;padding:0}.review-disclosure summary::-webkit-details-marker{display:none}.review-disclosure summary span{font-size:6pt;color:#627a81;white-space:nowrap}.review-disclosure-body{margin-top:2px}.medical-review-section>.review-disclosure-body{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px 5px;align-items:start}.medical-review-section>.review-disclosure-body>.review-group{grid-column:1/-1}.medical-review-section>.review-disclosure-body>.completed-review-row{min-width:0}.medical-review-subgroup{margin:0;padding:3px 4px;min-width:0}.completed-review-row{display:grid;grid-template-columns:minmax(72px,30%) minmax(0,1fr);gap:4px;padding:2px 1px;border-bottom:1px solid #edf1f2;break-inside:avoid;font-size:6.8pt;min-width:0}.completed-review-row:last-child{border-bottom:0}.completed-review-row>strong{color:#405c64}.completed-review-row ul{margin:0;padding-right:13px}.completed-review-row li{margin:0}.jem-review h4,.demand-review h4{font-size:7.6pt;color:#17495a;margin:0 0 2px}.jem-table,.report-audit table{width:100%;border-collapse:collapse;font-size:6.3pt;table-layout:auto}.jem-table th,.jem-table td,.report-audit th,.report-audit td{border:1px solid #d6e1e3;padding:2px 3px;text-align:right;vertical-align:top;overflow-wrap:anywhere}.jem-table th,.report-audit th{background:#eaf1f2;color:#294c55;font-weight:700}.demand-review .completed-review-row{grid-template-columns:27% 1fr}.report-audit{margin-top:4px}.report-audit h2{font-size:8pt;color:#17495a;margin:0 0 2px}.audit-warning{color:#8a4b20;font-size:6.5pt}.empty-review{padding:5px;border:1px dashed #ccdadd;border-radius:4px;color:#657a80}.indicator-summary{display:flex;align-items:center;gap:6px;flex-wrap:wrap;border:1px solid #cbdadd;border-radius:4px;padding:3px 5px;margin:3px 0;background:#f5f9fa;font-size:6.8pt}.indicator-summary strong{color:#17495a}.indicator-summary span{font-weight:700;direction:ltr;color:#123b4a}.indicator-summary b{font-weight:600;color:#526a72}footer{border-top:1px solid #cbd8dc;margin-top:4px;padding-top:3px;font-size:6pt;color:#586e75;line-height:1.25}footer strong{color:#17495a}details>*{display:block!important}details>summary{list-style:none}section{break-inside:auto}table,tr,.worker-card,.completed-review-row{break-inside:avoid}thead{display:table-header-group}.report-one-column .completed-review-row{display:block!important;grid-template-columns:1fr!important}.report-one-column .completed-review-list,.report-one-column .specialist-grid,.report-one-column .medical-review-grid{display:block!important;grid-template-columns:1fr!important}.report-one-column .completed-review-row>strong{display:block;margin-bottom:1px}.medical-review-section>.review-disclosure-body{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:2px 3px!important;align-items:start}.medical-review-section>.review-disclosure-body>.review-entry{grid-column:auto!important;min-width:0}.medical-review-section>.review-disclosure-body>.review-group{grid-column:1/-1!important}.medical-review-section .medical-review-subgroup>.review-disclosure-body,.medical-review-section .review-group>.review-disclosure-body{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:1px 2px!important}.medical-review-section .completed-review-list{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:1px 2px!important;align-items:start}.medical-review-section .completed-review-list>.review-entry{min-width:0;margin:0!important}.medical-review-section .medical-review-subgroup>.review-disclosure-body>.completed-review-row,.medical-review-section .review-group>.review-disclosure-body>.completed-review-row{display:block!important;min-width:0;padding:1px 2px;border:1px solid #e1e9eb;border-radius:2px;overflow-wrap:anywhere;line-height:1.08}.medical-review-section .completed-review-row>strong{display:block;margin:0;font-size:5.7pt;line-height:1.05;color:#405c64}.medical-review-section .completed-review-row>div{font-size:6pt;line-height:1.08;overflow-wrap:anywhere}.medical-review-section .report-clinical-three-columns>.review-disclosure-body{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:1px 2px!important;align-items:start}.medical-review-section .report-clinical-three-columns .completed-review-row>div{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px 2px;align-items:start}.medical-review-section .report-clinical-three-columns .completed-review-row>div>.completed-review-row{display:block!important;min-width:0;padding:1px 2px;border:1px solid #e1e9eb;border-radius:2px;overflow-wrap:anywhere;line-height:1.08}.medical-review-section .report-clinical-three-columns .completed-review-row>div>.completed-review-row>strong{display:block;font-size:5.7pt}.medical-review-section .report-clinical-three-columns .completed-review-row>div>.completed-review-row>div{display:block;font-size:6pt}.medical-review-section .report-fit-essentials .completed-review-list{display:grid!important;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);grid-template-columns:none!important;gap:1px 2px!important;align-items:stretch}.medical-review-section .report-fit-essentials .completed-review-list>.review-entry{min-width:0;margin:0!important}.medical-review-section .report-fit-essentials .completed-review-list>.review-entry>summary{display:block!important;padding:1px 2px;font-size:5.4pt;line-height:1.05;overflow-wrap:anywhere}.medical-review-section .report-fit-essentials .completed-review-list>.review-entry>.review-disclosure-body{display:block!important;padding:1px 2px;font-size:5.2pt;line-height:1.05;overflow-wrap:anywhere}.medical-review-section .report-no-label>strong{display:none!important}.medical-review-section .report-no-label{grid-template-columns:1fr!important}.medical-review-section .report-no-heading>summary{display:none!important}.report-signatures{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:6px 0 0;break-inside:avoid}.signature-box{border:1px solid #bfcfd3;border-radius:4px;padding:5px 7px;min-height:53px;display:flex;flex-direction:column;gap:5px;background:#fbfdfd}.signature-box strong{font-size:7.3pt;color:#17495a;border-bottom:1px solid #d9e3e5;padding-bottom:3px}.signature-box span{font-size:6.6pt;color:#405b62;white-space:nowrap}.report-one-column .completed-review-row>strong{display:block;margin-bottom:1px} /* Refined A4 report theme: table-led layout inspired by the JEM register. */ @page{size:A4 portrait;margin:9mm 9mm 10mm} html,body{background:#fff} body{font:8pt/1.32 Tahoma,Arial,sans-serif;color:#203640} .report-header{gap:14px;border-bottom:2px solid #17495a;padding:0 0 7px;margin-bottom:8px} .brand-logo{width:42px;height:42px;flex-basis:42px} .brand-lockup{gap:8px} .brand-lockup strong{font-size:15pt} .brand-lockup span{font-size:8pt} .brand-lockup small{font-size:6.8pt} .report-title h1{font-size:14pt;margin-bottom:3px} .report-title span{font-size:8pt} .worker-card{gap:6px 9px;padding:7px 9px;margin-bottom:8px;border:1px solid #cbdadd;border-right:4px solid #17495a;border-radius:6px;background:#f3f7f8} .worker-main h2{font-size:14pt;margin:2px 0 3px} .worker-main p{font-size:8.5pt;margin:2px 0} .eyebrow{font-size:7.5pt;font-weight:700;color:#54717a} .worker-id{padding:5px 9px;font-size:8.5pt;border:1px solid #d0dfe2} .worker-meta{grid-template-columns:repeat(2,minmax(0,1fr));gap:4px} .worker-meta>div{padding:4px 6px;border:1px solid #d9e4e6;border-radius:4px;background:#fff} .worker-meta span{font-size:7pt} .worker-meta strong{font-size:8pt} .completed-review{margin-top:2px!important} .medical-review-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px} .review-section,.review-entry,.report-section,.report-audit{border:1px solid #cbdadd;border-radius:5px;padding:5px 6px;margin:0 0 5px;background:#fff;box-shadow:0 1px 2px rgba(20,55,65,.06)} .review-section>summary,.review-entry>summary{padding:2px 0 4px;border-bottom:1px solid #dce6e8} .review-disclosure summary{font-size:8.5pt;color:#143f4b} .review-disclosure summary span{font-size:7pt} .review-disclosure-body{margin-top:4px} .medical-review-section>.review-disclosure-body{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:5px!important} .medical-review-section>.review-disclosure-body>.review-group{grid-column:1/-1!important} .medical-review-subgroup{padding:5px 6px;border-color:#d2dfe2;background:#fbfdfd} .medical-review-subgroup>summary{padding-bottom:4px;margin-bottom:3px} .completed-review-row{gap:5px;padding:4px 5px;border:1px solid #e0e8ea;border-radius:4px;background:#fbfcfc;font-size:7.6pt} .completed-review-row>strong{color:#31545e;font-size:7.3pt} .completed-review-row ul{padding-right:15px} .completed-review-row li{margin:1px 0} .jem-review h4,.demand-review h4{font-size:9pt;color:#143f4b;margin:0 0 5px;padding:5px 7px;background:#eaf1f2;border-right:3px solid #17495a;border-radius:3px} .jem-table,.report-audit table{font-size:7.5pt;border-collapse:collapse;width:100%;table-layout:auto} .jem-table th,.jem-table td,.report-audit th,.report-audit td{border:1px solid #c7d6da;padding:5px 6px;text-align:right;vertical-align:middle;overflow-wrap:anywhere} .jem-table th,.report-audit th{background:#e5eef0;color:#173f4b;font-size:7.4pt;font-weight:700} .jem-table tbody tr:nth-child(even) td,.report-audit tbody tr:nth-child(even) td{background:#f7fafb} .demand-review .completed-review-row{grid-template-columns:28% minmax(0,1fr);margin:3px 0} .demand-review .completed-review-row ul{display:flex;flex-wrap:wrap;gap:3px 12px} .empty-review{padding:9px;border:1px dashed #b9cbd0;border-radius:5px;background:#f8fbfb;font-size:8.5pt} .indicator-summary{gap:9px;padding:6px 9px;margin:6px 0;border:1px solid #bdcfd4;border-right:4px solid #17495a;border-radius:5px;background:#f0f6f7;font-size:8pt} .indicator-summary span{font-size:10pt} footer{margin-top:7px;padding-top:6px;border-top:1px solid #cbd8dc;font-size:7pt;line-height:1.4;color:#526a72} .report-signatures{gap:10px;margin:8px 0 2px} .signature-box{padding:7px 9px;min-height:62px;border:1px solid #bdcfd4;border-top:3px solid #17495a;border-radius:5px;background:#fbfdfd;gap:6px} .signature-box strong{font-size:8.5pt;padding-bottom:4px} .signature-box span{font-size:7.5pt} .medical-review-section .report-clinical-three-columns>.review-disclosure-body{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:4px!important} .medical-review-section .report-clinical-three-columns .completed-review-row>div{grid-template-columns:repeat(3,minmax(0,1fr));gap:3px} .medical-review-section .report-clinical-three-columns .completed-review-row>div>.completed-review-row{padding:4px 5px;border:1px solid #d7e2e5;border-radius:4px;background:#f8fbfb} .medical-review-section .report-clinical-three-columns .completed-review-row>div>.completed-review-row>strong{font-size:7pt;line-height:1.2;color:#31545e} .medical-review-section .report-clinical-three-columns .completed-review-row>div>.completed-review-row>div{font-size:7.6pt;line-height:1.25} .medical-review-section .report-fit-essentials .completed-review-list{grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);grid-template-columns:none!important;gap:4px!important} .medical-review-section .report-fit-essentials .completed-review-list>.review-entry{border:1px solid #cbdadd;border-radius:4px;background:#f5f9fa;padding:4px 5px} .medical-review-section .report-fit-essentials .completed-review-list>.review-entry>summary{font-size:7pt;line-height:1.2;padding:0 0 3px;border-bottom:1px solid #dce6e8} .medical-review-section .report-fit-essentials .completed-review-list>.review-entry>.review-disclosure-body{font-size:7.3pt;line-height:1.25;padding:3px 0 0} .medical-review-section .completed-review-row>strong{font-size:7.2pt;line-height:1.2} .medical-review-section .completed-review-row>div{font-size:7.6pt;line-height:1.25} .medical-review-section .report-no-label{padding:4px 5px} .medical-review-section .report-no-heading>summary{display:none!important} .report-signatures{break-inside:avoid} .report-section h2{font-size:10pt;color:#17495a;border-bottom:1px solid #cbdadd;padding:5px 0;margin:8px 0} table{max-width:100%} @media print{ html,body{width:100%;height:auto;background:#fff} body{-webkit-print-color-adjust:exact;print-color-adjust:exact} .report-header,.worker-card,.review-section,.review-entry,.report-audit,.jem-table th,.report-audit th,.signature-box,.indicator-summary{print-color-adjust:exact;-webkit-print-color-adjust:exact} details>*{display:block!important} details>summary{list-style:none} a{color:inherit;text-decoration:none} thead{display:table-header-group} tr,.worker-card,.signature-box,.report-signatures,.completed-review-row{break-inside:avoid}   }'+
  '.report-header{break-after:avoid}.worker-card{break-inside:avoid}.report-page-two{break-before:page;page-break-before:always}.report-page-three{break-before:page;page-break-before:always}.report-page-two>.review-disclosure-body{display:block!important}.report-page-two .medical-review-subgroup{break-inside:avoid}.report-page-three{margin-top:0}.medical-review-section>.review-disclosure-body{display:block!important}.medical-review-section>.review-disclosure-body>.medical-review-subgroup{margin-bottom:6px}.report-page-two>summary,.report-page-three>summary{display:none!important}.report-page-two{border:0!important;padding:0!important}.report-page-two>.review-disclosure-body{margin-top:0!important}.report-page-two .review-entry>summary{display:block!important}.worker-meta{grid-template-columns:repeat(3,minmax(0,1fr))!important}.jem-table{table-layout:fixed}.jem-table th:nth-child(1){width:48%}.jem-table th:nth-child(2){width:26%}.jem-table th:nth-child(3){width:26%}@media print{.report-page-two{break-before:page!important;page-break-before:always!important}.report-page-three{break-before:page!important;page-break-before:always!important}.report-header{break-after:avoid}.worker-card{break-inside:avoid}}'+'.report-kv-wrap{width:100%;margin:3px 0 6px;break-inside:auto}.report-kv-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:8.2pt;line-height:1.3}.report-kv-table th,.report-kv-table td{border:1px solid #cbdadd;padding:4px 7px;text-align:right;vertical-align:middle;overflow-wrap:anywhere;white-space:normal}.report-kv-table th{background:#e5eef0;color:#173f4b;font-weight:700}.report-kv-table td:first-child{width:30%;font-weight:700;color:#31545e}.report-kv-table td:last-child{width:70%}.report-data-section{margin:0 0 8px;break-inside:auto}.report-data-section>h2{font-size:10pt;color:#17495a;background:#edf3f4;border-right:3px solid #17495a;padding:5px 8px;margin:7px 0 5px}.report-subsection>h3{font-size:8.5pt;color:#31545e;margin:5px 0 3px;padding-bottom:2px;border-bottom:1px solid #d6e1e3}.report-professional-section,.report-medical-section{clear:both}.report-admin-table,.report-professional-table{width:100%}.report-kv-table tbody tr:nth-child(even) td{background:#f7fafb}.report-fit-table .report-kv-table th:first-child,.report-fit-table .report-kv-table td:first-child{width:24%}@media print{.report-kv-table tr{break-inside:avoid}.report-kv-table th{print-color-adjust:exact;-webkit-print-color-adjust:exact}}'+'</style></head><body>'+report+'<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>';
 }
 function printFtwReport(id){
  if(!isAdmin())return;
  const pop=window.open("","_blank","width=1000,height=800");if(!pop){msg("يرجى السماح بالنوافذ المنبثقة لطباعة التقرير.","error");return;}
  pop.document.open();pop.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>جارٍ تجهيز التقرير</title></head><body style="font:16px Tahoma;padding:30px;direction:rtl">جارٍ تجهيز تقرير العامل...</body></html>');pop.document.close();
  buildFtwReportDocument(id).then(html=>{if(!html){pop.close();return;}pop.document.open();pop.document.write(html);pop.document.close();}).catch(error=>{pop.document.body.textContent="تعذر تجهيز التقرير: "+(error?.message||"خطأ غير معروف");});
 }
 async function exportFtwWord(id){
  if(!isAdmin())return;
  const html=await buildFtwReportDocument(id);if(!html)return;
  const blob=new Blob(["\ufeff",html],{type:"application/msword;charset=utf-8"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  const base=String(parent?.registration_number||parent?.worker_name||id).replace(/[^a-zA-Z0-9_-]+/g,"-");
  a.href=url;a.download="MOFASA-Individual-Report-"+base+".doc";document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  msg("تم تجهيز تقرير Word الفردي.","success");
 }
 function buildRoleSectionReport(section,id){
  const isH=section==="hse";
  if(isH?!canHse():!canMedical())return null;
  const p=parent||{},hd=hseRow?.section_data||{},md=medicalRow?.section_data||{};
  const rows=[];
  if(isH){
   if(hseRow?.status!=="submitted")return null;
   const display={...hd};delete display.hazards;delete display.demands;delete display._meta;
   const basic=reviewRows(display,{expanded:true,report:true,section:"hse"});
   if(basic)rows.push('<section class="report-section"><h2>بيانات تقييم السلامة والمهام</h2>'+basic+'</section>');
   const jem=renderJemReview(hseRow);
   if(jem)rows.push(jem.replace('<h4>سجل الأخطار المهنية JEM</h4>','<h2>سجل الأخطار المهنية JEM</h2>'));
   const demands=renderSelectedDemands(hd.demands);
   if(demands)rows.push(demands.replace('<h4>متطلبات أداء الوظيفة</h4>','<h2>متطلبات أداء الوظيفة</h2>'));
  }else{
   if(medicalRow?.status!=="submitted")return null;
   const reportOptions={expanded:true,report:true};
   const groups=renderMedicalReviewGroups(md,reportOptions)+renderMedicalHistory(md.diseases,reportOptions);
   if(groups)rows.push('<section class="report-section"><h2>البيانات الطبية المستكملة</h2>'+groups+'</section>');
   const score=md.preliminary_analysis||{};
   if(score.total!==null&&score.total!==undefined)rows.push('<section class="report-section"><h2>المؤشر الرقمي التجريبي للمحاور الستة</h2><div class="completed-review-row"><strong>النتيجة</strong><div>'+esc(score.total+' / 100 — '+(score.band||""))+'</div></div><div class="completed-review-row"><strong>المعادلة</strong><div>'+esc(score.formula||"")+'</div></div><p>مؤشر تجريبي غير معاير؛ لا يمثل تشخيصاً أو قرار لياقة ولا يحل محل الحكم الطبي.</p></section>');
   if(medicalRow?.final_decision)rows.push('<section class="report-section"><h2>الرأي الطبي النهائي</h2><div class="completed-review-row"><strong>الرأي الطبي النهائي</strong><div>'+esc(reviewValue(medicalRow.final_decision))+'</div></div></section>');
  }
  if(!rows.length){msg("لا توجد بيانات مكتملة للطباعة في هذا القسم.","error");return null;}
  const title=isH?"تقرير قسم السلامة المهنية":"التقرير الطبي للعامل";
  const disclaimer=isH?"هذا التقرير يعرض بيانات السلامة والمهام المسجلة فقط، ولا يتضمن بيانات طبية. اكتمال قسم السلامة مستقل عن اعتماد الرأي الطبي.":"هذا التقرير يعرض البيانات الطبية المسجلة فقط، ولا يتضمن تفاصيل السلامة غير الطبية. اكتمال القسم الطبي مستقل عن استكمال قسم السلامة.";
  return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>'+title+' - '+esc(p.registration_number||p.worker_name||id)+'</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font:10.5pt Tahoma,Arial,sans-serif;color:#20343c;direction:rtl;line-height:1.55;margin:0}.report-header{text-align:center;border-bottom:2px solid #17495a;padding:0 0 10px;margin-bottom:14px}.report-header h1{font-size:18pt;margin:0;color:#123b4a}.report-header p{margin:4px 0;color:#526a72}.worker-meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;margin:12px 0}.worker-meta div{border-bottom:1px solid #d8e3e6;padding:5px}.report-section{margin:0 0 12px;break-inside:auto}.report-section h2,.specialist-section h4{font-size:12pt;color:#17495a;border-bottom:1px solid #b9cbd0;padding:5px 0;margin:10px 0}.completed-review-row{padding:5px 2px;border-bottom:1px solid #e5ecee;break-inside:avoid}.completed-review-row strong{display:block;color:#17495a;margin-bottom:2px}.review-disclosure{display:block;border:1px solid #d8e3e6;border-radius:6px;margin:7px 0;padding:6px}.review-disclosure summary{font-weight:700;color:#17495a}.review-disclosure-body{display:block!important}.jem-table,.review-disclosure table{width:100%;border-collapse:collapse;font-size:8.5pt}.jem-table th,.jem-table td,.review-disclosure th,.review-disclosure td{border:1px solid #cbd8dc;padding:5px;text-align:right;vertical-align:top;overflow-wrap:anywhere}.jem-table th,.review-disclosure th{background:#eef4f5}ul{margin:4px 0;padding-right:20px}footer{border-top:1px solid #cbd8dc;margin-top:18px;padding-top:8px;font-size:8.5pt;color:#526a72}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}details>*{display:block!important}details>summary{list-style:none}}</style></head><body><header class="report-header"><h1>MOFASA</h1><p>'+title+'</p></header><section class="worker-meta"><div><strong>اسم العامل:</strong> '+esc(p.worker_name)+'</div><div><strong>الرقم الوظيفي:</strong> '+esc(p.registration_number)+'</div><div><strong>الوظيفة:</strong> '+esc(p.job_title)+'</div><div><strong>المهمة:</strong> '+esc(p.task_name)+'</div><div><strong>الموقع:</strong> '+esc(p.site)+'</div><div><strong>تاريخ التقييم:</strong> '+esc(p.assessment_date)+'</div></section>'+rows.join("")+'<footer>'+disclaimer+'<br>تم استخراج التقرير من نظام MOFASA.</footer></body></html>';
 }
 function printRoleSectionReport(section,id){
  const html=buildRoleSectionReport(section,id);if(!html)return;
  const pop=window.open("","_blank","width=1000,height=800");if(!pop){msg("يرجى السماح بالنوافذ المنبثقة لطباعة التقرير.","error");return;}
  pop.document.open();pop.document.write(html);pop.document.close();
  setTimeout(()=>{try{pop.focus();pop.print();}catch(e){msg("تعذر بدء الطباعة؛ استخدم أمر الطباعة من النافذة الجديدة.","error");}},500);
 }
 function exportRoleSectionWord(section,id){
  const html=buildRoleSectionReport(section,id);if(!html)return;
  const base=String(parent?.registration_number||parent?.worker_name||id).replace(/[^a-zA-Z0-9_-]+/g,"-");
  const name=section==="hse"?"MOFASA-HSE-Report-":"MOFASA-Medical-Report-";
  const blob=new Blob(["\uFEFF",html],{type:"application/msword;charset=utf-8"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name+base+".doc";document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);msg("تم تجهيز التقرير المنفصل بنجاح.","success");
 }
 function render(){
  root.innerHTML='<div class="workspace-head"><div><h3>MOFASA – التقييم المشترك</h3><p class="muted">ملف واحد للعامل والمهمة، مع قسم سلامة وقسم طبي مستقلين.</p></div><div class="mofasa-toolbar"><button type="button" class="secondary" id="mofasa-refresh">تحديث السجلات</button>'+(isAdmin()?'<button type="button" class="secondary" id="mofasa-archive-toggle">عرض الأرشيف</button><button type="button" id="mofasa-export-all">تصدير التقرير العام التفصيلي (Excel)</button>':'')+'</div></div>'+
   '<div class="notice"><strong>حوكمة الصلاحيات:</strong> يعمل قسم السلامة والقسم الطبي بصورة مستقلة ومتوازية؛ يمكن لكل مختص حفظ وإرسال قسمه فور الانتهاء دون انتظار القسم الآخر. تظل البيانات الطبية محمية، ولا يصدر القرار النهائي إلا بعد اكتمال القسمين واعتماد الرأي الطبي بواسطة الطبيب.</div>'+
   '<div class="specialist-section"><h4 id="mofasa-list-title">ملفات التقييم النشطة</h4><div id="mofasa-list" class="table-wrap">جارٍ تحميل السجلات...</div></div>'+
   '<section class="specialist-section" id="mofasa-selected" hidden><div id="mofasa-record-header"></div>'+
    (canHse()?'<form id="mofasa-hse-form"><h4>قسم مسؤول السلامة (HSE)</h4><p class="specialist-help">أكمل بيانات السلامة ثم اختر: حفظ كمسودة للعودة لاحقاً، أو إرسال مكتمل لاعتماد إنجاز قسم السلامة. لا يتطلب إرسال هذا القسم مراجعة الطبيب أو اعتماده؛ ويستكمل الطبيب القسم الطبي بصورة مستقلة.</p><div class="specialist-grid">'+'<div id="mh-tasks-editor"></div><div id="mh-ftw-hse-editor"></div>'+'<div id="mh-hazards-editor"></div>'+'<div id="mh-tra-editor"></div>'+'<div id="mh-demands-editor"></div>'+'<div id="mh-emergency-editor"></div>'+area("mh-notes","ملاحظات مسؤول السلامة","إجراءات التحكم والتوصيات")+'</div><div class="specialist-actions"><button type="button" class="secondary" id="mofasa-hse-draft">حفظ الملف كمسودة</button><button type="button" id="mofasa-hse-submit">إرسال كمكتمل من مسؤول السلامة</button></div><div id="mofasa-hse-lock" class="specialist-help"></div></form>':'')+
    (canMedical()?'<form id="mofasa-med-form"><h4>'+(isAdmin()?"استكمال البيانات الطبية (دون اعتماد)":"قسم طبيب الموقع")+'</h4><p class="specialist-help">'+(isAdmin()?"يمكن للمدير الأعلى استكمال البيانات وحفظ مسودة فقط؛ اعتماد الرأي الطبي النهائي حصري لطبيب الموقع.":"استكمل المحاور الطبية بصورة مستقلة عن قسم السلامة. يمكنك حفظ المسودة أو إرسال التقييم والرأي الطبي فور الانتهاء، حتى إذا كان قسم السلامة لا يزال قيد الاستكمال. يظل القرار النهائي حصرياً لطبيب الموقع.")+'</p><div class="medical-step"><div class="medical-step-title"><span>01</span><div><h4>الفحص السريري</h4><p>النتائج السريرية والفحص العام والأجهزة ذات الصلة بالوظيفة.</p></div></div>'+'<div id="mm-ftw-medical"></div><div id="mm-exam"></div></div><div class="medical-step"><div class="medical-step-title"><span>02</span><div><h4>التحاليل والفحوصات</h4><p>اسم الفحص والنتيجة والوحدة والتاريخ وأي نتيجة تحتاج مراجعة.</p></div></div>'+'<div id="mm-labs"></div>'+'</div><div class="medical-step"><div class="medical-step-title"><span>03</span><div><h4>التاريخ المرضي والحالات الطبية</h4><p>الحالات الحالية والسابقة، العلاج، مستوى السيطرة، والأثر الوظيفي.</p></div></div>'+'<div id="mm-diseases"></div>'+'</div><div class="medical-step"><div class="medical-step-title"><span>04</span><div><h4>القدرة الوظيفية وFitness Essentials</h4><p>مدى استيفاء المتطلبات الأساسية المسجلة في قسم السلامة.</p></div></div>'+'<div id="mm-capacity"></div>'+'</div><div class="medical-step"><div class="medical-step-title"><span>05</span><div><h4>القيود الطبية وخطة المتابعة</h4><p>القيود المؤقتة أو المستمرة، المراجعة المطلوبة، وتاريخ إعادة التقييم.</p></div></div>'+area("mm-restrictions","القيود والمتابعة الطبية","حدد القيد ومدته وسببه، وإجراءات التكييف الوظيفي، والمتابعة وتاريخ إعادة التقييم")+'</div><div class="medical-step"><div class="medical-step-title"><span>06</span><div><h4>الرأي الطبي النهائي</h4><p>يراعى فيه الفحص والحالة الطبية والقدرة ومتطلبات المهمة والمخاطر وبيئة الموقع.</p></div></div>'+'<div class="score-card"><h5>المؤشر الرقمي التجريبي للمحاور الستة</h5><p class="specialist-help">يُحسب بعد مراجعة MCM وتقييم القدرة الوظيفية وتسجيل التوافق الطبي الأولي، وقبل إصدار الرأي النهائي. النتيجة استرشادية ولا تحل محل الحكم الطبي.</p><label>التوافق الطبي الأولي<select id="mm-fit-compatibility"><option value="">لم يقيّم بعد</option><option value="compatible">متوافق مبدئياً</option><option value="restricted">متوافق بشروط / قيود</option><option value="temporary">يحتاج تأجيلاً مؤقتاً</option><option value="incompatible">غير متوافق مبدئياً</option><option value="pending">يحتاج مراجعة متخصصة</option></select></label><button type="button" class="secondary" id="mm-calculate-score">حساب المؤشر الأولي</button><div id="mm-preliminary-score-result" class="specialist-help" aria-live="polite"></div></div>'+'<label>الرأي الطبي النهائي<select id="mm-decision" '+(isAdmin()?"disabled":"")+'><option value="">لم يعتمد بعد</option><option value="fit">مستوفٍ لمتطلبات الوظيفة المحددة</option><option value="fit_with_restrictions">مستوفٍ بشروط وقيود</option><option value="temporarily_unfit">غير مستوفٍ مؤقتاً</option><option value="unfit">غير مستوفٍ لمتطلبات الوظيفة</option><option value="specialist_review">يحتاج مراجعة طبية متخصصة</option></select></label>'+area("mm-notes","مبررات القرار الطبي","الأساس الطبي والوظيفي للقرار، وأي نقاط تتطلب مراجعة متخصصة")+'</div><div class="specialist-actions"><button type="button" class="secondary" id="mofasa-med-draft">حفظ مسودة طبية</button>'+ (isAdmin()?'':'<button type="button" id="mofasa-med-submit">إرسال واعتماد الرأي الطبي</button>') + '</div><div id="mofasa-med-lock" class="specialist-help"></div></form>':'')+(isAdmin()?'<div class="specialist-section"><h4>سجل التدقيق</h4><div id="mofasa-audit" class="table-wrap">اختر ملفاً لعرض سجل التغييرات.</div></div>':'')+
   '</section><div id="mofasa-message" class="status" aria-live="polite"></div>';
  $("mofasa-refresh").onclick=()=>showingArchive?loadArchiveList():loadList();
  if(isAdmin()){$("mofasa-archive-toggle").onclick=()=>{showingArchive=!showingArchive;$("mofasa-archive-toggle").textContent=showingArchive?"عرض السجل النشط":"عرض الأرشيف";$("mofasa-list-title").textContent=showingArchive?"أرشيف التقييمات":"ملفات التقييم النشطة";$("mofasa-selected").hidden=true;showingArchive?loadArchiveList():loadList();};$("mofasa-export-all").onclick=exportAllAssessments;}

 }
 async function loadList(){
  const {data,error}=await client.from("mofasa_assessments").select("id,worker_name,registration_number,job_title,task_name,assessment_date,site,hse_status,medical_status,archived_at").is("archived_at",null).order("assessment_date",{ascending:false}).limit(500);
  if(error){$("mofasa-list").textContent="تعذر تحميل الملفات: "+error.message;return;}
  rows=data||[];
  const ownStatus=role==="hse_admin"?"hse_status":role==="medical_admin"?"medical_status":null;
  const isOwnComplete=x=>ownStatus?x[ownStatus]==="submitted":x.hse_status==="submitted"&&x.medical_status==="submitted";
  const complete=rows.filter(isOwnComplete);
  const incomplete=rows.filter(x=>!isOwnComplete(x));
  const completeTitle=role==="hse_admin"?"مكتمل لدى مسؤول السلامة":role==="medical_admin"?"مكتمل لدى الطبيب":"مكتمل – القسمان معتمدان";
  const incompleteTitle=role==="hse_admin"?"بانتظار استكمال مسؤول السلامة":role==="medical_admin"?"بانتظار استكمال الطبيب":"بانتظار استكمال أحد القسمين";
  const incompleteDescription=role==="hse_admin"?"تحتاج إلى استكمال أو إرسال قسم السلامة فقط؛ لا يتوقف ذلك على عمل الطبيب.":role==="medical_admin"?"يمكن للطبيب استكمال وإرسال القسم الطبي بصورة مستقلة عن حالة قسم السلامة.":"لم يكتمل أحد القسمين بعد.";
  const completeDescription=role==="hse_admin"?"أُرسل قسم السلامة ويمكن طباعة تقريره، حتى إن ظل القسم الطبي قيد العمل.":role==="medical_admin"?"أُرسل القسم الطبي ويمكن طباعة تقريره، حتى إن ظل قسم السلامة قيد العمل.":"أُرسل قسم السلامة واعتمد الطبيب رأيه الطبي.";
  const card=x=>'<article class="assessment-card mofasa-compact-card"><div class="assessment-card-head"><div><h5>'+esc(x.worker_name)+'</h5><p>'+esc(x.job_title)+' · '+esc(x.task_name)+'</p></div><span class="record-date">'+esc(x.assessment_date)+'</span></div><div class="record-meta"><span>الرقم: <strong>'+esc(x.registration_number)+'</strong></span><span>الموقع: <strong>'+esc(x.site)+'</strong></span></div><div class="record-status"><span>HSE: <strong>'+statusLabel(x.hse_status)+'</strong></span><span>الطب: <strong>'+statusLabel(x.medical_status)+'</strong></span></div><div class="mofasa-card-actions"><button type="button" data-open-mofasa="'+esc(x.id)+'">فتح الملف</button>'+(isAdmin()?'<button type="button" class="secondary" data-archive-mofasa="'+esc(x.id)+'">أرشفة</button>':'')+'</div></article>';
  $("mofasa-list").innerHTML='<div class="mofasa-active-split"><section class="mofasa-active-group"><header><h4>'+incompleteTitle+' <span>'+incomplete.length+'</span></h4><p>'+incompleteDescription+'</p></header><div class="mofasa-compact-list">'+(incomplete.length?incomplete.map(card).join(""):'<div class="empty-state">لا توجد ملفات بانتظار استكمال قسمك.</div>')+'</div></section><section class="mofasa-active-group"><header><h4>'+completeTitle+' <span>'+complete.length+'</span></h4><p>'+completeDescription+'</p></header><div class="mofasa-compact-list">'+(complete.length?complete.map(card).join(""):'<div class="empty-state">لا توجد ملفات مكتملة في قسمك.</div>')+'</div></section></div>';
  $("mofasa-list").querySelectorAll("[data-open-mofasa]").forEach(b=>b.onclick=()=>openAssessment(b.dataset.openMofasa));
  $("mofasa-list").querySelectorAll("[data-archive-mofasa]").forEach(b=>b.onclick=()=>archiveAssessment(b.dataset.archiveMofasa));
 }
 async function loadArchiveList(){
  if(!isAdmin())return;
  const {data,error}=await client.from("mofasa_assessments").select("id,worker_name,registration_number,job_title,task_name,assessment_date,site,hse_status,medical_status,archived_at,archive_reason").not("archived_at","is",null).order("archived_at",{ascending:false}).limit(500);
  if(error){$("mofasa-list").textContent="تعذر تحميل الأرشيف: "+error.message;return;}
  rows=data||[];
  $("mofasa-list").innerHTML=rows.length?'<div class="assessment-cards">'+rows.map(x=>'<article class="assessment-card archived-card"><div class="assessment-card-head"><div><h5>'+esc(x.worker_name)+'</h5><p>'+esc(x.job_title)+' · '+esc(x.task_name)+'</p></div><span class="record-date">أُرشف: '+esc(new Date(x.archived_at).toLocaleDateString("ar-EG"))+'</span></div><div class="record-meta"><span>الرقم الوظيفي: <strong>'+esc(x.registration_number)+'</strong></span><span>الموقع: <strong>'+esc(x.site)+'</strong></span></div><p class="specialist-help">سبب الأرشفة: '+esc(x.archive_reason||"لم يحدد")+'</p><div class="mofasa-card-actions"><button type="button" data-open-mofasa="'+esc(x.id)+'">عرض الملف المحفوظ</button><button type="button" class="secondary" data-restore-mofasa="'+esc(x.id)+'">استعادة للسجل النشط</button></div></article>').join("")+'</div>':'<div class="empty-state">الأرشيف فارغ حالياً.</div>';
  $("mofasa-list").querySelectorAll("[data-open-mofasa]").forEach(b=>b.onclick=()=>openAssessment(b.dataset.openMofasa));
  $("mofasa-list").querySelectorAll("[data-restore-mofasa]").forEach(b=>b.onclick=()=>restoreAssessment(b.dataset.restoreMofasa));
 }
 async function deleteAssessment(id){
  if(!isAdmin()||!confirm("تحذير: سيتم حذف ملف التقييم بالكامل نهائياً، بما في ذلك بيانات السلامة والبيانات الطبية وسجل التدقيق. لا يمكن التراجع عن هذا الإجراء. هل تريد المتابعة؟"))return;
  const {error}=await client.rpc("mofasa_delete_assessment",{p_assessment_id:id});
  if(error){msg("تعذر حذف الملف بالكامل: "+error.message,"error");return;}
  if(selected===id){selected=null;parent=null;hseRow=null;medicalRow=null;$("mofasa-selected").hidden=true;}
  msg("تم حذف ملف التقييم وجميع أقسامه وسجل تدقيقه نهائياً.","success");
  showingArchive?await loadArchiveList():await loadList();
 }
 async function archiveAssessment(id){
  if(!isAdmin()||!confirm("سيتم إخفاء السجل من القائمة النشطة مع الاحتفاظ بكامل بياناته وإمكانية استعادته. هل تريد المتابعة؟"))return;
  const reason=prompt("سبب الأرشفة (اختياري):")||null;
  const {error}=await client.rpc("mofasa_set_archive",{p_assessment_id:id,p_archive:true,p_reason:reason});
  if(error){msg("تعذرت أرشفة السجل: "+error.message,"error");return;}
  if(selected===id)$("mofasa-selected").hidden=true;
  msg("تمت أرشفة السجل مع الاحتفاظ بكامل بياناته.","success");await loadList();
 }
 async function restoreAssessment(id){
  if(!isAdmin()||!confirm("سيعاد إظهار السجل في القائمة النشطة دون تغيير بيانات التقييم. هل تريد المتابعة؟"))return;
  const {error}=await client.rpc("mofasa_set_archive",{p_assessment_id:id,p_archive:false,p_reason:"استعادة إلى السجل النشط"});
  if(error){msg("تعذرت استعادة السجل: "+error.message,"error");return;}
  msg("تمت استعادة السجل إلى القائمة النشطة.","success");await loadArchiveList();
 }
 async function createAssessment(e){
  e.preventDefault();const row={worker_name:$("mf-name").value.trim(),registration_number:$("mf-reg").value.trim(),job_title:$("mf-job").value.trim(),task_name:$("mf-task").value.trim(),assessment_date:$("mf-date").value,site:$("mf-site").value,shift_duration:$("mf-duration").value.trim()||null,created_by:user.id};
  if(Object.values(row).slice(0,6).some(v=>!v)){msg("أكمل جميع بيانات العامل والمهمة والموقع والتاريخ.","error");return;}
  const {data,error}=await client.from("mofasa_assessments").insert(row).select("id").single();
  if(error){msg("تعذر إنشاء الملف: "+error.message,"error");return;}
  $("mofasa-create-form").reset();$("mf-date").value=new Date().toISOString().slice(0,10);await loadList();await openAssessment(data.id);msg("تم إنشاء ملف التقييم المشترك. أكمل الآن قسم السلامة.","success");
 }

 const reviewLabels={tasks:"المهام الأساسية",items:"العناصر المسجلة",safety_critical:"الواجبات الحساسة للسلامة",job_task:"متطلبات الوظيفة والمهام",medical_fit:"التوافق الطبي الأولي",physical:"المجهود البدني",cognitive:"المتطلبات الذهنية",height:"العمل على ارتفاعات",confined_space:"العمل في الأماكن المغلقة",isolated_work:"العمل المنفرد",driving:"القيادة وتشغيل المعدات",worker_profile:"بيانات العامل",date_of_birth:"تاريخ الميلاد",age_years:"العمر عند التقييم",tra:"تقييم مخاطر المهمة TRA",inherent:"الخطر قبل التحكم",controls:"فعالية وسائل التحكم",residual:"الخطر المتبقي",permit:"تصريح العمل",notes:"ملاحظات",hazards:"الأخطار المهنية",category:"فئة الخطر",category_label:"فئة الخطر",disease:"الحالة الطبية",name:"الخطر",severity:"شدة التعرض",severity_label:"وصف الشدة",severity_description:"تفاصيل الشدة",frequency:"معدل التعرض",controls:"إجراءات التحكم",residual:"الخطر المتبقي",demands:"متطلبات الوظيفة",selected:"المتطلبات المحددة",other:"متطلبات أخرى",emergency:"جاهزية الموقع والطوارئ",site_category:"فئة الموقع",care_access:"الوصول للرعاية الطبية",evacuation:"الإسعاف والإخلاء",communications:"الاتصالات والطوارئ",medical_support:"الدعم الطبي",referral_facility:"الجهة الطبية المرجعية",evacuation_time:"زمن الإخلاء",transport:"وسيلة النقل",last_drill_date:"تاريخ آخر تمرين",ftw:"نموذج اللياقة للعمل",supervisor_observations:"ملاحظات المشرف",risk_category:"فئة المخاطر الصحية",safety_critical:"وظيفة حساسة للسلامة",safety_critical_specify:"تفاصيل الوظيفة الحساسة",emergency_duties:"مهام الاستجابة للطوارئ",emergency_specify:"تفاصيل مهام الطوارئ",exam:"الفحص السريري",basic:"الفحص الأساسي",labs_basic:"التحاليل الأساسية",additional:"الفحوصات الإضافية",general:"المظهر العام",blood_pressure:"ضغط الدم",cardiovascular:"الجهاز القلبي الوعائي",respiratory:"الجهاز التنفسي",musculoskeletal:"الجهاز العضلي الهيكلي",neurological:"الجهاز العصبي",vision:"الإبصار",hearing:"السمع",balance:"الاتزان والتناسق الحركي",cbc:"صورة الدم الكاملة CBC",ast:"AST",alt:"ALT",creatinine:"الكرياتينين",lipid:"دهون الدم",fbs:"سكر صائم",hba1c:"السكر التراكمي HbA1c",chest_xray:"أشعة الصدر",ultrasound:"الموجات فوق الصوتية",ecg:"رسم القلب ECG",spirometry:"اختبار وظائف التنفس",audiometry:"قياس السمع",capacity:"القدرة الوظيفية",restrictions:"القيود والمتابعة الطبية",status:"حالة القسم",diseases:"التاريخ المرضي والحالات الطبية",conditions:"الحالات الطبية",labs:"التحاليل والفحوصات",test:"اسم الفحص",result:"النتيجة",unit:"الوحدة",date:"التاريخ",impact:"الأثر الوظيفي",level:"مستوى الحالة",description:"الوصف",item:"المتطلب الوظيفي",evidence:"الدليل أو الملاحظات",vitals:"العلامات الحيوية",worker_age:"عمر العامل",bp:"ضغط الدم",hr:"معدل النبض",department:"الإدارة",assessment_type:"نوع التقييم",review_date:"تاريخ المراجعة",medical_history:"نتائج التاريخ المرضي",current_diseases:"الأمراض الحالية",occupational_history:"التاريخ المهني",medications:"الأدوية",weight:"الوزن",height:"الطول",bmi:"مؤشر كتلة الجسم",heart_rate:"معدل النبض",spo2:"تشبع الأكسجين",glucose:"الجلوكوز",recommendations:"التوصيات",physician_name:"اسم الطبيب",physician_pr:"الرقم الوظيفي للطبيب"};
 const reviewValue=v=>({rare:"نادر",occasional:"ظرفي",repeated:"متكرر",continuous:"مستمر",low:"منخفض",moderate:"متوسط",high:"مرتفع",very_high:"مرتفع جداً",critical:"حرج",normal:"طبيعي",abnormal:"غير طبيعي",review:"يحتاج مراجعة",pending:"قيد الانتظار",met:"مستوفى",restricted:"مستوفى بقيود",not_met:"غير مستوفى",not_assessed:"لم يقيّم",yes:"نعم",no:"لا",effective:"فعالة ومتحقق منها",partial:"فعالة جزئياً",weak:"ضعيفة / غير مكتملة",unknown:"غير متحقق منها",historical:"تاريخ مرضي",stable:"مستقرة",controlled:"مسيطر عليها",under_treatment:"تحت العلاج",uncontrolled:"غير مسيطر عليها",ready:"جاهز",good:"متاح سريعاً",reliable:"موثوقة",adequate:"كافٍ",limited:"محدود",inadequate:"غير كافٍ",remote:"نائي / معزول",onshore:"بري",offshore:"بحري",near_services:"قريب من الخدمات",compatible:"متوافق",incompatible:"غير متوافق",fit:"مستوفٍ لمتطلبات الوظيفة",fit_with_restrictions:"مستوفٍ بشروط وقيود",temporarily_unfit:"غير مستوفٍ مؤقتاً",unfit:"غير مستوفٍ لمتطلبات الوظيفة",specialist_review:"يحتاج مراجعة طبية متخصصة"}[v]||String(v));
 function hasReviewValue(v){if(v===null||v===undefined||v==="")return false;if(typeof v==="string"&&v.trim()==="")return false;if(Array.isArray(v))return v.some(hasReviewValue);if(typeof v==="object")return Object.entries(v).some(([k,x])=>k!=="_meta"&&hasReviewValue(x));return true;}
 function hasCompletedReviewValue(v){
  if(v===null||v===undefined)return false;
  if(typeof v==="string"){const s=v.trim(),lower=s.toLowerCase();return !!s&&lower!=="none"&&s!=="—"&&s!=="-"&&lower!=="not_assessed"&&lower!=="not assessed"&&s!=="لم يقيّم"&&!lower.startsWith("matrix_level_");}
  if(typeof v==="number")return Number.isFinite(v);
  if(typeof v==="boolean")return true;
  if(Array.isArray(v))return v.some(hasCompletedReviewValue);
  if(typeof v==="object")return Object.entries(v).some(([k,x])=>k!=="_meta"&&k!=="status"&&hasCompletedReviewValue(x));
  return false;
 }
 function reviewCount(value){
  if(Array.isArray(value))return value.filter(hasCompletedReviewValue).length;
  if(value&&typeof value==="object")return Object.entries(value).filter(([k,v])=>k!=="_meta"&&hasCompletedReviewValue(v)).length;
  return hasCompletedReviewValue(value)?1:0;
 }
 function reviewDisplayValue(key,value){
  if(key==="item"&&typeof value==="string"&&value.includes("/")){
   const parts=value.split("/");
   const arabic=parts.slice(1).join("/").trim();
   if(/[\u0600-\u06FF]/.test(arabic))return arabic;
  }
  return value;
 }
 function shouldHideReportField(key,path,options){
  if(!options.report)return false;
  if(options.section==="hse"&&((path.includes("worker_profile")&&["age_years","date_of_birth"].includes(key))||key==="safety_officer_name"))return true;
  if(path.includes("diseases")&&["hazard","name","level","severity","severity_label","severity_description","risk_category","category","category_label","risk_level"].includes(key))return true;
  if(options.section==="medical"){
   if(["department","worker_age","physician_name","physician_pr","assessment_type"].includes(key))return true;
   if(path.includes("exam")&&path.includes("basic")&&["blood_pressure","bp"].includes(key))return true;
   if(path.includes("vitals")&&["glucose","hba1c"].includes(key))return true;
   if((path.includes("capacity")||path.includes("functional_capacity"))&&key==="item")return true;
  }
  return false;
 }
 function reviewRows(value,options={},path=[]){
  if(Array.isArray(value)){
   const items=value.filter(x=>hasCompletedReviewValue(x)&&!(x&&typeof x==="object"&&String(x.status||"").toLowerCase()==="not_assessed"));if(!items.length)return "";
   if(items.every(x=>typeof x!=="object"))return '<ul>'+items.map(x=>'<li>'+esc(reviewValue(x))+'</li>').join("")+'</ul>';
   return '<div class="completed-review-list">'+items.map(x=>{
    const title=x.disease||x.name||x.test||(x.item?reviewDisplayValue("item",x.item):"")||x.task||x.hazard||x.category_label||"تفاصيل مسجلة";
    const body=reviewRows(x,options,path);
    return body?'<details class="review-disclosure review-entry"'+(options.expanded?' open':'')+'><summary><strong>'+esc(title)+'</strong></summary><div class="review-disclosure-body">'+body+'</div></details>':"";
   }).join("")+'</div>';
  }
  if(value&&typeof value==="object")return Object.entries(value).filter(([k,v])=>k!=="_meta"&&!shouldHideReportField(k,path,options)&&hasCompletedReviewValue(v)).map(([k,v])=>'<div class="completed-review-row'+(options.report&&["items","ftw","capacity"].includes(k)?" report-no-label":"")+'"><strong>'+esc(reviewLabels[k]||k.replace(/_/g," "))+'</strong><div>'+reviewRows(reviewDisplayValue(k,v),options,path.concat(k))+'</div></div>').join("");
  if(typeof value==="boolean")return esc(value?"نعم":"لا");return esc(reviewValue(value));
 }
 function renderMedicalHistory(diseases,options={}){
  const items=Array.isArray(diseases?.items)?diseases.items:Array.isArray(diseases)?diseases:[];
  const cards=items.filter(x=>hasCompletedReviewValue(x)&&String(x.status||"").toLowerCase()!=="not_assessed").map(x=>{
   const disease=x.disease||x.name||x.condition||"حالة طبية مسجلة";
   const body=reviewRows(x,options,["diseases"]);
   return body?'<details class="review-disclosure review-entry"'+(options.expanded?' open':'')+'><summary><strong>'+esc(disease)+'</strong></summary><div class="review-disclosure-body">'+body+'</div></details>':"";
  }).filter(Boolean);
  const notes=String(diseases?.notes||"").trim();
  const reviewed=diseases?.reviewed===true;
  if(!cards.length&&!notes&&!reviewed)return "";
  const empty=reviewed&&!cards.length?'<p>تمت مراجعة التاريخ المرضي بواسطة الطبيب ولم تُسجل حالات طبية في هذه المراجعة.</p>':"";
  return '<details class="review-disclosure review-group"'+(options.expanded?' open':'')+'><summary><strong>التاريخ المرضي والحالات الطبية</strong>'+(options.report?"":'<span>'+cards.length+' حالة'+(reviewed?' — تمت المراجعة':'')+'</span>')+'</summary><div class="review-disclosure-body">'+cards.join("")+empty+(notes?'<div class="completed-review-row"><strong>ملاحظات الطبيب على التاريخ المرضي</strong><div>'+esc(notes)+'</div></div>':"")+'</div></details>';
 }
 function renderJemReview(h){
  const source=Array.isArray(h?.section_data?.hazards?.items)?h.section_data.hazards.items:[];
  const items=source.filter(x=>x&&typeof x==="object"&&["category","name","severity_label","severity_description","severity","frequency","frequency_scale","duration_scale","probability_scale","control_effectiveness","controls","residual"].some(k=>hasCompletedReviewValue(x[k])));
  if(!items.length)return "";
  const residualLabels={low:"منخفض",moderate:"متوسط",high:"مرتفع",critical:"حرج",not_assessed:"لم يقيّم"};
  const rows=items.map(x=>{
   const severity=(x.severity_label||(["","منخفض","متوسط","مرتفع","شديد / حرج","كارثي"][Number(x.severity)]||""))+(x.severity_description?" — "+x.severity_description:"");
    return "<tr><td>"+esc([x.category,x.name].filter(Boolean).join(" / "))+"</td><td>"+esc(severity)+"</td><td>"+esc(x.frequency?(exposureLabels[x.frequency]||reviewValue(x.frequency)):"")+"</td></tr>";
  }).join("");
  const notes=h.section_data.hazards?.notes;
  return '<section class="specialist-section jem-review"><h4>سجل الأخطار المهنية JEM</h4><div class="table-wrap"><table class="jem-table"><thead><tr><th>الفئة / الخطر</th><th>الشدة</th><th>التعرض</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+(notes?'<div class="completed-review-row"><strong>ملاحظات عامة على تقييم الأخطار</strong><div>'+esc(notes)+'</div></div>':"")+'</section>';
 }
 function renderSelectedDemands(demands){
  const selected=Array.isArray(demands?.selected)?demands.selected:[];
  const groups=Object.entries(demandGroups).map(([group,items])=>{
   const chosen=items.filter(item=>selected.includes(item));
   return chosen.length?'<div class="completed-review-row"><strong>'+esc(group)+'</strong><ul>'+chosen.map(item=>'<li>'+esc(item)+'</li>').join("")+'</ul></div>':"";
  }).join("");
  const other=String(demands?.other||"").trim();
  const notes=String(demands?.notes||"").trim();
  const extras=(other?'<div class="completed-review-row"><strong>متطلبات أخرى</strong><div>'+esc(other)+'</div></div>':"")+(notes?'<div class="completed-review-row"><strong>مستوى المجهود / طبيعة العمل</strong><div>'+esc(notes)+'</div></div>':"");
  if(!groups&&!extras)return "";
  return '<section class="specialist-section demand-review"><h4>متطلبات أداء الوظيفة</h4>'+groups+extras+'</section>';
 }
 function reportTableRows(value,rows=[],prefix=""){
  const titleKeys=["item","name","test","disease","condition","task","hazard","category_label"];
  if(Array.isArray(value)){
   value.forEach(item=>{
    if(item&&typeof item==="object"){
     const title=titleKeys.map(k=>item[k]).find(v=>typeof v==="string"&&v.trim())||"";
     const rest={};Object.entries(item).forEach(([k,v])=>{if(!titleKeys.includes(k)&&k!=="_meta"&&hasCompletedReviewValue(v))rest[k]=v;});
     const before=rows.length;reportTableRows(rest,rows,[prefix,title].filter(Boolean).join(" — "));
     if(rows.length===before&&title)rows.push([prefix||"العنصر",title]);
    }else if(hasCompletedReviewValue(item))rows.push([prefix||"العنصر",reviewValue(item)]);
   });
   return rows;
  }
  if(value&&typeof value==="object"){
   Object.entries(value).forEach(([key,item])=>{
    if(key==="_meta"||!hasCompletedReviewValue(item))return;
    const label=reviewLabels[key]||key.replace(/_/g," ");
    const next=[prefix,label].filter(Boolean).join(" — ");
    if(item&&typeof item==="object")reportTableRows(item,rows,next);
    else rows.push([next,typeof item==="boolean"?(item?"نعم":"لا"):reviewValue(item)]);
   });
   return rows;
  }
  if(hasCompletedReviewValue(value))rows.push([prefix||"القيمة",reviewValue(value)]);
  return rows;
 }
 function renderReportKeyValueTable(data,sectionClass=""){
  const rows=reportTableRows(data).filter(([label,value])=>{
   const text=String(label||"").trim(),content=String(value??"").trim();
   if(!text&&!content)return false;
   // Keep the super-admin's consolidated report focused: omit redundant template headings
   // and the generic default consciousness item, without changing stored assessment data.
   if(isAdmin()&&(
    text==="نموذج اللياقة للعمل"||
    text==="نموذج اللياقة للعمل — العلامات الحيوية"||
    text==="الفحص السريري — الفحص الأساس"||
    text.includes("Normal Consciousness")
   ))return false;
   return true;
  });
  return renderReportRowsTable(rows,sectionClass);
 }
 function renderReportRowsTable(rows,sectionClass=""){
  if(!rows.length)return "";
  return '<div class="report-kv-wrap '+sectionClass+'"><table class="report-kv-table"><tbody>'+rows.map(([label,value])=>'<tr><td>'+esc(label)+'</td><td>'+esc(value)+'</td></tr>').join("")+'</tbody></table></div>';
 }
 function renderMedicalReviewGroups(md,options={}){
  if(options.report){
   const rows=[];
   ["ftw","exam","vitals","labs","capacity","functional_capacity","restrictions","notes"].forEach(k=>{if(Object.prototype.hasOwnProperty.call(md||{},k)&&hasCompletedReviewValue(md[k]))reportTableRows(md[k],rows);});
   Object.entries(md||{}).forEach(([k,v])=>{if(!["ftw","exam","vitals","labs","capacity","functional_capacity","restrictions","notes","diseases","preliminary_analysis","_meta","iofi"].includes(k)&&hasCompletedReviewValue(v))reportTableRows(v,rows);});
   const movedFields=["worker_age","department","assessment_type","physician_name","physician_pr","medical_history"];
   const movedLabels=movedFields.flatMap(k=>[reviewLabels[k]||k.replace(/_/g," "),k,k.replace(/_/g," ")]);
   const filteredRows=rows.filter(([label])=>!movedLabels.some(k=>String(label).toLowerCase().endsWith(k.toLowerCase())));
   return renderReportRowsTable(filteredRows,"report-medical-flat-table");
  }

  const groups=[
   {title:"الفحص السريري والعلامات الحيوية",keys:["ftw","exam","vitals"]},
   {title:"التحاليل والفحوصات",keys:["labs"]},
   {title:"القدرة الوظيفية والمتطلبات الأساسية",keys:["capacity","functional_capacity"]},
   {title:"القيود الطبية وخطة المتابعة",keys:["restrictions","notes"]}
  ];
  const used=new Set(["diseases","preliminary_analysis"]);
  const blocks=groups.map(group=>{
   const data={};group.keys.forEach(k=>{if(Object.prototype.hasOwnProperty.call(md,k)){data[k]=md[k];used.add(k);}});
   if(!hasCompletedReviewValue(data))return "";
   const count=reviewCount(data),body=options.report&&group.keys.some(k=>["ftw","exam","vitals","capacity","functional_capacity"].includes(k))?renderReportKeyValueTable(data,group.keys.includes("capacity")||group.keys.includes("functional_capacity")?"report-fit-table":"report-clinical-table"):reviewRows(data,{...options,section:"medical"});
   const clinicalColumns=options.report&&group.keys.some(k=>["ftw","exam","vitals"].includes(k));
   const fitEssentials=options.report&&group.keys.some(k=>["capacity","functional_capacity"].includes(k));
   return body?'<details class="review-disclosure review-entry medical-review-subgroup'+(clinicalColumns?' report-clinical-three-columns':'')+(fitEssentials?' report-fit-essentials':'')+(options.report&&group.keys.includes("capacity")?' report-no-heading report-page-three':'')+'"'+(options.expanded?' open':'')+'><summary><strong>'+group.title+'</strong>'+(options.report?"":'<span>'+count+' عناصر</span>')+'</summary><div class="review-disclosure-body">'+body+'</div></details>':"";
  }).join("");
  const other={};Object.entries(md||{}).forEach(([k,v])=>{if(!used.has(k)&&k!=="_meta"&&k!=="iofi"&&hasCompletedReviewValue(v))other[k]=v;});
  const otherBody=reviewRows(other,{...options,section:"medical"});
  const extras=otherBody?'<details class="review-disclosure review-entry medical-review-subgroup"'+(options.expanded?' open':'')+'><summary><strong>بيانات طبية إضافية</strong>'+(options.report?"":'<span>'+reviewCount(other)+' عناصر</span>')+'</summary><div class="review-disclosure-body">'+otherBody+'</div></details>':"";
  return blocks+extras;
 }
 function renderCompletedReview(h,m,options={}){
  const sections=[],hd=h?.section_data||{},md=m?.section_data||{};
  if(canHseRead()&&hasCompletedReviewValue(hd)){
   const hseDisplay={tasks:hd.tasks,tra:hd.tra,job_task:hd.job_task,emergency:hd.emergency,ftw:hd.ftw,notes:hd.notes};
   const count=reviewCount(hseDisplay);
   if(hasCompletedReviewValue(hseDisplay))sections.push('<details class="review-disclosure review-section"'+(options.expanded?' open':'')+'><summary><strong>قسم السلامة المهنية (HSE)</strong>'+(options.report?"":'<span>'+count+' عناصر</span>')+'</summary><div class="review-disclosure-body">'+reviewRows(hseDisplay,{...options,section:"hse"})+'</div></details>');
   const demandsReview=renderSelectedDemands(hd.demands);
   if(demandsReview)sections.push(demandsReview);
  }
  if(canMedicalRead()&&(hasCompletedReviewValue(md)||m?.final_decision)){
   const score=md.preliminary_analysis||{},scoreReview=options.includeScore===false?"":(score.total!==null&&score.total!==undefined?'<div class="completed-review-row"><strong>المؤشر الرقمي التجريبي</strong><div>'+esc(score.total+' / 100 — '+(score.band||""))+'<br>'+esc(score.formula||"")+'<br>مؤشر استرشادي غير معاير ولا يحل محل الحكم الطبي.</div></div>':"");
   const medicalContent=(options.report?"":renderMedicalHistory(md.diseases,options))+renderMedicalReviewGroups(md,options)+scoreReview+(m?.final_decision?'<div class="completed-review-row"><strong>الرأي الطبي النهائي</strong><div>'+esc(reviewValue(m.final_decision))+'</div></div>':"");
   if(medicalContent){
    const count=reviewCount(md)+reviewCount(md.diseases)+(m?.final_decision?1:0);
    sections.push('<details class="review-disclosure review-section medical-review-section report-page-two report-no-heading"'+(options.expanded?' open':'')+'><summary><strong>القسم الطبي</strong>'+(options.report?"":'<span>'+count+' عناصر</span>')+'</summary><div class="review-disclosure-body">'+medicalContent+'</div></details>');
   }
  }
  const jemReview=renderJemReview(h);
  if(jemReview)sections.unshift(jemReview);
  return sections.length?'<section class="specialist-section completed-review">'+(options.report?"":'<h4>استعراض النقاط المستكملة فقط</h4><p class="specialist-help">'+(options.expanded?"يعرض التقرير جميع المدخلات المكتملة المسجلة من مسؤول السلامة وطبيب الموقع، دون إظهار الحقول غير المستكملة.":"تظهر هنا البيانات التي تم إدخالها أو تقييمها فقط. افتح كل قائمة لعرض تفاصيلها؛ وتظل صلاحيات الاطلاع الخاصة بكل دور كما هي.")+'</p>')+'<div class="medical-review-grid">'+sections.join("")+'</div></section>':"";
 }
 async function openAssessment(id){
  const {data:p,error}=await client.from("mofasa_assessments").select("*").eq("id",id).single();
  if(error){msg("تعذر فتح الملف: "+error.message,"error");return;}
  selected=id;parent=p;hseRow=null;medicalRow=null;
  if(canHseRead()||canMedicalRead()){const q=await client.from("mofasa_hse_sections").select("*").eq("assessment_id",id).maybeSingle();if(!q.error)hseRow=q.data;}
  if(canMedicalRead()){const q=await client.from("mofasa_medical_sections").select("*").eq("assessment_id",id).maybeSingle();if(!q.error)medicalRow=q.data;}
  $("mofasa-selected").hidden=false;
  $("mofasa-record-header").innerHTML='<div class="record-hero"><div><span class="eyebrow">ملف تقييم MOFASA</span><h3>'+esc(p.worker_name)+'</h3><p>'+esc(p.job_title)+' · '+esc(p.task_name)+'</p></div><div class="record-hero-id">'+esc(p.registration_number)+'</div></div><div class="summary-grid"><div class="summary-item"><span>الموقع</span><strong>'+esc(p.site)+'</strong></div><div class="summary-item"><span>تاريخ التقييم</span><strong>'+esc(p.assessment_date)+'</strong></div><div class="summary-item"><span>قسم السلامة</span><strong>'+statusLabel(p.hse_status)+'</strong></div><div class="summary-item"><span>القسم الطبي</span><strong>'+statusLabel(p.medical_status)+'</strong></div></div><div class="mofasa-toolbar">'+(isAdmin()?'<button type="button" id="mofasa-print-ftw">'+(window.MOFASA_I18N?.getLanguage?.()==="en"?"Export Individual Report (PDF)":"استخراج التقرير الفردي PDF")+'</button><button type="button" class="secondary" id="mofasa-word-ftw">'+(window.MOFASA_I18N?.getLanguage?.()==="en"?"Export Individual Report (Word)":"استخراج التقرير الفردي Word")+'</button>':role==="hse_admin"&&hseRow?.status==="submitted"?'<button type="button" id="mofasa-print-hse-section">طباعة تقرير السلامة PDF</button><button type="button" class="secondary" id="mofasa-word-hse-section">استخراج تقرير السلامة Word</button>':role==="medical_admin"&&medicalRow?.status==="submitted"?'<button type="button" id="mofasa-print-med-section">طباعة التقرير الطبي PDF</button><button type="button" class="secondary" id="mofasa-word-med-section">استخراج التقرير الطبي Word</button>':'')+(isAdmin()?'<button type="button" id="mofasa-export-one">تصدير ملف العامل التفصيلي (Excel)</button>': '')+(isAdmin()&&hseRow?.status==="submitted"?'<button type="button" class="secondary" id="mofasa-return-hse">إعادة إلى مسؤول السلامة للاستكمال</button>':'')+(isAdmin()&&medicalRow?.status==="submitted"?'<button type="button" class="secondary" id="mofasa-return-medical">إعادة إلى الطبيب للاستكمال</button>':'')+(isAdmin()&&p.archived_at?'<button type="button" class="secondary" id="mofasa-restore-current">استعادة السجل</button>':isAdmin()?'<button type="button" class="secondary" id="mofasa-archive-current">أرشفة السجل</button>':'')+(isAdmin()?'<button type="button" class="danger" id="mofasa-delete-current">حذف الملف بالكامل</button>':'')+'</div>';
  $("mofasa-record-header").insertAdjacentHTML("beforeend",renderCompletedReview(hseRow,medicalRow));
  if(canHse()){const d=hseRow?.section_data||{};renderHseEditors(d);const locked=hseRow?.status==="submitted"||!!p.archived_at;["mofasa-hse-draft","mofasa-hse-submit"].forEach(id=>$(id).disabled=locked);const hseReturn=hseRow?.section_data?._meta?.admin_return_reason;$("mofasa-hse-lock").textContent=p.archived_at?"هذا السجل مؤرشف؛ العرض فقط دون تعديل.":locked?"اعتمد مسؤول السلامة اكتمال قسمه وأرسله. لا يتطلب ذلك مراجعة الطبيب؛ ويظل القسم الطبي مستقلاً.":hseReturn?"أُعيد القسم من المدير الأعلى للاستكمال: "+hseReturn:"يمكنك حفظ مسودة أو إرسال القسم بعد استكماله."; if(locked)document.querySelectorAll("#mofasa-hse-form input,#mofasa-hse-form select,#mofasa-hse-form textarea").forEach(x=>x.disabled=true);}
    
  if(canMedical()){const d=medicalRow?.section_data||{};renderFtwMedical(d.ftw||{});renderClinicalExam(d.exam,parent||{},hseRow?.section_data||{});$("mm-restrictions").value=typeof d.restrictions==="string"?d.restrictions:(d.restrictions?.notes||"");$("mm-notes").value=d.notes||"";renderMedicalRegisters(d,parent||{},hseRow?.section_data||{});$("mm-fit-compatibility").value=d.medical_fit||"";$("mm-decision").value=medicalRow?.final_decision||"";$("mm-calculate-score").onclick=renderPreliminaryScore;renderPreliminaryScore();const locked=medicalRow?.status==="submitted";["mm-exam","mm-restrictions","mm-notes","mm-decision","mofasa-med-draft","mofasa-med-submit"].forEach(id=>{const el=$(id);if(el)el.disabled=locked;});if(locked)document.querySelectorAll("#mofasa-med-form input,#mofasa-med-form select,#mofasa-med-form textarea").forEach(x=>x.disabled=true);const medicalReturn=medicalRow?.section_data?._meta?.admin_return_reason;$("mofasa-med-lock").textContent=locked?"تم إرسال واعتماد القسم الطبي وأصبح مقفلاً.":isAdmin()?"يمكنك استكمال البيانات الطبية وحفظ مسودة؛ الاعتماد النهائي للطبيب حصراً.":medicalReturn?"أُعيد القسم من المدير الأعلى للاستكمال: "+medicalReturn:p.hse_status!=="submitted"?"يمكنك استكمال وإرسال القسم الطبي بصورة مستقلة؛ يظل ملف العامل غير مكتمل حتى إرسال القسمين.":"قسم السلامة مكتمل؛ يمكنك استكمال المراجعة الطبية واعتماد الرأي.";}

  if(canHse()){$("mofasa-hse-draft").onclick=()=>saveSection("hse","draft");$("mofasa-hse-submit").onclick=()=>saveSection("hse","submitted");}
  if(canMedical()){const md=$("mofasa-med-draft"),ms=$("mofasa-med-submit");if(md)md.onclick=()=>saveSection("medical","draft");if(ms&&!isAdmin())ms.onclick=()=>saveSection("medical","submitted");}
  const fp=$("mofasa-print-ftw"),fw=$("mofasa-word-ftw");if(fp)fp.onclick=()=>printFtwReport(id);if(fw)fw.onclick=()=>exportFtwWord(id);const hp=$("mofasa-print-hse-section"),hw=$("mofasa-word-hse-section"),mp=$("mofasa-print-med-section"),mw=$("mofasa-word-med-section");if(hp)hp.onclick=()=>printRoleSectionReport("hse",id);if(hw)hw.onclick=()=>exportRoleSectionWord("hse",id);if(mp)mp.onclick=()=>printRoleSectionReport("medical",id);if(mw)mw.onclick=()=>exportRoleSectionWord("medical",id);if(isAdmin()){loadAudit(id);const ex=$("mofasa-export-one"),ar=$("mofasa-archive-current"),rs=$("mofasa-restore-current"),del=$("mofasa-delete-current");if(ex)ex.onclick=()=>exportOneAssessment(id);if(ar)ar.onclick=()=>archiveAssessment(id);if(rs)rs.onclick=()=>restoreAssessment(id);if(del)del.onclick=()=>deleteAssessment(id);}
  if(isAdmin()){const rh=$("mofasa-return-hse"),rm=$("mofasa-return-medical");if(rh)rh.onclick=()=>returnSectionToRole("hse");if(rm)rm.onclick=()=>returnSectionToRole("medical");}
  $("mofasa-selected").scrollIntoView({behavior:"smooth",block:"start"});
 }
 async function returnSectionToRole(section){
  if(!isAdmin()||parent?.archived_at)return;
  const isH=section==="hse",row=isH?hseRow:medicalRow;
  if(!row||row.status!=="submitted"){msg("لا يمكن إعادة هذا القسم؛ فهو غير مرسل حالياً.","error");return;}
  const target=isH?"مسؤول السلامة":"طبيب الموقع";
  const reason=prompt("اكتب سبب إعادة الملف إلى "+target+" لاستكماله:");
  if(reason===null)return;
  const {error}=await client.rpc("mofasa_return_section",{
    p_assessment_id:selected,
    p_section:section,
    p_reason:reason.trim()
  });
  if(error){msg("تعذرت إعادة القسم للاستكمال: "+error.message,"error");return;}
  msg(isH?"تمت إعادة قسم السلامة، وأُعيدت المراجعة الطبية للطبيب عند الحاجة.":"تمت إعادة القسم الطبي إلى طبيب الموقع للاستكمال.","success");
  await loadList();await openAssessment(selected);
 }
 async function saveSection(section,status){
  if(parent?.archived_at){msg("هذا السجل مؤرشف ولا يمكن تعديله قبل استعادته بواسطة المدير الأعلى.","error");return;}
  if(section==="hse"&&role!=="hse_admin"){msg("تعديل قسم السلامة متاح لمسؤول السلامة فقط.","error");return;}
  if(section==="medical"&&role!=="medical_admin"){msg("تعديل القسم الطبي متاح لطبيب الموقع فقط.","error");return;}
  
  const isH=section==="hse", table=isH?"mofasa_hse_sections":"mofasa_medical_sections", old=isH?hseRow:medicalRow;
  let section_data,final_decision=null;
  if(isH){section_data=collectHseData();section_data._meta={...(old?.section_data?._meta||{}),last_edited_by_email:user?.email||"",last_edited_by:user?.id||null,last_edited_at:new Date().toISOString()};if(section_data.emergency){delete section_data.emergency.shift_pattern;delete section_data.emergency.isolation;delete section_data.emergency.task_criticality;delete section_data.emergency.environmental_conditions;}const t=section_data.tasks.items.length,h=section_data.hazards.items.length,e=section_data.emergency;if(status==="submitted"&&(!t||!h||!e.site_category||!e.care_access||!e.evacuation||!e.communications||!e.medical_support||!section_data.job_task?.physical||!section_data.job_task?.cognitive||!section_data.tra?.inherent||!section_data.tra?.controls||!section_data.tra?.residual||section_data.hazards.items.some(x=>!x.severity||!x.frequency))){msg("لا يمكن إرسال قسم السلامة قبل استكمال متطلبات الوظيفة، وخطر واحد على الأقل بشدته ومعدل تعرضه، ومحور TRA، وجاهزية الموقع والطوارئ.","error");return;}}
  else{section_data=collectMedicalData();section_data._meta={...(old?.section_data?._meta||{}),last_edited_by_email:user?.email||"",last_edited_by:user?.id||null,last_edited_at:new Date().toISOString()};delete section_data.iofi;delete section_data._meta.iofi_snapshot;delete section_data._meta.iofi_snapshot_at;final_decision=$("mm-decision").value||null;section_data.preliminary_analysis=window.MOFASA_POFriBridge?.calculate(hseRow?.section_data||{},section_data,final_decision)||{total:null,status:"engine_unavailable"};section_data.preliminary_analysis.generated_at=new Date().toISOString();if(status==="submitted"&&!final_decision){msg("اختر الرأي الطبي النهائي قبل الإرسال والاعتماد.","error");return;}if(status==="submitted"&&(!clinicalExamHasData(section_data.exam)||!section_data.capacity.items.length||!section_data.medical_fit)){msg("أكمل الفحص السريري وFitness Essentials وحدد التوافق الطبي الأولي قبل الاعتماد.","error");return;}if(status==="submitted"&&section_data.capacity.items.some(x=>x.status==="not_assessed")){msg("لا يمكن الاعتماد مع وجود عنصر Fitness Essentials لم يتم تقييمه.","error");return;}}
  const payload={assessment_id:selected,section_data,status,updated_by:user.id,...(!old?{created_by:user.id}:{})};
  if(!isH)payload.final_decision=final_decision;
  const query=old?client.from(table).update(payload).eq("id",old.id):client.from(table).insert(payload);
  const {error}=await query;
  if(error){msg("تعذر حفظ القسم. تحقق من الصلاحية وحالة القسم: "+error.message,"error");return;}
  msg(status==="submitted"?(isH?"تم اعتماد اكتمال قسم السلامة وإرساله بنجاح. يمكن للطبيب استكمال القسم الطبي بصورة مستقلة.":"تم إرسال واعتماد الرأي الطبي."):(isH?"تم حفظ قسم السلامة كمسودة؛ يمكنك العودة لاستكماله.":"تم حفظ المسودة بنجاح."),"success");
  await loadList();await openAssessment(selected);
 }
 const flatten=(obj,prefix="")=>{let out=[];if(obj&&typeof obj==="object"&&!Array.isArray(obj)){for(const [k,v] of Object.entries(obj)){const key=prefix?prefix+"."+k:k;if(v&&typeof v==="object")out=out.concat(flatten(v,key));else out.push([key,v==null?"":String(v)]);}}else out.push([prefix||"value",String(obj??"")]);return out;};
 function addSheet(wb,name,rows){XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows.length?rows:[["لا توجد بيانات"]]),name.slice(0,31));}
 function saveBook(wb,name){XLSX.writeFile(wb,name+"-"+new Date().toISOString().slice(0,10)+".xlsx");}
 async function exportOneAssessment(id){
  if(!isAdmin())return;
  const {data:p,error}=await client.from("mofasa_assessments").select("*").eq("id",id).single();
  if(error){msg("تعذر تجهيز التقرير: "+error.message,"error");return;}
  const [h,m,a,ar]=await Promise.all([
   client.from("mofasa_hse_sections").select("*").eq("assessment_id",id).maybeSingle(),
   client.from("mofasa_medical_sections").select("*").eq("assessment_id",id).maybeSingle(),
   client.from("mofasa_audit_log").select("*").eq("assessment_id",id).order("changed_at"),
   client.from("mofasa_archive_log").select("*").eq("assessment_id",id).order("changed_at")
  ]);
  const failed=[h,m,a,ar].find(x=>x.error);if(failed){msg("تعذر تحميل كل تفاصيل التقرير: "+failed.error.message,"error");return;}
  const wb=XLSX.utils.book_new();
  addSheet(wb,"بيانات التقييم",[["الحقل","القيمة"],...flatten(p)]);
  addSheet(wb,"تفاصيل السلامة",[["المحور","التفاصيل"],...flatten(h.data?.section_data||{})]);
  addSheet(wb,"التفاصيل الطبية",[["المحور","التفاصيل"],...flatten(m.data?.section_data||{}),["الرأي الطبي النهائي",m.data?.final_decision||""],["حالة القسم",m.data?.status||""]]);
  addSheet(wb,"سجل التدقيق",[["القسم","العملية","المستخدم","التاريخ","الحالة السابقة","الحالة الجديدة"],...(a.data||[]).map(x=>[x.section_name,x.action,x.actor_id,x.changed_at,x.old_status,x.new_status])]);
  addSheet(wb,"سجل الأرشيف",[["العملية","المستخدم","التاريخ","السبب"],...(ar.data||[]).map(x=>[x.action,x.actor_id,x.changed_at,x.reason])]);
  saveBook(wb,"MOFASA-worker-"+(p.registration_number||id));
  msg("تم تجهيز ملف العامل التفصيلي، ويشمل بيانات التقييم والسلامة والطب وسجلات التدقيق والأرشفة.","success");
 }
 async function exportAllAssessments(){
  if(!isAdmin())return;
  msg("جارٍ تجهيز التقرير العام التفصيلي...");
  const {data:parents,error}=await client.from("mofasa_assessments").select("*").order("assessment_date",{ascending:false}).limit(5000);
  if(error){msg("تعذر تحميل السجلات: "+error.message,"error");return;}
  const ids=(parents||[]).map(x=>x.id);
  const [h,m,ar,au]=ids.length?await Promise.all([
   client.from("mofasa_hse_sections").select("*").in("assessment_id",ids),
   client.from("mofasa_medical_sections").select("*").in("assessment_id",ids),
   client.from("mofasa_archive_log").select("*").order("changed_at",{ascending:false}),
   client.from("mofasa_audit_log").select("*").in("assessment_id",ids).order("changed_at",{ascending:false})
  ]):[{data:[],error:null},{data:[],error:null},{data:[],error:null},{data:[],error:null}];
  const failed=[h,m,ar,au].find(x=>x.error);if(failed){msg("تعذر تحميل تفاصيل التقرير العام: "+failed.error.message,"error");return;}
  const hm=Object.fromEntries((h.data||[]).map(x=>[x.assessment_id,x])),mm=Object.fromEntries((m.data||[]).map(x=>[x.assessment_id,x]));
  const wb=XLSX.utils.book_new(),en=window.MOFASA_I18N?.getLanguage?.()==="en";
  addSheet(wb,en?"Assessment Summary":"ملخص التقييمات",[en?["Date","Worker Name","Registration Number","Job Title","Task","Site","Shift Duration","HSE Status","Medical Status","Medical Opinion","Archive Status","Archive Date"]:["التاريخ","اسم العامل","الرقم الوظيفي","الوظيفة","المهمة","الموقع","مدة الوردية","حالة السلامة","حالة الطب","الرأي الطبي","حالة الأرشفة","تاريخ الأرشفة"],...(parents||[]).map(p=>[p.assessment_date,p.worker_name,p.registration_number,p.job_title,p.task_name,p.site,p.shift_duration,p.hse_status,p.medical_status,mm[p.id]?.final_decision||"",p.archived_at?"مؤرشف":"نشط",p.archived_at||""])]);
  addSheet(wb,en?"HSE Details":"تفاصيل السلامة",[en?["Assessment ID","Worker","Registration Number","Section Status","Section Details (JSON)"]:["رقم التقييم","العامل","الرقم الوظيفي","حالة القسم","تفاصيل القسم (JSON)"],...(parents||[]).map(p=>[p.id,p.worker_name,p.registration_number,hm[p.id]?.status||"لم يبدأ",JSON.stringify(hm[p.id]?.section_data||{})])]);
  addSheet(wb,en?"Medical Details":"التفاصيل الطبية",[en?["Assessment ID","Worker","Registration Number","Section Status","Medical Opinion","Section Details (JSON)"]:["رقم التقييم","العامل","الرقم الوظيفي","حالة القسم","الرأي الطبي","تفاصيل القسم (JSON)"],...(parents||[]).map(p=>[p.id,p.worker_name,p.registration_number,mm[p.id]?.status||"لم يبدأ",mm[p.id]?.final_decision||"",JSON.stringify(mm[p.id]?.section_data||{})])]);
  addSheet(wb,en?"Archive Log":"سجل الأرشيف",[en?["Assessment ID","Action","User","Date","Reason"]:["رقم التقييم","العملية","المستخدم","التاريخ","السبب"],...(ar.data||[]).map(x=>[x.assessment_id,x.action,x.actor_id,x.changed_at,x.reason])]);
  addSheet(wb,en?"Audit Log":"سجل التدقيق",[en?["Assessment ID","Section","Action","User","Date","Previous Status","New Status"]:["رقم التقييم","القسم","العملية","المستخدم","التاريخ","الحالة السابقة","الحالة الجديدة"],...(au.data||[]).map(x=>[x.assessment_id,x.section_name,x.action,x.actor_id,x.changed_at,x.old_status,x.new_status])]);
  saveBook(wb,"MOFASA-comprehensive-register");
  msg(en?"The detailed report is ready and includes "+parents.length+" records, HSE and medical details and archive data.":"تم تجهيز التقرير العام التفصيلي ويشمل "+parents.length+" سجلاً، مع تفاصيل السلامة والطب وسجلات الأرشيف.","success");
 }
 async function loadAudit(id){
  const [audit,archive]=await Promise.all([
   client.from("mofasa_audit_log").select("section_name,action,actor_id,changed_at,old_status,new_status").eq("assessment_id",id).order("changed_at",{ascending:false}),
   client.from("mofasa_archive_log").select("action,actor_id,changed_at,reason").eq("assessment_id",id).order("changed_at",{ascending:false})
  ]);
  if(audit.error||archive.error){$("mofasa-audit").textContent="تعذر تحميل سجل التدقيق أو الأرشفة: "+(audit.error||archive.error).message;return;}
  const rowsAudit=(audit.data||[]).map(x=>'<tr><td>'+(x.section_name==="hse"?"السلامة":"الطب")+'</td><td>'+esc(x.action)+'</td><td>'+esc(x.actor_id)+'</td><td>'+esc(new Date(x.changed_at).toLocaleString("ar-EG"))+'</td><td>'+statusLabel(x.new_status)+'</td><td>'+esc(x.reason||"—")+'</td></tr>');
  const rowsArchive=(archive.data||[]).map(x=>'<tr><td>الأرشفة</td><td>'+esc(x.action==="archive"?"أرشفة":"استعادة")+'</td><td>'+esc(x.actor_id)+'</td><td>'+esc(new Date(x.changed_at).toLocaleString("ar-EG"))+'</td><td>—</td><td>'+esc(x.reason||"—")+'</td></tr>');
  $("mofasa-audit").innerHTML=rowsAudit.length||rowsArchive.length?'<table><thead><tr><th>القسم</th><th>العملية</th><th>المستخدم</th><th>التاريخ</th><th>الحالة</th><th>السبب</th></tr></thead><tbody>'+rowsAudit.concat(rowsArchive).join("")+'</tbody></table>':"لا توجد تغييرات مسجلة بعد.";
 }
 let workspaceRendered=false;
 function ensureWorkspace(){if(!["admin","hse_admin","medical_admin"].includes(role))return;if(!workspaceRendered){workspaceRendered=true;render();}loadList();}
 document.addEventListener("pofri-session-ready",ensureWorkspace);
 document.addEventListener("mofasa-page-open",()=>{if(!workspaceRendered)ensureWorkspace();});
 document.addEventListener("mofasa-assessment-created",async event=>{const id=event.detail?.id;if(!id||role!=="hse_admin")return;await loadList();await openAssessment(id);if(typeof window.setPage==="function")window.setPage("mofasa");});
})();
