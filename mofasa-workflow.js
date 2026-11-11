/* MOFASA shared assessment workflow: section data is isolated by database RLS. */
(()=> {
 const root=document.getElementById("mofasa-panel"); if(!root)return;
 const $=id=>document.getElementById(id), esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let selected=null, parent=null, hseRow=null, medicalRow=null, rows=[];
 const isAdmin=()=>role==="admin", canHse=()=>isAdmin()||role==="hse_admin", canMedical=()=>isAdmin()||role==="medical_admin";
 const statusLabel=s=>({pending:"لم يبدأ",draft:"مسودة",submitted:"مكتمل ومُرسل"}[s]||"غير معروف");
 const msg=(t,kind="")=>{const n=$("mofasa-message");if(n){n.textContent=t;n.className="status "+kind;}};
 function field(id,label,placeholder="",type="text"){return '<label>'+label+'<input id="'+id+'" type="'+type+'" placeholder="'+placeholder+'" required></label>';}
 function area(id,label,placeholder){return '<label>'+label+'<textarea id="'+id+'" rows="3" placeholder="'+placeholder+'"></textarea></label>';}
 function render(){
  root.innerHTML='<div class="workspace-head"><div><h3>MOFASA – التقييم المشترك</h3><p class="muted">ملف واحد للعامل والمهمة، مع قسم سلامة وقسم طبي مستقلين.</p></div><button type="button" class="secondary" id="mofasa-refresh">تحديث السجلات</button></div>'+
   '<div class="notice"><strong>حوكمة الصلاحيات:</strong> مسؤول السلامة لا يستطيع الاطلاع على البيانات الطبية أو اعتماد اللياقة. طبيب الموقع لا يستطيع تعديل قسم السلامة. لا يصبح القرار نهائياً إلا بعد إرسال القسمين واعتماد الرأي الطبي.</div>'+
   (canHse()?'<section class="specialist-section" id="mofasa-create-wrap"><h4>إنشاء ملف تقييم مشترك</h4><form id="mofasa-create-form"><div class="specialist-grid">'+field("mf-name","اسم العامل","الاسم الرباعي")+field("mf-reg","الرقم الوظيفي","رقم التسجيل")+field("mf-job","الوظيفة","المسمى الوظيفي")+field("mf-task","المهمة المحددة","المهمة الفعلية")+field("mf-date","تاريخ التقييم","","date")+'<label>الموقع<select id="mf-site" required><option value="">اختر الموقع</option><option>بدر-3</option><option>الأبيض</option><option>علم الشاويش</option><option>نياج-1</option><option>موقع آخر</option></select></label>'+field("mf-duration","مدة الوردية / المهمة","مثال: 12 ساعة")+'</div><button type="submit">إنشاء ملف مشترك</button></form></section>':'')+
   '<div class="specialist-section"><h4>ملفات التقييم</h4><div id="mofasa-list" class="table-wrap">جارٍ تحميل السجلات...</div></div>'+
   '<section class="specialist-section" id="mofasa-selected" hidden><div id="mofasa-record-header"></div>'+
    (canHse()?'<form id="mofasa-hse-form"><h4>قسم مسؤول السلامة (HSE)</h4><p class="specialist-help">يُحفظ هذا القسم مستقلاً عن الملف الطبي. بعد الإرسال يصبح القسم مقفلاً ولا يمكن تعديله.</p><div class="specialist-grid">'+area("mh-tasks","المهام الأساسية ومتطلبات الوظيفة","سجل المهام والواجبات الحساسة للسلامة")+area("mh-hazards","الأخطار المهنية وتقييمها","كل خطر: الشدة، معدل التعرض، الضوابط، والخطر المتبقي")+area("mh-demands","المتطلبات البدنية والذهنية والوظيفية","المجهود، الانتباه، الورديات، القيادة، الارتفاعات...")+area("mh-emergency","جاهزية الموقع والطوارئ","الرعاية الطبية، الإسعاف، الإخلاء، الاتصالات، دعم الموقع")+area("mh-notes","ملاحظات مسؤول السلامة","إجراءات التحكم والتوصيات")+'</div><div class="specialist-actions"><button type="button" class="secondary" id="mofasa-hse-draft">حفظ مسودة السلامة</button><button type="button" id="mofasa-hse-submit">إرسال قسم السلامة</button></div><div id="mofasa-hse-lock" class="specialist-help"></div></form>':'')+
    (canMedical()?'<form id="mofasa-med-form"><h4>قسم طبيب الموقع</h4><p class="specialist-help">البيانات الطبية لا تظهر لمسؤول السلامة. اعتماد الرأي الطبي يتطلب اكتمال قسم السلامة وإرساله.</p><div class="specialist-grid">'+area("mm-exam","الفحص السريري","النتائج والملاحظات السريرية")+area("mm-labs","التحاليل والفحوصات","الفحوصات والنتائج والتواريخ")+area("mm-diseases","الحالات الطبية","الحالات ذات الصلة ومستوى تأثيرها الوظيفي")+area("mm-capacity","القدرة الوظيفية وFitness Essentials","القدرات ومتطلبات الوظيفة الأساسية ومدى استيفائها")+area("mm-restrictions","القيود والمتابعة الطبية","القيود المؤقتة أو الدائمة وخطة المتابعة")+area("mm-notes","ملاحظات الطبيب","التبرير الطبي والملاحظات")+'<label>الرأي الطبي النهائي<select id="mm-decision"><option value="">لم يعتمد بعد</option><option value="fit">مستوفٍ لمتطلبات الوظيفة المحددة</option><option value="fit_with_restrictions">مستوفٍ بشروط وقيود</option><option value="temporarily_unfit">غير مستوفٍ مؤقتاً</option><option value="unfit">غير مستوفٍ لمتطلبات الوظيفة</option><option value="specialist_review">يحتاج مراجعة طبية متخصصة</option></select></label></div><div class="specialist-actions"><button type="button" class="secondary" id="mofasa-med-draft">حفظ مسودة طبية</button><button type="button" id="mofasa-med-submit">إرسال واعتماد الرأي الطبي</button></div><div id="mofasa-med-lock" class="specialist-help"></div></form>':'')+
   (isAdmin()?'<div class="specialist-section"><h4>سجل التدقيق</h4><div id="mofasa-audit" class="table-wrap">اختر ملفاً لعرض سجل التغييرات.</div></div>':'')+
   '</section><div id="mofasa-message" class="status" aria-live="polite"></div>';
  $("mofasa-refresh").onclick=loadList;
  if(canHse()){$("mofasa-create-form").addEventListener("submit",createAssessment);$("mf-date").value=new Date().toISOString().slice(0,10);}
 }
 async function loadList(){
  const {data,error}=await client.from("mofasa_assessments").select("id,worker_name,registration_number,job_title,task_name,assessment_date,site,hse_status,medical_status").order("assessment_date",{ascending:false}).limit(500);
  if(error){$("mofasa-list").textContent="تعذر تحميل الملفات: "+error.message;return;}
  rows=data||[];
  $("mofasa-list").innerHTML=rows.length?'<table><thead><tr><th>العامل</th><th>الرقم</th><th>الوظيفة / المهمة</th><th>التاريخ</th><th>السلامة</th><th>الطب</th><th>فتح</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+esc(x.worker_name)+'</td><td>'+esc(x.registration_number)+'</td><td>'+esc(x.job_title)+' / '+esc(x.task_name)+'</td><td>'+esc(x.assessment_date)+'</td><td>'+statusLabel(x.hse_status)+'</td><td>'+statusLabel(x.medical_status)+'</td><td><button type="button" data-open-mofasa="'+esc(x.id)+'">فتح الملف</button></td></tr>').join("")+'</tbody></table>':'لا توجد ملفات تقييم بعد.';
  $("mofasa-list").querySelectorAll("[data-open-mofasa]").forEach(b=>b.onclick=()=>openAssessment(b.dataset.openMofasa));
 }
 async function createAssessment(e){
  e.preventDefault();const row={worker_name:$("mf-name").value.trim(),registration_number:$("mf-reg").value.trim(),job_title:$("mf-job").value.trim(),task_name:$("mf-task").value.trim(),assessment_date:$("mf-date").value,site:$("mf-site").value,shift_duration:$("mf-duration").value.trim()||null,created_by:user.id};
  if(Object.values(row).slice(0,6).some(v=>!v)){msg("أكمل جميع بيانات العامل والمهمة والموقع والتاريخ.","error");return;}
  const {data,error}=await client.from("mofasa_assessments").insert(row).select("id").single();
  if(error){msg("تعذر إنشاء الملف: "+error.message,"error");return;}
  $("mofasa-create-form").reset();$("mf-date").value=new Date().toISOString().slice(0,10);await loadList();await openAssessment(data.id);msg("تم إنشاء ملف التقييم المشترك. أكمل الآن قسم السلامة.","success");
 }
 async function openAssessment(id){
  const {data:p,error}=await client.from("mofasa_assessments").select("*").eq("id",id).single();
  if(error){msg("تعذر فتح الملف: "+error.message,"error");return;}
  selected=id;parent=p;hseRow=null;medicalRow=null;
  if(canHse()){const q=await client.from("mofasa_hse_sections").select("*").eq("assessment_id",id).maybeSingle();if(!q.error)hseRow=q.data;}
  if(canMedical()){const q=await client.from("mofasa_medical_sections").select("*").eq("assessment_id",id).maybeSingle();if(!q.error)medicalRow=q.data;}
  $("mofasa-selected").hidden=false;
  $("mofasa-record-header").innerHTML='<h4>'+esc(p.worker_name)+' — '+esc(p.registration_number)+'</h4><p>'+esc(p.job_title)+' / '+esc(p.task_name)+' · '+esc(p.site)+' · '+esc(p.assessment_date)+'</p><p>حالة السلامة: <strong>'+statusLabel(p.hse_status)+'</strong> | حالة القسم الطبي: <strong>'+statusLabel(p.medical_status)+'</strong></p>';
  if(canHse()){const d=hseRow?.section_data||{};for(const [id,key] of [["mh-tasks","tasks"],["mh-hazards","hazards"],["mh-demands","demands"],["mh-emergency","emergency"],["mh-notes","notes"]])$(id).value=d[key]||"";const locked=hseRow?.status==="submitted";["mh-tasks","mh-hazards","mh-demands","mh-emergency","mh-notes","mofasa-hse-draft","mofasa-hse-submit"].forEach(id=>$(id).disabled=locked);$("mofasa-hse-lock").textContent=locked?"تم إرسال قسم السلامة وأصبح مقفلاً.":"يمكنك حفظ مسودة أو إرسال القسم بعد استكماله.";}
  if(canMedical()){const d=medicalRow?.section_data||{};for(const [id,key] of [["mm-exam","exam"],["mm-labs","labs"],["mm-diseases","diseases"],["mm-capacity","capacity"],["mm-restrictions","restrictions"],["mm-notes","notes"]])$(id).value=d[key]||"";$("mm-decision").value=medicalRow?.final_decision||"";const locked=medicalRow?.status==="submitted";["mm-exam","mm-labs","mm-diseases","mm-capacity","mm-restrictions","mm-notes","mm-decision","mofasa-med-draft","mofasa-med-submit"].forEach(id=>$(id).disabled=locked);$("mofasa-med-lock").textContent=locked?"تم إرسال واعتماد القسم الطبي وأصبح مقفلاً.":p.hse_status!=="submitted"?"يمكن حفظ المسودة، لكن لا يمكن اعتماد القرار قبل إرسال قسم السلامة.":"قسم السلامة مكتمل؛ يمكنك استكمال المراجعة الطبية واعتماد الرأي.";
  }
  if(canHse()){$("mofasa-hse-draft").onclick=()=>saveSection("hse","draft");$("mofasa-hse-submit").onclick=()=>saveSection("hse","submitted");}
  if(canMedical()){$("mofasa-med-draft").onclick=()=>saveSection("medical","draft");$("mofasa-med-submit").onclick=()=>saveSection("medical","submitted");}
  if(isAdmin())loadAudit(id);
  $("mofasa-selected").scrollIntoView({behavior:"smooth",block:"start"});
 }
 async function saveSection(section,status){
  const isH=section==="hse", table=isH?"mofasa_hse_sections":"mofasa_medical_sections", old=isH?hseRow:medicalRow;
  let section_data,final_decision=null;
  if(isH){section_data={tasks:$("mh-tasks").value.trim(),hazards:$("mh-hazards").value.trim(),demands:$("mh-demands").value.trim(),emergency:$("mh-emergency").value.trim(),notes:$("mh-notes").value.trim()};if(status==="submitted"&&(!section_data.tasks||!section_data.hazards||!section_data.emergency)){msg("لا يمكن إرسال قسم السلامة قبل إدخال المهام والأخطار وجاهزية الطوارئ.","error");return;}}
  else{section_data={exam:$("mm-exam").value.trim(),labs:$("mm-labs").value.trim(),diseases:$("mm-diseases").value.trim(),capacity:$("mm-capacity").value.trim(),restrictions:$("mm-restrictions").value.trim(),notes:$("mm-notes").value.trim()};final_decision=$("mm-decision").value||null;if(status==="submitted"&&parent.hse_status!=="submitted"){msg("لا يمكن اعتماد الرأي الطبي قبل إرسال قسم السلامة.","error");return;}if(status==="submitted"&&!final_decision){msg("اختر الرأي الطبي النهائي قبل الإرسال والاعتماد.","error");return;}if(status==="submitted"&&(!section_data.exam||!section_data.capacity)){msg("أكمل الفحص السريري والقدرة الوظيفية قبل الاعتماد.","error");return;}}
  const payload={assessment_id:selected,section_data,status,updated_by:user.id,...(!old?{created_by:user.id}:{})};
  if(!isH)payload.final_decision=final_decision;
  const query=old?client.from(table).update(payload).eq("id",old.id):client.from(table).insert(payload);
  const {error}=await query;
  if(error){msg("تعذر حفظ القسم. تحقق من الصلاحية وحالة القسم: "+error.message,"error");return;}
  msg(status==="submitted"?(isH?"تم إرسال قسم السلامة وإقفاله.":"تم إرسال واعتماد الرأي الطبي."):"تم حفظ المسودة بنجاح.","success");
  await loadList();await openAssessment(selected);
 }
 async function loadAudit(id){
  const {data,error}=await client.from("mofasa_audit_log").select("section_name,action,actor_id,changed_at,old_status,new_status").eq("assessment_id",id).order("changed_at",{ascending:false});
  $("mofasa-audit").innerHTML=error?"تعذر تحميل سجل التدقيق: "+esc(error.message):data?.length?'<table><thead><tr><th>القسم</th><th>العملية</th><th>المستخدم</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>'+data.map(x=>'<tr><td>'+ (x.section_name==="hse"?"السلامة":"الطب")+'</td><td>'+x.action+'</td><td>'+esc(x.actor_id)+'</td><td>'+esc(new Date(x.changed_at).toLocaleString("ar-EG"))+'</td><td>'+statusLabel(x.new_status)+'</td></tr>').join("")+'</tbody></table>':"لا توجد تغييرات مسجلة بعد.";
 }
 document.addEventListener("pofri-session-ready",()=>{render();loadList();});
})();
