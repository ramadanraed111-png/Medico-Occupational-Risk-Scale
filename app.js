/* POFRI front-end. Existing Supabase Auth and app_users roles are reused. */
const SUPABASE_URL="https://vvagucmjmjoxnyumxtcq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_4jVHbUXOKy4TWG19LvQJJg_4f656sU2";
const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
let user=null,role=null,records=[];
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
 return data;
}
function analyze(d){
 const reasons=[];if(d.jem_items?.length){reasons.push("تم توثيق "+d.jem_items.length+" من عناصر التعرض في مكتبة JEM؛ راجع أوصاف القياس والضوابط لكل خطر.");}
 let cls="A",label="A – ملائم مبدئياً للمهمة المحددة",tone="";
 const escalate=(c)=>{if(c==="D"|| (c==="C"&&cls!=="D") || (c==="B"&&cls==="A"))cls=c};
 if(d["medical-fit"]==="incompatible"||d.capacity==="insufficient"){escalate("D");reasons.push("عدم توافق طبي/وظيفي مع متطلبات المهمة الحالية وفق المدخلات");}
 if(d["medical-fit"]==="temporary"||d["medical-fit"]==="pending"||d.capacity==="unknown"){escalate("C");reasons.push("التقييم الطبي أو تحديد القدرة الوظيفية غير مكتمل أو يتطلب مراجعة");}
 if(d["medical-fit"]==="restricted"||d.capacity==="limited"||d.controls!=="effective"||["high","critical"].includes(d["residual-risk"])||["high"].some(k=>[d.chem,d.noise,d.heat,d.bio,d["physical-hazard"]].includes(k))||["high","very_high"].includes(d.physical)||["high","very_high"].includes(d.cognitive)||d.height==="yes"||d.confined==="yes"||d.isolated==="yes"||d.driving==="yes"||["high","critical"].includes(d["inherent-risk"])||d["care-access"]==="remote"||d["care-access"]==="limited"||d["care-access"]==="moderate"||d.evacuation==="partial"||d.evacuation==="weak"||d.evacuation==="unknown"||d.communications==="poor"||d.communications==="intermittent"||d.communications==="unknown"||d["site-support"]==="inadequate"||d["site-support"]==="limited"||d["site-support"]==="unknown"){escalate("B");reasons.push("توجد قيود أو تعرضات/متطلبات مرتفعة أو فجوات في التحكم أو دعم الموقع تستلزم معالجة موثقة");}
 if(d["residual-risk"]==="critical"||d["inherent-risk"]==="critical"&&d.controls!=="effective"||d.evacuation==="weak"&&d["care-access"]==="remote"){escalate("C");reasons.push("مؤشر خطر حرج أو ترتيبات طوارئ غير كافية: أوقف إسناد المهمة حتى المراجعة والتحكم");}
 if(d["medical-fit"]==="pending"||d.capacity==="unknown"||d.controls==="unknown"||d.evacuation==="unknown"||d.communications==="unknown"||d["site-support"]==="unknown")reasons.push("هناك بيانات أساسية غير متحققة؛ لا يمكن اعتبار غياب المعلومة دليلاً على السلامة");
 if(cls==="D")label="D – غير ملائم لهذه المهمة المحددة حالياً";
 if(cls==="C")label="C – غير ملائم مؤقتاً / يلزم إيقاف الإسناد والمراجعة";
 if(cls==="B")label="B – ملائم بشروط بعد تنفيذ القيود والتحقق منها";
 if(cls==="A"&&reasons.length===0)reasons.push("لم تظهر بوابة تصعيد ضمن البيانات المدخلة؛ يلزم اعتماد الطبيب والتحقق الميداني قبل القرار");
 return {code:cls,label,reasons,tone:cls==="C"||cls==="D"?"critical":cls==="B"?"conditional":""};
}
function preview(){
 const d=readForm();const r=analyze(d),box=$("decision-preview");box.hidden=false;box.className="decision "+r.tone;
 $("decision-label").textContent=r.label;$("decision-reasons").textContent=r.reasons.join(" • ");
 $("decision-caution").textContent="نتيجة فرز أولية قائمة على قواعد تشغيلية غير معايرة. لا توجد درجة رقمية كلية في هذه النسخة، ولا تتجاوز القواعد بوابات السلامة أو الحكم الطبي.";
 return {d,r};
}
async function session(u){
 user=u;const {data,error}=await client.from("app_users").select("role,email").eq("user_id",u.id).maybeSingle();
 if(error||!data){await client.auth.signOut();user=null;show("auth");msg("login-message","تعذر التحقق من صلاحية الحساب. راجع مسؤول النظام.","error");return;}
 role=data.role;show("work");document.dispatchEvent(new Event("pofri-session-ready"));$("top-user-info").textContent=(data.email||u.email)+"  |  "+(role==="admin"?"مسؤول النظام":"مدخل بيانات");
 $("admin-panel").hidden=role!=="admin";today();if(role==="admin")loadRecords();
}
$("login-form").addEventListener("submit",async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;const {data,error}=await client.auth.signInWithPassword({email:value("login-email"),password:value("login-password")});b.disabled=false;if(error){msg("login-message","تعذر تسجيل الدخول: "+error.message,"error");return;}await session(data.user);});
$("forgot-password").addEventListener("click",async()=>{const email=value("login-email").trim();if(!email){msg("login-message","أدخل البريد الإلكتروني أولاً.");return;}const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});msg("login-message",error?"تعذر إرسال الرابط: "+error.message:"إذا كان البريد مسجلاً فستصلك رسالة لاستعادة كلمة المرور.");});
$("recovery-form").addEventListener("submit",async e=>{e.preventDefault();if(value("new-password")!==value("confirm-password")){msg("recovery-message","كلمتا المرور غير متطابقتين.","error");return;}const {error}=await client.auth.updateUser({password:value("new-password")});if(error){msg("recovery-message","تعذر تحديث كلمة المرور: "+error.message,"error");return;}msg("recovery-message","تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن.","success");await client.auth.signOut();show("auth");});
$("logout").addEventListener("click",async()=>{await client.auth.signOut();user=null;role=null;show("auth")});
$("preview-button").addEventListener("click",()=>{if(!$("assessment-form").reportValidity())return;preview()});
$("assessment-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!user||!role){msg("assessment-message","انتهت الجلسة؛ سجل الدخول مجدداً.","error");return;}
 if(!$("assessment-form").reportValidity())return;
 const {d,r}=preview();if(d.age_years===null){msg("assessment-message","تحقق من تاريخ الميلاد؛ يجب أن يكون صحيحاً وألا يتجاوز تاريخ التقييم.","error");$("date-of-birth").focus();return;}if(!d.duration.trim()||!d.recommendations.trim()){msg("assessment-message","يجب إدخال مدة المهمة/الوردية والقيود والتوصيات النهائية قبل حفظ التقييم. لا تقبل الحقول الفارغة أو المسافات فقط.","error");$( !d.duration.trim() ? "duration" : "recommendations").focus();return;}const payload={employee_name:d["employee-name"],registration_number:d["registration-number"],job_title:d["job-title"],task_name:d["task-name"],assessment_date:d["assessment-date"],site:d.site,evaluator_name:d["evaluator-name"],duration:d.duration,job_task:{physical:d.physical,cognitive:d.cognitive,height:d.height,confined_space:d.confined,isolated_work:d.isolated,driving:d.driving},exposures:{items:d.jem_items,chemical:d.chem,noise_vibration:d.noise,heat_weather:d.heat,biological:d.bio,physical_mechanical:d["physical-hazard"],frequency:d.frequency},task_risk:{inherent:d["inherent-risk"],controls:d.controls,residual:d["residual-risk"],permit:d.permit,notes:d["tra-notes"]},medical:{fit:d["medical-fit"],capacity:d.capacity,restrictions:d["medical-restrictions"],followup:d["medical-followup"],worker_profile:{date_of_birth:d["date-of-birth"],age_years:d.age_years}},location_emergency:{care_access:d["care-access"],evacuation:d.evacuation,communications:d.communications,site_support:d["site-support"]},decision:{code:r.code,label:r.label,reasons:r.reasons,notes:d["decision-notes"],recommendations:d.recommendations},algorithm_version:"POFRI-0.1-DRAFT",created_by:user.id};
 const b=$("save-button");b.disabled=true;b.textContent="جارٍ الحفظ...";
 const {error}=await client.from("pofri_assessments").insert(payload);
 b.disabled=false;b.textContent="حفظ تقييم POFRI";
 if(error){msg("assessment-message","لم يُحفظ التقييم. قد يلزم تطبيق ملف SQL الخاص بجدول POFRI وسياسات الصلاحيات. التفاصيل: "+error.message,"error");return;}
 $("assessment-form").reset();window.POFRI_JEM?.clear?.();today();$("decision-preview").hidden=true;msg("assessment-message","تم حفظ تقييم POFRI بنجاح.","success");if(role==="admin")loadRecords();
});
async function loadRecords(){
 msg("admin-message","جارٍ تحميل تقييمات POFRI...");
 const {data,error}=await client.from("pofri_assessments").select("id,assessment_date,employee_name,registration_number,job_title,task_name,site,evaluator_name,decision,medical").order("assessment_date",{ascending:false}).limit(500);
 if(error){msg("admin-message","تعذر تحميل السجلات: "+error.message,"error");return;}
 records=data||[];$("records-body").innerHTML=records.length?records.map(x=>'<tr><td>'+esc(x.assessment_date)+'</td><td>'+esc(x.employee_name)+'</td><td>'+esc(x.medical?.worker_profile?.date_of_birth??'—')+'</td><td>'+esc(x.medical?.worker_profile?.age_years??'—')+'</td><td>'+esc(x.registration_number)+'</td><td>'+esc(x.job_title)+' / '+esc(x.task_name)+'</td><td>'+esc(x.site)+'</td><td>'+esc(x.decision?.label||"—")+'</td><td>'+esc(x.evaluator_name)+'</td><td>'+(user?.id==="47253008-c899-43c9-93b3-b91ac27e1d31"?'<button type="button" class="danger" data-delete-assessment="'+esc(x.id)+'">مسح</button>':"—")+'</td></tr>').join(""):'<tr><td colspan="9">لا توجد تقييمات POFRI بعد.</td></tr>';
 msg("admin-message","عدد تقييمات POFRI: "+records.length,"success");document.dispatchEvent(new Event("pofri-records-loaded"));
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("refresh-button").addEventListener("click",loadRecords);
$("export-button").addEventListener("click",()=>{const rows=[["تاريخ التقييم","العامل","تاريخ الميلاد","العمر","الرقم","الوظيفة","المهمة","الموقع","القرار","المقيم"],...records.map(x=>[x.assessment_date,x.employee_name,x.medical?.worker_profile?.date_of_birth,x.medical?.worker_profile?.age_years,x.registration_number,x.job_title,x.task_name,x.site,x.decision?.label,x.evaluator_name])];const csv="\uFEFF"+rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="POFRI-assessments.csv";a.click();URL.revokeObjectURL(a.href);});
client.auth.onAuthStateChange((_event,s)=>{if(s?.user&&!user)session(s.user)});
(async()=>{const {data}=await client.auth.getSession();const hash=new URLSearchParams(location.hash.replace(/^#/,""));if(hash.get("type")==="recovery"||location.search.includes("code=")){show("recovery");}else if(data.session?.user){await session(data.session.user);}else show("auth");})();
