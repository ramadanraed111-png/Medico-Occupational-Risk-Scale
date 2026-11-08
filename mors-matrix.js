/* MORS catalog and matrix interface. Preserves the existing H/E/M formula. */
(() => {
  "use strict";
  const db = window.morsSupabaseClient;
  const form = document.getElementById("assessment-form");
  if (!db || !form || form.dataset.matrixReady) return;
  form.dataset.matrixReady = "1";
  const $ = id => document.getElementById(id);
  const state = { sectors: [], jobs: [], categories: [], hazards: [], specialties: [], conditions: [], selectedHazards: [], selectedConditions: [], user: null, role: null };
  const specialtyArabic = {
    "Respiratory":"أمراض الجهاز التنفسي","Neurological Diseases":"الأمراض العصبية","Cardiovascular":"القلب والأوعية الدموية",
    "Diabetes Mellitus":"داء السكري","Renal Diseases":"أمراض الكلى","Liver Diseases":"أمراض الكبد","Hematological Diseases":"أمراض الدم",
    "Psychiatric Disorders":"الاضطرابات النفسية","Ophthalmological Diseases":"أمراض العيون","ENT / Hearing / Vestibular":"الأنف والأذن والحنجرة والسمع والاتزان",
    "Musculoskeletal / Orthopedic":"العضلات والعظام","Infectious Diseases":"الأمراض المعدية","Cancer":"الأورام","Sleep Disorders":"اضطرابات النوم"
  };
  const style = document.createElement("style");
  style.textContent = ".mors-extra{margin:18px 0;padding:16px;border:1px solid #dce6e9;border-radius:12px;background:#fff}.mors-extra h4{margin:0 0 10px;color:#123b4a}.mors-extra-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.mors-extra label{display:block;font-size:13px;margin-bottom:5px}.mors-extra select,.mors-extra input{width:100%;min-height:40px}.mors-extra .mors-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:8px;border-bottom:1px solid #eee}.mors-extra button{width:auto;margin:6px 0}.mors-extra small{color:#637780}.mors-extra .mors-note{padding:10px;background:#f4f7f8;border-radius:8px;margin:10px 0;font-size:12px}@media(max-width:650px){.mors-extra-grid{grid-template-columns:1fr}}";
  document.head.appendChild(style);
  const jobBlock = document.createElement("section");
  jobBlock.className = "mors-extra";
  jobBlock.innerHTML = '<h4>مكتبة الوظائف</h4><div class="mors-extra-grid"><div><label for="mors-sector">القطاع الوظيفي</label><select id="mors-sector"><option value="">اختر القطاع</option></select></div><div><label for="mors-job">المسمى الوظيفي من المكتبة</label><select id="mors-job" disabled><option value="">اختر القطاع أولاً</option></select></div></div><p class="mors-note">اختيار الوظيفة يوحّد المسمى فقط، ولا يفترض وجود مخاطر تلقائية.</p>';
  $("job-title").closest(".form-group").insertAdjacentElement("afterend", jobBlock);
  const matrix = document.createElement("section");
  matrix.className = "mors-extra";
  matrix.innerHTML = '<h4>مصفوفة المخاطر المهنية</h4><div class="mors-extra-grid"><div><label for="mors-hcat">فئة الخطر</label><select id="mors-hcat"><option value="">اختر الفئة</option></select></div><div><label for="mors-hazard">الخطر المحدد</label><select id="mors-hazard" disabled><option value="">اختر الفئة أولاً</option></select></div><div><label for="mors-hlevel">الشدة (1–4)</label><select id="mors-hlevel"><option value="">اختر</option><option value="1">1 منخفض</option><option value="2">2 متوسط</option><option value="3">3 مرتفع</option><option value="4">4 شديد/حرج</option></select></div><div><label for="mors-frequency">تكرار التعرض</label><select id="mors-frequency"><option value="">اختر</option><option>تعرض نادر</option><option>تعرض ظرفي</option><option>تعرض متكرر</option><option>تعرض مستمر</option></select></div><div><label for="mors-control">حالة التحكم</label><select id="mors-control"><option value="">اختر</option><option>موجودة ومستخدمة</option><option>موجودة لكن غير مستخدمة</option><option>غير متاحة/غير متوفرة</option></select></div><div><label for="mors-measure">قيمة القياس (اختياري)</label><input id="mors-measure" type="number" step="any"></div><div><label for="mors-unit">وحدة القياس</label><input id="mors-unit" maxlength="40"></div><div><label for="mors-hnotes">ملاحظات التعرض</label><input id="mors-hnotes" maxlength="1500"></div></div><p id="mors-hguide" class="mors-note">اختر الخطر لمراجعة أساس التقييم.</p><button type="button" id="mors-add-h">إضافة الخطر</button><div id="mors-hlist"></div><p class="mors-note">لا توجد في المصفوفة معادلة معتمدة لدمج الشدة والتكرار والتحكم؛ تُسجل هذه العناصر منفصلة للمراجعة المهنية.</p>';
  $("assessment-form").querySelector(".score-section").insertAdjacentElement("afterend", matrix);
  const med = document.createElement("section");
  med.className = "mors-extra";
  med.innerHTML = '<h4>مصفوفة الحالات الطبية</h4><div class="mors-extra-grid"><div><label for="mors-specialty">التخصص الطبي</label><select id="mors-specialty"><option value="">اختر التخصص</option></select></div><div><label for="mors-condition">الحالة الطبية</label><select id="mors-condition" disabled><option value="">اختر التخصص أولاً</option></select></div><div><label for="mors-mlevel">مستوى الحالة (1–4)</label><select id="mors-mlevel"><option value="">اختر</option><option value="1">1 لا توجد مشكلة مهمة</option><option value="2">2 مستقرة ومسيطر عليها</option><option value="3">3 مؤثرة وظيفياً/تحتاج مراجعة</option><option value="4">4 حادة أو غير مستقرة أو خطرة</option></select></div><div><label for="mors-mnotes">ملاحظات سريرية</label><input id="mors-mnotes" maxlength="1500"></div></div><p id="mors-mguide" class="mors-note">اختر الحالة لعرض الوصف المسجل بالمكتبة.</p><button type="button" id="mors-add-m">إضافة الحالة الطبية</button><div id="mors-mlist"></div><p class="mors-note">المستويات العامة لا تمثل تشخيصاً أو قرار لياقة؛ يلزم التقييم الطبي الفردي ومراجعة الأوصاف قبل الاستخدام السريري.</p>';
  matrix.insertAdjacentElement("afterend", med);
  const msg = (s, type="") => { const el=$("assessment-message"); el.textContent=s; el.className="status"+(type?" "+type:""); el.hidden=false; };
  const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fill = (el, rows, key, label, first) => { el.innerHTML='<option value="">'+esc(first)+'</option>'+rows.map(x=>'<option value="'+esc(x[key])+'">'+esc(label(x))+'</option>').join(""); };
  const showList = (id, items, title, detail, attr) => { $(id).innerHTML=items.length?items.map((x,i)=>'<div class="mors-row"><span><b>'+esc(title(x))+'</b><br><small>'+esc(detail(x))+'</small></span><button type="button" data-remove="'+attr+'" data-index="'+i+'">إزالة</button></div>').join(""):'<small>لم تتم إضافة عناصر بعد.</small>'; };
  const setJob = id => { const j=state.jobs.find(x=>x.id===id); if(j) $("job-title").value=j.job_title; };
  $("mors-sector").addEventListener("change",()=>{const rows=state.jobs.filter(x=>String(x.sector_id)===$("mors-sector").value);fill($("mors-job"),rows,"id",x=>x.job_title,"اختر الوظيفة");$("mors-job").disabled=!rows.length;});
  $("mors-job").addEventListener("change",()=>setJob($("mors-job").value));
  $("mors-hcat").addEventListener("change",()=>{const rows=state.hazards.filter(x=>String(x.category_id)===$("mors-hcat").value);fill($("mors-hazard"),rows,"id",x=>x.hazard_name,"اختر الخطر");$("mors-hazard").disabled=!rows.length;$("mors-hguide").textContent="اختر الخطر لعرض أساس التقييم.";});
  $("mors-hazard").addEventListener("change",()=>{const h=state.hazards.find(x=>x.id===$("mors-hazard").value);$("mors-hguide").textContent=h?["أساس التقييم: "+(h.severity_basis||"غير محدد"),h.severity_level_1,h.severity_level_2,h.severity_level_3,h.severity_level_4,h.special_handling_note].filter(Boolean).join("\n"):"";});
  $("mors-specialty").addEventListener("change",()=>{const rows=state.conditions.filter(x=>String(x.specialty_id)===$("mors-specialty").value);fill($("mors-condition"),rows,"id",x=>x.condition_name,"اختر الحالة");$("mors-condition").disabled=!rows.length;});
  $("mors-condition").addEventListener("change",()=>{const c=state.conditions.find(x=>x.id===$("mors-condition").value);$("mors-mguide").textContent=c?[c.level_1,c.level_2,c.level_3,c.level_4].filter(Boolean).join("\n"):"";});
  $("mors-add-h").addEventListener("click",()=>{const h=state.hazards.find(x=>x.id===$("mors-hazard").value),level=Number($("mors-hlevel").value),frequency=$("mors-frequency").value,control=$("mors-control").value;if(!h||![1,2,3,4].includes(level)||!frequency||!control)return msg("اختر الخطر والشدة والتكرار وحالة التحكم.","error");if(state.selectedHazards.some(x=>x.hazard_id===h.id))return msg("هذا الخطر مضاف بالفعل.","error");const m=$("mors-measure").value;state.selectedHazards.push({hazard_id:h.id,hazard_name:h.hazard_name,severity_level:level,exposure_frequency:frequency,control_status:control,measurement_value:m===""?null:Number(m),measurement_unit:$("mors-unit").value.trim(),exposure_notes:$("mors-hnotes").value.trim()});showList("mors-hlist",state.selectedHazards,x=>x.hazard_name,x=>"الشدة "+x.severity_level+"/4 · "+x.exposure_frequency+" · "+x.control_status+" · "+(x.exposure_notes||""),"h");$("mors-hlevel").value="";$("mors-frequency").value="";$("mors-control").value="";});
  $("mors-add-m").addEventListener("click",()=>{const c=state.conditions.find(x=>x.id===$("mors-condition").value),level=Number($("mors-mlevel").value);if(!c||![1,2,3,4].includes(level))return msg("اختر التخصص والحالة ومستواها.","error");if(state.selectedConditions.some(x=>x.medical_condition_id===c.id))return msg("هذه الحالة مضافة بالفعل.","error");const s=state.specialties.find(x=>x.id===c.specialty_id);state.selectedConditions.push({medical_condition_id:c.id,condition_name:c.condition_name,severity_level:level,clinical_notes:$("mors-mnotes").value.trim(),specialty_name:specialtyArabic[s?.specialty_name]||s?.specialty_name||""});showList("mors-mlist",state.selectedConditions,x=>x.condition_name,x=>x.specialty_name+" · المستوى "+x.severity_level+"/4 · "+(x.clinical_notes||""),"m");$("mors-mlevel").value="";$("mors-mnotes").value="";});
  form.addEventListener("click",e=>{const b=e.target.closest("button[data-remove]");if(!b)return;const arr=b.dataset.remove==="h"?state.selectedHazards:state.selectedConditions;arr.splice(Number(b.dataset.index),1);showList(b.dataset.remove==="h"?"mors-hlist":"mors-mlist",arr,x=>b.dataset.remove==="h"?x.hazard_name:x.condition_name,x=>b.dataset.remove==="h"?"الشدة "+x.severity_level+"/4 · "+x.exposure_frequency+" · "+x.control_status:x.specialty_name+" · المستوى "+x.severity_level+"/4",b.dataset.remove);});
  async function loadCatalogs(){
    const qs=await Promise.all([
      db.from("job_sectors").select("id,name,display_order").order("display_order"),
      db.from("job_catalog").select("id,sector_id,job_title,display_order").eq("active",true).order("display_order"),
      db.from("hazard_categories").select("id,category_name,display_order").order("display_order"),
      db.from("hazard_catalog").select("id,category_id,hazard_name,severity_level_1,severity_level_2,severity_level_3,severity_level_4,severity_basis,special_handling_note,uses_general_severity_scale").eq("active",true).order("display_order"),
      db.from("medical_specialties").select("id,specialty_name,display_order").order("display_order"),
      db.from("medical_conditions").select("id,specialty_id,condition_name,level_1,level_2,level_3,level_4").eq("active",true).order("display_order")
    ]);
    const err=qs.find(x=>x.error)?.error;if(err)throw err;
    [state.sectors,state.jobs,state.categories,state.hazards,state.specialties,state.conditions]=qs.map(x=>x.data||[]);
    fill($("mors-sector"),state.sectors,"id",x=>x.name,"اختر القطاع");
    fill($("mors-hcat"),state.categories,"id",x=>x.category_name,"اختر فئة الخطر");
    fill($("mors-specialty"),state.specialties,"id",x=>specialtyArabic[x.specialty_name]||x.specialty_name,"اختر التخصص");
  }
  async function identity(){
    const {data,error}=await db.auth.getSession();if(error||!data.session)return;
    state.user=data.session.user;
    const r=await db.from("app_users").select("role").eq("user_id",state.user.id).maybeSingle();state.role=r.data?.role||null;
    if(state.role&&!state.loaded){state.loaded=true;try{await loadCatalogs();}catch(e){console.error("MORS catalog load",e);msg("تعذر تحميل مكتبات الوظائف والمخاطر والحالات الطبية: "+e.message,"error");}}
  }
  db.auth.onAuthStateChange((_e,s)=>{if(s)Promise.resolve().then(identity);else{state.user=null;state.role=null;}});
  form.addEventListener("submit",async e=>{
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    if(!state.user||!state.role)await identity();
    if(!state.user||!["admin","data_entry"].includes(state.role))return msg("انتهت الجلسة أو لا توجد صلاحية. سجّل الدخول مجدداً.","error");
    const H=Number($("hazard-severity").value),E=Number($("exposure-severity").value),M=Number($("health-condition").value);
    if(![H,E,M].every(x=>[1,2,3,4].includes(x)))return msg("يرجى اختيار درجات H وE وM.","error");
    const index=25*(.3*H+.2*E+.5*M),rounded=Math.round(index);
    const classification=rounded<=40?"مناسب للوظيفة حالياً":rounded<=70?"مناسب مع بعض القيود":rounded<=80?"غير مناسب مؤقتاً":"غير مناسب ومطلوب التعديل";
    const restrictions=$("restrictions").value.trim(),notes=$("deep-assessment-notes").value.trim();
    if(classification==="مناسب مع بعض القيود"&&!restrictions)return msg("يرجى توضيح القيود والتوصيات الوظيفية.","error");
    if(classification==="غير مناسب مؤقتاً"&&!notes)return msg("يرجى إدخال ملاحظات التقييم المتعمق.","error");
    const payload={assessment_date:$("assessment-date").value,employee_name:$("employee-name").value.trim(),registration_number:$("registration-number").value.trim(),job_title:$("job-title").value.trim(),site:$("site").value,evaluator_name:$("evaluator-name").value.trim(),hazard_severity:H,exposure_severity:E,health_condition:M,restrictions:restrictions||null,deep_assessment_notes:notes||null};
    const btn=$("save-assessment-button");btn.disabled=true;btn.textContent="جارٍ حفظ التقييم والمصفوفات...";
    try{
      const {error}=await db.rpc("create_occupational_assessment_with_details",{p_assessment:payload,p_job_id:$("mors-job").value||null,p_hazards:state.selectedHazards.map(({hazard_id,severity_level,exposure_frequency,control_status,exposure_notes,measurement_value,measurement_unit})=>({hazard_id,severity_level,exposure_frequency,control_status,exposure_notes,measurement_value,measurement_unit})),p_medical_conditions:state.selectedConditions.map(({medical_condition_id,severity_level,clinical_notes})=>({medical_condition_id,severity_level,clinical_notes}))});
      if(error)throw error;
      const hc=state.selectedHazards.length,mc=state.selectedConditions.length;form.reset();state.selectedHazards=[];state.selectedConditions=[];
      $("mors-hlist").innerHTML="<small>لم تتم إضافة عناصر بعد.</small>";$("mors-mlist").innerHTML="<small>لم تتم إضافة عناصر بعد.</small>";
      $("mors-job").value="";$("mors-sector").value="";$("mors-job").disabled=true;
      $("mors-hcat").value="";$("mors-hazard").innerHTML='<option value="">اختر الفئة أولاً</option>';$("mors-hazard").disabled=true;
      $("mors-specialty").value="";$("mors-condition").innerHTML='<option value="">اختر التخصص أولاً</option>';$("mors-condition").disabled=true;
      $("result-preview").hidden=true;
      const d=new Date();$("assessment-date").value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
      msg("تم حفظ التقييم والمصفوفات بنجاح: "+hc+" مخاطر و"+mc+" حالات طبية. المؤشر "+index.toFixed(2)+"؛ التصنيف: "+classification,"success");
      if(state.role==="admin")$("refresh-assessments-button")?.click();
    }catch(err){console.error("MORS save",err);msg("تعذر حفظ التقييم: "+(err.message||"خطأ غير معروف"),"error");}
    finally{btn.disabled=false;btn.textContent="حفظ التقييم";}
  },true);
  identity();
})();