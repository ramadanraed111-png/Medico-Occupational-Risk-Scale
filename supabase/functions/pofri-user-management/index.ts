import { createClient } from "npm:@supabase/supabase-js@2";

const URL = Deno.env.get("SUPABASE_URL") ?? "";
const publishable = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}").default
  ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const secret = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default
  ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SUPER_ID = "47253008-c899-43c9-93b3-b91ac27e1d31";
const SUPER_EMAIL = "raeddwik@gmail.com";
const APP_URL = "https://ramadanraed111-png.github.io/Medico-Occupational-Risk-Scale/";
const ALLOWED = new Set(["https://ramadanraed111-png.github.io"]);
const verifier = createClient(URL, publishable, {auth:{persistSession:false,autoRefreshToken:false}});
const admin = createClient(URL, secret, {auth:{persistSession:false,autoRefreshToken:false}});
function cors(origin:string|null){const h:Record<string,string>={"Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"};if(origin&&ALLOWED.has(origin))h["Access-Control-Allow-Origin"]=origin;return h;}
function reply(body:Record<string,unknown>,status=200,origin:string|null=null){return new Response(JSON.stringify(body),{status,headers:{...cors(origin),"Content-Type":"application/json; charset=utf-8"}});}
function banned(u:{banned_until?:string|null}){return !!u.banned_until&&Date.parse(u.banned_until)>Date.now();}
async function authorize(req:Request){
 const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
 if(!token)return {error:"يرجى تسجيل الدخول أولاً.",status:401};
 const {data,error}=await verifier.auth.getUser(token);
 if(error||!data.user)return {error:"جلسة الدخول غير صالحة.",status:401};
 if(data.user.id!==SUPER_ID||String(data.user.email||"").toLowerCase()!==SUPER_EMAIL)return {error:"هذه الوظيفة متاحة للمدير الأعلى فقط.",status:403};
 const {data:profile,error:pe}=await admin.from("app_users").select("role,email").eq("user_id",SUPER_ID).maybeSingle();
 if(pe||!profile||profile.role!=="admin"||String(profile.email).toLowerCase()!==SUPER_EMAIL)return {error:"تعذر تأكيد صلاحية المدير الأعلى.",status:403};
 return {user:data.user};
}
async function activeAdminCount(){
 const {data:profiles,error}=await admin.from("app_users").select("user_id").eq("role","admin");
 if(error)throw error;
 const ids=(profiles||[]).map(x=>x.user_id);
 let active=0;
 for(let i=0;i<ids.length;i+=100){const {data}=await admin.auth.admin.listUsers({page:1,perPage:1000});const users=data?.users||[];active+=users.filter(u=>ids.includes(u.id)&&!!u.email_confirmed_at&&!banned(u)).length;break;}
 return active;
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");
 if(origin&&!ALLOWED.has(origin))return reply({error:"Origin not allowed."},403,null);
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors(origin)});
 if(req.method!=="POST")return reply({error:"يُسمح بطلبات POST فقط."},405,origin);
 try{
  const auth=await authorize(req);if("error" in auth)return reply({error:auth.error},auth.status,origin);
  const body=await req.json().catch(()=>null);if(!body||typeof body.action!=="string")return reply({error:"بيانات الطلب غير صالحة."},400,origin);
  const action=body.action;
  if(action==="list_users"){
   const [{data:profiles,error:pe},{data:authData,error:ae}]=await Promise.all([admin.from("app_users").select("user_id,email,role").order("email"),admin.auth.admin.listUsers({page:1,perPage:1000})]);
   if(pe||ae)throw pe||ae;
   const byId=new Map((authData.users||[]).map(u=>[u.id,u]));
   const users=(profiles||[]).map(p=>{const u=byId.get(p.user_id);return{id:p.user_id,email:p.email,role:p.role,status:!u?"unknown":banned(u)?"disabled":!u.email_confirmed_at?"pending":"active",last_sign_in_at:u?.last_sign_in_at||null};});
   return reply({ok:true,users},200,origin);
  }
  if(action==="invite_user"){
   const email=String(body.email||"").trim().toLowerCase(),role=body.role;
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return reply({error:"أدخل بريداً إلكترونياً صحيحاً."},400,origin);
   if(!["admin","data_entry"].includes(role))return reply({error:"نوع المستخدم غير صحيح."},400,origin);
   const {data:existing}=await admin.from("app_users").select("user_id").eq("email",email).maybeSingle();
   if(existing)return reply({error:"هذا البريد مسجل بالفعل في POFRI."},409,origin);
   const {data:all}=await admin.auth.admin.listUsers({page:1,perPage:1000});
   if((all?.users||[]).some(u=>String(u.email||"").toLowerCase()===email))return reply({error:"هذا البريد موجود في نظام الدخول بالفعل."},409,origin);
   const {data:inv,error:ie}=await admin.auth.admin.inviteUserByEmail(email,{redirectTo:APP_URL});
   if(ie||!inv.user)return reply({error:"تعذر إرسال الدعوة. تحقق من إعدادات البريد."},400,origin);
   const {error:pe}=await admin.from("app_users").insert({user_id:inv.user.id,email,role});
   if(pe){await admin.auth.admin.deleteUser(inv.user.id);throw pe;}
   return reply({ok:true,message:"تم إرسال الدعوة بنجاح."},201,origin);
  }
  const id=String(body.user_id||"");
  if(!/^[0-9a-f-]{36}$/i.test(id))return reply({error:"معرف المستخدم غير صحيح."},400,origin);
  if(id===SUPER_ID)return reply({error:"حساب المدير الأعلى محمي ولا يمكن تعديله أو تعطيله أو حذفه."},403,origin);
  const {data:target,error:te}=await admin.from("app_users").select("user_id,email,role").eq("user_id",id).maybeSingle();
  if(te)throw te;if(!target)return reply({error:"المستخدم غير موجود."},404,origin);
  if(action==="update_role"){
   const role=body.role;if(!["admin","data_entry"].includes(role))return reply({error:"نوع الصلاحية غير صحيح."},400,origin);
   if(target.role==="admin"&&role!=="admin"&&await activeAdminCount()<=1)return reply({error:"لا يمكن تخفيض صلاحية آخر مسؤول نشط."},409,origin);
   const {error}=await admin.from("app_users").update({role}).eq("user_id",id);if(error)throw error;
   return reply({ok:true,message:"تم تحديث الصلاحية."},200,origin);
  }
  if(action==="set_active"){
   if(typeof body.active!=="boolean")return reply({error:"حالة الحساب غير صحيحة."},400,origin);
   if(!body.active&&target.role==="admin"&&await activeAdminCount()<=1)return reply({error:"لا يمكن تعطيل آخر مسؤول نشط."},409,origin);
   const {error}=await admin.auth.admin.updateUserById(id,{ban_duration:body.active?"none":"876000h"});if(error)throw error;
   return reply({ok:true,message:body.active?"تمت إعادة تفعيل الحساب.":"تم تعطيل الحساب."},200,origin);
  }
  if(action==="delete_user"){
   if(target.role==="admin"&&await activeAdminCount()<=1)return reply({error:"لا يمكن حذف آخر مسؤول نشط."},409,origin);
   const {error}=await admin.auth.admin.deleteUser(id);if(error)throw error;
   return reply({ok:true,message:"تم حذف حساب المستخدم نهائياً. سجلات التقييم المرتبطة به لم تُحذف."},200,origin);
  }
  return reply({error:"العملية المطلوبة غير معروفة."},400,origin);
 }catch(e){console.error("POFRI admin function error",e);return reply({error:e instanceof Error?e.message:"حدث خطأ غير متوقع."},500,origin);}
});
