/* Bridge POFRI's six-axis intake into one MOFASA assessment record.
 * Medical fields remain physician-owned; this module never copies MCM data from HSE intake.
 */
(() => {
  const mapDecision = value => ({
    fit:"compatible",
    fit_with_restrictions:"restricted",
    temporarily_unfit:"temporary",
    unfit:"incompatible",
    specialist_review:"pending"
  })[value] || "";
  function toParent(d={}) {
    return {
      worker_name:String(d["employee-name"]||"").trim(),
      registration_number:String(d["registration-number"]||"").trim(),
      job_title:String(d["job-title"]||"").trim(),
      task_name:String(d["task-name"]||"").trim(),
      assessment_date:d["assessment-date"]||"",
      site:d.site||"",
      shift_duration:String(d.duration||"").trim()||null
    };
  }
  function toHseSection(d={}) {
    const task=String(d["task-name"]||"").trim();
    const hazards=(Array.isArray(d.jem_items)?d.jem_items:[]).map(x=>({
      category:x.category||"",
      name:x.name||"",
      severity:Number(x.severity)||null,
      severity_label:x.severity_label||"",
      severity_description:x.severity_description||"",
      frequency:x.frequency||"",
      frequency_scale:null,
      duration_scale:null,
      probability_scale:null,
      control_effectiveness:null,
      controls:"",
      residual:"not_assessed",
      notes:x.notes||"",
      basis:x.basis||"",
      source:"POFRI-six-axis-intake"
    }));
    const safetyCritical=[];
    if(d.height==="yes")safetyCritical.push("العمل على ارتفاعات");
    if(d.confined==="yes")safetyCritical.push("دخول الأماكن المغلقة");
    if(d.driving==="yes")safetyCritical.push("القيادة");
    return {
      tasks:{items:task?[task]:[],safety_critical:safetyCritical,notes:""},
      job_task:{
        physical:d.physical||"",
        cognitive:d.cognitive||"",
        height:d.height||"",
        confined_space:d.confined||"",
        isolated_work:d.isolated||"",
        driving:d.driving||"",
        worker_profile:{
          date_of_birth:d["date-of-birth"]||"",
          age_years:Number.isFinite(Number(d.age_years))?Number(d.age_years):null
        }
      },
      hazards:{items:hazards,notes:d["jem-notes"]||""},
      tra:{
        inherent:d["inherent-risk"]||"",
        controls:d.controls||"",
        residual:d["residual-risk"]||"",
        permit:d.permit||"",
        notes:d["tra-notes"]||""
      },
      demands:{
        selected:[],
        other:"",
        notes:["المجهود البدني: "+(d.physical||"غير محدد"),"المتطلبات الذهنية: "+(d.cognitive||"غير محددة")].join("؛ ")
      },
      emergency:{
        site_category:d["site-category"]||"",
        care_access:d["care-access"]||"",
        evacuation:d.evacuation||"",
        communications:d.communications||"",
        medical_support:d["site-support"]||"",
        referral_facility:"",
        evacuation_time:"",
        transport:"",
        notes:"",
        last_drill_date:""
      },
      intake:{
        source:"POFRI-six-axis-intake",
        algorithm_version:"POFRI-WEIGHTED-DRAFT-1.1",
        evaluator_name:String(d["evaluator-name"]||"").trim(),
        shift_duration:String(d.duration||"").trim(),
        received_at:new Date().toISOString()
      },
      preliminary_analysis:{
        status:"awaiting_physician_review",
        score:null,
        note:"يكتمل المؤشر التجريبي بعد استكمال الطبيب لمصفوفة الحالات الطبية والقدرة الوظيفية والرأي الطبي."
      },
      notes:""
    };
  }
  function capacitySummary(items) {
    if(!Array.isArray(items)||!items.length)return "unknown";
    const statuses=items.map(x=>x.status);
    if(statuses.includes("not_assessed"))return "unknown";
    if(statuses.includes("not_met"))return "insufficient";
    if(statuses.includes("restricted"))return "limited";
    return statuses.every(x=>x==="met")?"adequate":"unknown";
  }
  function scoreInput(hse={},medical={},decision="") {
    const job=hse.job_task||{},tra=hse.tra||{},em=hse.emergency||{};
    const conditions=medical.diseases?.items||[];
    const reviewed=medical.diseases?.reviewed===true||conditions.length>0;
    if(!reviewed)return {complete:false,reason:"لم يكتمل توثيق مراجعة MCM بواسطة الطبيب."};
    const fit=({compatible:"compatible",restricted:"restricted",temporary:"temporary",incompatible:"incompatible",pending:"pending"})[medical.medical_fit]||mapDecision(decision);
    const capacity=capacitySummary(medical.capacity?.items);
    if(!fit||capacity==="unknown")return {complete:false,reason:"يلزم تسجيل التوافق الطبي الأولي واستكمال تقييم القدرة الوظيفية قبل حساب المؤشر."};
    return {complete:true,data:{
      physical:job.physical,
      cognitive:job.cognitive,
      jem_items:hse.hazards?.items||[],
      controls:tra.controls||"unknown",
      "residual-risk":tra.residual||"unknown",
      "medical-fit":fit,
      capacity,
      mcm_items:conditions.map(x=>({level:Number(x.level)||1})),
      "care-access":em.care_access,
      evacuation:em.evacuation,
      communications:em.communications,
      "site-support":em.medical_support
    }};
  }
  function calculate(hse,medical,decision) {
    const prepared=scoreInput(hse,medical,decision);
    if(!prepared.complete)return {total:null,band:"غير مكتمل",status:"incomplete",reason:prepared.reason};
    const engine=globalThis.POFRI_EXPERIMENTAL_SCORE;
    if(!engine?.calculate)return {total:null,band:"غير متاح",status:"engine_unavailable",reason:"محرك المؤشر التجريبي غير محمل."};
    const result=engine.calculate(prepared.data);
    return {...result,status:result.total===null?"incomplete":"calculated",reason:result.total===null?(result.gaps||[]).join("؛ "):""};
  }
  globalThis.MOFASA_POFriBridge={toParent,toHseSection,scoreInput,calculate,capacitySummary};
})();
