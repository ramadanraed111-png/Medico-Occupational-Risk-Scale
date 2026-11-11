/* MOFASA front-end. Existing Auth accounts are retained; roles are enforced in Supabase RLS. */
const SUPABASE_URL="https://vvagucmjmjoxnyumxtcq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_4jVHbUXOKy4TWG19LvQJJg_4f656sU2";
const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
let user=null,role=null,records=[];
let recoveryMode=(()=>{const h=new URLSearchParams(location.hash.replace(/^#/ ,""));const q=new URLSearchParams(location.search);return h.get("type")==="recovery"||q.get("type")==="recovery"||q.has("code");})();
const $=id=>document.getElementById(id);
const auth=$("auth-panel"),workspace=$("workspace"),recovery=$("recovery-panel");
function msg(id,t,type=""){const e=$(id);e.textContent=t;e.className="status "+type}
function show(which){auth.hidden=which!=="auth";workspace.hidden=which!=="work";recovery.hidden=which!=="recovery";$("module-nav").hidden=which!=="work";$("top-user-info").hidden=which!=="work"}
function value(id){return $(id).value}
function today(){ $("assessment-date").value=new Date().toISOString().slice(0,10);calculateAge()}
function calculateAge(){
 const dob=value("date-of-birth"), at=value("assessment-date"), out=$("age-years");
 if(!dob||!at){out.value="";return null;}
 const birth=new Date(dob+"T00:00:00"), ref=new Date(at+"T00:00:00");
 if(Number.isNaN(birth.getTime())||Number.isNaN(ref.getTime())||birth>ref){out.value="";return null;}
 let age=ref.getFullYear()-birth.getFullYear();
 if(ref.getMonth()<birth.getMonth()||(ref.getMonth()===birth.getMonth()&&ref.getDate()<birth.getDate()))age--;
 out.value=String(age);return age;
}
$("date-of-birth").addEventListener("change",calculateAge);
$("assessment-date").addEventListener("change",calculateAge);
function readForm(){
 const ids=["employee-name","registration-number","date-of-birth","age-years","job-title","task-name","assessment-date","site","evaluator-name","duration","physical","cognitive","height","confined","isolated","driving","chem","noise","heat","bio","physical-hazard","frequency","inherent-risk","controls","residual-risk","permit","tra-notes","medical-fit","capacity","medical-restrictions","medical-followup","care-access","evacuation","communications","site-support","decision-notes","recommendations"];
 const data=Object.fromEntries(ids.map(id=>[id,value(id)]));
 data.age_years=calculateAge();
 data.jem_items=window.POFRI_JEM?.getItems?.()||[];
 data.mcm_items=window.POFRI_MCM?.getItems?.()||[];
 return data;
}
function analyze(d){
 const reasons=[];
 if(d.jem_items?.length)reasons.push("تم توثيق "+d.jem_items.length+" من عناصر التعرض في مكتبة JEM؛ راجع أوصاف القياس والضوابط لكل خطر.");
 let cls="A",label="A – ملائم مبدئياً للمهمة المحددة",tone="";
 const escalate=c=>{if(c==="D"||(c==="C"&&cls!=="D")||(c==="B"&&cls==="A"))cls=c};
 if(d["medical-fit"]==="incompatible"||d.capacity==="insufficient"){escalate("D");reasons.push("عدم توافق طبي/وظيفي مع متطلبات المهمة الحالية وفق المدخلات");}
 if(d["medical-fit"]==="temporary"||d["medical-fit"]==="pending"||d.capacity==="unknown"){escalate("C");reasons.push("التقييم الطبي أو تحديد القدرة الوظيفية غير مكتمل أو يتطلب مراجعة");}
 if(d["medical-fit"]==="restricted"||d.capacity==="limited"||d.controls!=="effective"||["high","critical"].includes(d["residual-risk"])||["high"].some(k=>[d.chem,d.noise,d.heat,d.bio,d["physical-hazard"]].includes(k))||["high","very_high"].includes(d.physical)||["high","very_high"].includes(d.cognitive)||d.height==="yes"||d.confined==="yes"||d.isolated==="yes"||d.driving==="yes"||["high","critical"].includes(d["inherent-risk"])||["remote","limited","moderate"].includes(d["care-access"])||["partial","weak","unknown"].includes(d.evacuation)||["poor","intermittent","unknown"].includes(d.communications)||["inadequate","limited","unknown"].includes(d["site-support"])){escalate("B");reasons.push("توجد قيود أو تعرضات/متطلبات مرتفعة أو فجوات في التحكم أو دعم الموقع تستلزم معالجة موثقة");}
 if(d["residual-risk"]==="critical"||(d["inherent-risk"]==="critical"&&d.controls!=="effective")||(d.evacuation==="weak"&&d["care-access"]==="remote")){escalate("C");reasons.push("مؤشر خطر حرج أو ترتيبات طوارئ غير كافية: أوقف إسناد المهمة حتى المراجعة والتحكم");}
 const siteNames={
  "care-access":{good:"الرعاية الطبية متاحة سريعاً",moderate:"زمن الوصول للرعاية الطبية متوسط",limited:"الوصول للرعاية الطبية محدود",remote:"الرعاية الطبية بعيدة أو صعبة الوصول"},
  evacuation:{ready:"خطة الإسعاف والإخلاء جاهزة ومختبرة",partial:"الإسعاف والإخلاء متاحان جزئياً",weak:"ترتيبات الإسعاف والإخلاء غير كافية",unknown:"جاهزية الإسعاف والإخلاء غير متحققة"},
  communications:{reliable:"الاتصالات موثوقة",intermittent:"الاتصالات متقطعة",poor:"الاتصالات ضعيفة",unknown:"حالة الاتصالات غير متحققة"},
  "site-support":{adequate:"دعم الموقع للمخاطر الطبية كافٍ",limited:"دعم الموقع للمخاطر الطبية محدود",inadequate:"دعم الموقع للمخاطر الطبية غير كافٍ",unknown:"ملاءمة دعم الموقع غير محددة"}
 };
 const siteFindings=Object.entries(siteNames).filter(([id])=>d[id]).map(([id,labels])=>labels[d[id]]||"قيمة موقع غير معروفة");
 if(siteFindings.length)reasons.push("محور الموقع والطوارئ (مُدخل في التقييم): "+siteFindings.join("؛ ")+".");
 if(d["care-access"]==="good"&&d.evacuation==="ready"&&d.communications==="reliable"&&d["site-support"]==="adequate")reasons.push("مدخلات الموقع الأربعة تشير إلى جاهزية مناسبة؛ لذلك تكون مساهمة E منخفضة (صفر عند اختيار أفضل مستوى في جميع الحقول)، وهذا يعني قلة الفجوات المرصودة وليس تجاهل المحور.");
 if(d["medical-fit"]==="pending"||d.capacity==="unknown"||d.controls==="unknown"||d.evacuation==="unknown"||d.communications==="unknown"||d["site-support"]==="unknown")reasons.push("هناك بيانات أساسية غير متحققة؛ لا يمكن اعتبار غياب المعلومة دليلاً على السلامة");
 if(cls==="D")label="D – غير ملائم لهذه المهمة المحددة حالياً";
 if(cls==="C")label="C – غير ملائم مؤقتاً / يلزم إيقاف الإسناد والمراجعة";
 if(cls==="B")label="B – ملائم بشروط بعد تنفيذ القيود والتحقق منها";
 if(cls==="A"&&reasons.length===0)reasons.push("لم تظهر بوابة تصعيد ضمن البيانات المدخلة؛ يلزم اعتماد الطبيب والتحقق الميداني قبل القرار");
 return {code:cls,label,reasons,tone:cls==="C"||cls==="D"?"critical":cls==="B"?"conditional":""};
}
function preview(){
 const d=readForm();const r=analyze(d);
 const score=window.POFRI_EXPERIMENTAL_SCORE?.calculate(d)||null;
 const box=$("decision-preview");box.hidden=false;box.className="decision "+r.tone;
 $("decision-label").textContent=r.label;$("decision-reasons").textContent=r.reasons.join(" • ");
 $("decision-caution").textContent="تصنيف A/B/C/D ناتج عن قواعد الفرز الحالية. المؤشر الرقمي أدناه تجريبي للعرض والمناقشة فقط، ولا يغيّر التصنيف أو يتجاوز بوابات السلامة أو الحكم الطبي.";
 const scoreBox=$("score-preview");
 if(scoreBox&&score){
   scoreBox.hidden=false;
   $("score-total").textContent=score.total===null?"غير مكتمل — استكمل مدخلات المحاور المطلوبة":score.total+" / 100 — مستوى القلق: "+score.band;
   $("score-formula").textContent=score.formula;
   $("score-meaning").textContent=score.meaning+" "+score.band_note;
   $("score-components").innerHTML=[
     ["R","الخطر المهني المتبقي (30%)",score.components.R],
     ["M","التوافق الطبي (30%)",score.components.M],
     ["F","التوافق الوظيفي (25%)",score.components.F],
     ["E","جاهزية الموقع للطوارئ (15%)",score.components.E]
   ].map(x=>'<tr><td>'+x[0]+'</td><td>'+x[1]+'</td><td>'+(x[2]===null?"غير مكتمل":x[2]+" / 100")+'</td></tr>').join("");
   $("site-score-breakdown").innerHTML=score.details.site_breakdown.map(x=>'<tr><td>'+x.label+'</td><td>'+x.choice+'</td><td>'+(x.score===null?"غير مكتمل":x.score+" / 100")+'</td></tr>').join("");
   $("score-method-note").textContent="عدد الأخطار المسجلة: "+score.details.hazard_count+"؛ درجة الخطر المتبقي في TRA: "+score.details.tra_residual+". الصفر يعني أقل قلق/فجوة مرصودة، و100 يعني أعلى قلق/فجوة؛ ولا تمثل الدرجة احتمالاً طبياً أو نسبة لياقة.";
 }
 return {d,r,score};
}
async function session(u){
 user=u;const {data,error}=await client.from("app_users").select("role,email").eq("user_id",u.id).maybeSingle();
 if(error||!data){await client.auth.signOut();user=null;show("auth");msg("login-message","تعذر التحقق من صلاحية الحساب. راجع مسؤول النظام.","error");return;}
 role=data.role;show("work");document.dispatchEvent(new Event("pofri-session-ready"));const roleNames={admin:"Super Admin",hse_admin:"HSE",medical_admin:"Physician",data_entry:"Data Entry"};$("top-user-info").textContent=(data.email||u.email)+" ---- "+(roleNames[role]||"Unknown Role");
 $("admin-panel").hidden=role!=="admin";today();if(role==="admin")loadRecords();
}
$("login-form").addEventListener("submit",async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;const {data,error}=await client.auth.signInWithPassword({email:value("login-email"),password:value("login-password")});b.disabled=false;if(error){msg("login-message","تعذر تسجيل الدخول: "+error.message,"error");return;}await session(data.user);});
$("forgot-password").addEventListener("click",async()=>{const email=value("login-email").trim();if(!email){msg("login-message","أدخل البريد الإلكتروني أولاً.");return;}const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});msg("login-message",error?"تعذر إرسال الرابط: "+error.message:"إذا كان البريد مسجلاً فستصلك رسالة لاستعادة كلمة المرور.");});
$("recovery-form").addEventListener("submit",async e=>{e.preventDefault();if(value("new-password")!==value("confirm-password")){msg("recovery-message","كلمتا المرور غير متطابقتين.","error");return;}const {error}=await client.auth.updateUser({password:value("new-password")});if(error){msg("recovery-message","تعذر تحديث كلمة المرور: "+error.message,"error");return;}recoveryMode=false;$("new-password").value="";$("confirm-password").value="";await client.auth.signOut();show("auth");msg("login-message","تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.","success");});
$("logout").addEventListener("click",async()=>{await client.auth.signOut();user=null;role=null;show("auth")});
$("preview-button").addEventListener("click",()=>{if(!$("assessment-form").reportValidity())return;preview()});
$("assessment-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!user||!role){msg("assessment-message","انتهت الجلسة؛ سجل الدخول مجدداً.","error");return;}
 if(!$("assessment-form").reportValidity())return;
 const {d,r,score}=preview();if(d.age_years===null){msg("assessment-message","تحقق من تاريخ الميلاد؛ يجب أن يكون صحيحاً وألا يتجاوز تاريخ التقييم.","error");$("date-of-birth").focus();return;}if(!d.duration.trim()||!d.recommendations.trim()){msg("assessment-message","يجب إدخال مدة المهمة/الوردية والقيود والتوصيات النهائية قبل حفظ التقييم. لا تقبل الحقول الفارغة أو المسافات فقط.","error");$( !d.duration.trim() ? "duration" : "recommendations").focus();return;}const payload={employee_name:d["employee-name"],registration_number:d["registration-number"],job_title:d["job-title"],task_name:d["task-name"],assessment_date:d["assessment-date"],site:d.site,evaluator_name:d["evaluator-name"],duration:d.duration,job_task:{physical:d.physical,cognitive:d.cognitive,height:d.height,confined_space:d.confined,isolated_work:d.isolated,driving:d.driving},exposures:{items:d.jem_items,chemical:d.chem,noise_vibration:d.noise,heat_weather:d.heat,biological:d.bio,physical_mechanical:d["physical-hazard"],frequency:d.frequency},task_risk:{inherent:d["inherent-risk"],controls:d.controls,residual:d["residual-risk"],permit:d.permit,notes:d["tra-notes"]},medical:{fit:d["medical-fit"],capacity:d.capacity,conditions:d.mcm_items,medical_review_required:d.mcm_items.some(c=>c.level===4),restrictions:d["medical-restrictions"],followup:d["medical-followup"],worker_profile:{date_of_birth:d["date-of-birth"],age_years:d.age_years}},location_emergency:{care_access:d["care-access"],evacuation:d.evacuation,communications:d.communications,site_support:d["site-support"]},decision:{code:r.code,label:r.label,reasons:r.reasons,notes:d["decision-notes"],recommendations:d.recommendations,experimental_score:score},algorithm_version:"POFRI-WEIGHTED-1.1-DRAFT",created_by:user.id};
 const b=$("save-button");b.disabled=true;b.textContent="جارٍ الحفظ...";
 const {error}=await client.from("pofri_assessments").insert(payload);
 b.disabled=false;b.textContent="حفظ تقييم POFRI";
 if(error){msg("assessment-message","لم يُحفظ التقييم. قد يلزم تطبيق ملف SQL الخاص بجدول POFRI وسياسات الصلاحيات. التفاصيل: "+error.message,"error");return;}
 $("assessment-form").reset();window.POFRI_JEM?.clear?.();window.POFRI_MCM?.clear?.();today();$("decision-preview").hidden=true;msg("assessment-message","تم حفظ تقييم POFRI بنجاح.","success");if(role==="admin")loadRecords();
});
async function loadRecords(){
 msg("admin-message","جارٍ تحميل ملفات تقييم MOFASA الجديدة...");
 const {data,error}=await client.from("mofasa_assessments").select("id,worker_name,registration_number,job_title,task_name,assessment_date,site,hse_status,medical_status").order("assessment_date",{ascending:false}).limit(500);
 if(error){records=[];$("records-body").innerHTML='<tr><td colspan="9">تعذر تحميل السجلات: '+esc(error.message)+'</td></tr>';msg("admin-message","تعذر تحميل سجلات MOFASA: "+error.message,"error");return;}
 const list=data||[], ids=list.map(x=>x.id);let medicalById={};
 if(ids.length){
  const q=await client.from("mofasa_medical_sections").select("assessment_id,status,final_decision").in("assessment_id",ids);
  if(q.error){records=[];$("records-body").innerHTML='<tr><td colspan="9">تعذر تحميل حالة القسم الطبي: '+esc(q.error.message)+'</td></tr>';msg("admin-message","تعذر تحميل بيانات الحالة الطبية: "+q.error.message,"error");return;}
  (q.data||[]).forEach(x=>{medicalById[x.assessment_id]=x;});
 }
 records=list.map(x=>({...x,medical_record:medicalById[x.id]||null}));
 const statusLabel=s=>({pending:"لم يبدأ",draft:"مسودة",submitted:"مكتمل ومُرسل"}[s]||"غير محدد");
 $("records-body").innerHTML=records.length?records.map(x=>'<tr><td>'+esc(x.assessment_date)+'</td><td>'+esc(x.worker_name)+'</td><td>'+esc(x.registration_number)+'</td><td>'+esc(x.job_title)+'</td><td>'+esc(x.task_name)+'</td><td>'+esc(x.site)+'</td><td>'+esc(statusLabel(x.hse_status))+'</td><td>'+esc(statusLabel(x.medical_status))+'</td><td>'+esc(x.medical_record?.final_decision||"لم يعتمد بعد")+'</td></tr>').join(""):'<tr><td colspan="9">لا توجد تقييمات MOFASA جديدة حتى الآن.</td></tr>';
 msg("admin-message","عدد ملفات تقييم MOFASA الجديدة: "+records.length,"success");
 document.dispatchEvent(new Event("mofasa-records-loaded"));
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("refresh-button").addEventListener("click",loadRecords);
$("export-button").addEventListener("click",()=>{const rows=[["تاريخ التقييم","العامل","الرقم الوظيفي","الوظيفة","المهمة","الموقع","حالة قسم السلامة","حالة القسم الطبي","الرأي الطبي النهائي"],...records.map(x=>[x.assessment_date,x.worker_name,x.registration_number,x.job_title,x.task_name,x.site,x.hse_status,x.medical_status,x.medical_record?.final_decision||"لم يعتمد بعد"])];const csv="\uFEFF"+rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="MOFASA-new-assessments.csv";a.click();URL.revokeObjectURL(a.href);});
client.auth.onAuthStateChange((event,s)=>{if(event==="PASSWORD_RECOVERY"){recoveryMode=true;user=s?.user||null;show("recovery");msg("recovery-message","أدخل كلمة المرور الجديدة ثم احفظها لإكمال الاستعادة.");return;}if(recoveryMode){show("recovery");return;}if(event==="SIGNED_OUT"){user=null;role=null;show("auth");return;}if(s?.user&&!user)session(s.user)});
(async()=>{const {data}=await client.auth.getSession();if(recoveryMode){show("recovery");}else if(data.session?.user){await session(data.session.user);}else show("auth");})();
