// ==========================================
// MORS - Medico-Occupational Risk Scale
// ==========================================

// إعداد الاتصال بـ Supabase
const SUPABASE_URL = "https://vvagucmjmjoxnyumxtcq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_4jVHbUXOKy4TWG19LvQJJg_4f656sU2";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// ==========================================
// اكتشاف رابط استعادة كلمة المرور
// ==========================================

function isPasswordRecoveryUrl() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(
    window.location.hash.replace(/^#/, "")
  );

  return (
    query.has("code") ||
    query.get("type") === "recovery" ||
    hash.get("type") === "recovery"
  );
}

let recoveryMode = isPasswordRecoveryUrl();
let handlingSession = false;
let currentUser = null;
let currentRole = null;
let adminAssessments = [];

// ==========================================
// عناصر الواجهة
// ==========================================

const authPanel = document.getElementById("auth-panel");
const appPanel = document.getElementById("app-panel");
const recoveryPanel = document.getElementById("recovery-panel");

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");
const logoutButton = document.getElementById("logout-button");

const forgotPasswordButton =
  document.getElementById("forgot-password-button");

const recoveryForm = document.getElementById("recovery-form");
const recoveryButton = document.getElementById("recovery-button");
const recoveryMessage = document.getElementById("recovery-message");

const userInfo = document.getElementById("user-info");
const userRole = document.getElementById("user-role");

const adminPanel = document.getElementById("admin-panel");
const dataEntryPanel = document.getElementById("data-entry-panel");

const assessmentForm = document.getElementById("assessment-form");
const saveAssessmentButton =
  document.getElementById("save-assessment-button");

const assessmentMessage =
  document.getElementById("assessment-message");

const resultPreview = document.getElementById("result-preview");
const previewIndex = document.getElementById("preview-index");
const previewClassification =
  document.getElementById("preview-classification");
const previewRecommendation =
  document.getElementById("preview-recommendation");

const adminMessage = document.getElementById("admin-message");
const assessmentsTableBody =
  document.getElementById("assessments-table-body");

const assessmentSearch =
  document.getElementById("assessment-search");

const refreshAssessmentsButton =
  document.getElementById("refresh-assessments-button");

const exportExcelButton =
  document.getElementById("export-excel-button");

// ==========================================
// رسائل الواجهة
// ==========================================

function showLoginMessage(message, type = "") {
  loginMessage.textContent = message;
  loginMessage.className = "status" + (type ? " " + type : "");
}

function showRecoveryMessage(message, type = "") {
  recoveryMessage.textContent = message;
  recoveryMessage.className = "status" + (type ? " " + type : "");
}

function showAssessmentMessage(message, type = "") {
  assessmentMessage.textContent = message;
  assessmentMessage.className = "status" + (type ? " " + type : "");
  assessmentMessage.hidden = false;
}

function showAdminMessage(message, type = "") {
  adminMessage.textContent = message;
  adminMessage.className = "status" + (type ? " " + type : "");
}

function showLogin() {
  authPanel.hidden = false;
  appPanel.hidden = true;
  recoveryPanel.hidden = true;
}

function showWorkspace() {
  authPanel.hidden = true;
  appPanel.hidden = false;
  recoveryPanel.hidden = true;
}

function showRecovery() {
  authPanel.hidden = true;
  appPanel.hidden = true;
  recoveryPanel.hidden = false;
}

function hideRolePanels() {
  adminPanel.hidden = true;
  dataEntryPanel.hidden = true;
}

// ==========================================
// حساب المؤشر والتصنيف
// ==========================================

function calculateGlobalIndex(H, E, M) {
  return 25 * (
    0.3 * H +
    0.2 * E +
    0.5 * M
  );
}

function classifyIndex(index) {
  // التقريب إلى أقرب عدد صحيح للتصنيف فقط
  const roundedIndex = Math.round(index);

  if (roundedIndex <= 40) {
    return {
      classification: "مناسب للوظيفة حالياً",
      recommendation: "يمكن الاستمرار في العمل وفقاً للتقييم الطبي والمهني."
    };
  }

  if (roundedIndex <= 70) {
    return {
      classification: "مناسب مع بعض القيود",
      recommendation: "يُسمح بالعمل مع تطبيق القيود والتوصيات الوظيفية المحددة."
    };
  }

  if (roundedIndex <= 80) {
    return {
      classification: "غير مناسب مؤقتاً",
      recommendation: "يلزم إجراء تقييم متعمق ومراجعة الحالة قبل العودة للعمل."
    };
  }

  return {
    classification: "غير مناسب ومطلوب التعديل",
    recommendation: "تستلزم الحالة مراجعة المتطلبات أو ظروف العمل وإعادة التقييم قبل اتخاذ قرار العمل."
  };
}

function getCurrentScores() {
  const H = Number(
    document.getElementById("hazard-severity").value
  );

  const E = Number(
    document.getElementById("exposure-severity").value
  );

  const M = Number(
    document.getElementById("health-condition").value
  );

  if (
    ![1, 2, 3, 4].includes(H) ||
    ![1, 2, 3, 4].includes(E) ||
    ![1, 2, 3, 4].includes(M)
  ) {
    return null;
  }

  return { H, E, M };
}

function updateResultPreview() {
  const scores = getCurrentScores();

  if (!scores) {
    resultPreview.hidden = true;
    return;
  }

  const index = calculateGlobalIndex(
    scores.H,
    scores.E,
    scores.M
  );

  const result = classifyIndex(index);

  previewIndex.textContent = index.toFixed(2);
  previewClassification.textContent =
    result.classification;

  previewRecommendation.textContent =
    result.recommendation;

  resultPreview.hidden = false;
}

// متابعة تغيير الدرجات
document.querySelectorAll(".score-input").forEach((input) => {
  input.addEventListener("change", updateResultPreview);
});

// ==========================================
// التحقق من صلاحيات المستخدم
// ==========================================

async function handleSession(session) {
  if (recoveryMode) {
    showRecovery();
    return;
  }

  if (!session) {
    currentUser = null;
    currentRole = null;
    showLogin();
    return;
  }

  const user = session.user;
  currentUser = user;

  userInfo.textContent =
    "تم تسجيل الدخول باسم: " + user.email;

  const { data, error } = await supabaseClient
    .from("app_users")
    .select("role, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Role lookup error:", error.message);

    await supabaseClient.auth.signOut();

    currentUser = null;
    currentRole = null;

    showLogin();

    showLoginMessage(
      "تعذر التحقق من صلاحيات الحساب. يرجى مراجعة مسؤول النظام.",
      "error"
    );

    return;
  }

  if (!data) {
    await supabaseClient.auth.signOut();

    currentUser = null;
    currentRole = null;

    showLogin();

    showLoginMessage(
      "هذا الحساب غير مصرح له باستخدام MORS. يرجى التواصل مع المسؤول.",
      "error"
    );

    return;
  }

  if (
    data.role !== "admin" &&
    data.role !== "data_entry"
  ) {
    await supabaseClient.auth.signOut();

    currentUser = null;
    currentRole = null;

    showLogin();

    showLoginMessage(
      "صلاحية الحساب غير معروفة.",
      "error"
    );

    return;
  }

  currentRole = data.role;

  showWorkspace();
  hideRolePanels();

  // كلا الدورين يستطيعان إدخال التقييم
  dataEntryPanel.hidden = false;

  if (data.role === "admin") {
    userRole.textContent =
      "صلاحية المستخدم: مسؤول النظام";

    adminPanel.hidden = false;

    // تحميل السجلات للمسؤول فقط
    await loadAdminAssessments();

  } else {
    userRole.textContent =
      "صلاحية المستخدم: إدخال البيانات";

    adminPanel.hidden = true;
  }
}

// ==========================================
// تسجيل الدخول
// ==========================================

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email =
    document.getElementById("login-email").value.trim();

  const password =
    document.getElementById("login-password").value;

  loginButton.disabled = true;
  loginButton.textContent = "جارٍ تسجيل الدخول...";

  showLoginMessage("يرجى الانتظار...");

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  loginButton.disabled = false;
  loginButton.textContent = "تسجيل الدخول";

  if (error) {
    console.error("Login error:", error.message);

    showLoginMessage(
      "تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.",
      "error"
    );

    return;
  }

  await handleSession(data.session);
});

// ==========================================
// استعادة كلمة المرور
// ==========================================

forgotPasswordButton.addEventListener("click", async () => {
  const email =
    document.getElementById("login-email").value.trim();

  if (!email) {
    showLoginMessage(
      "أدخل بريدك الإلكتروني أولاً، ثم اضغط نسيت كلمة المرور.",
      "error"
    );

    return;
  }

  forgotPasswordButton.disabled = true;
  forgotPasswordButton.textContent =
    "جارٍ إرسال الرسالة...";

  const { error } =
    await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/"
    });

  forgotPasswordButton.disabled = false;
  forgotPasswordButton.textContent =
    "نسيت كلمة المرور؟";

  if (error) {
    console.error(
      "Password reset request error:",
      error.message
    );

    showLoginMessage(
      "تعذر إرسال رسالة الاستعادة. يرجى المحاولة لاحقاً.",
      "error"
    );

    return;
  }

  showLoginMessage(
    "إذا كان البريد مسجلاً، فستصلك رسالة استعادة كلمة المرور. افحص البريد الوارد والرسائل غير المرغوب فيها.",
    "success"
  );
});

// ==========================================
// حفظ كلمة المرور الجديدة
// ==========================================

recoveryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const password =
    document.getElementById("new-password").value;

  const confirmation =
    document.getElementById("confirm-password").value;

  if (password.length < 8) {
    showRecoveryMessage(
      "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
      "error"
    );

    return;
  }

  if (password !== confirmation) {
    showRecoveryMessage(
      "كلمتا المرور غير متطابقتين.",
      "error"
    );

    return;
  }

  recoveryButton.disabled = true;
  recoveryButton.textContent =
    "جارٍ حفظ كلمة المرور...";

  const { error } = await supabaseClient.auth.updateUser({
    password: password
  });

  recoveryButton.disabled = false;
  recoveryButton.textContent =
    "حفظ كلمة المرور الجديدة";

  if (error) {
    console.error(
      "Password update error:",
      error.message
    );

    showRecoveryMessage(
      "لم نتمكن من تغيير كلمة المرور. قد يكون رابط الاستعادة منتهي الصلاحية. اطلب رسالة جديدة وحاول مرة أخرى.",
      "error"
    );

    return;
  }

  recoveryMode = false;

  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );

  recoveryForm.reset();
  loginForm.reset();

  await supabaseClient.auth.signOut();

  currentUser = null;
  currentRole = null;

  showLogin();

  showLoginMessage(
    "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
    "success"
  );
});

// ==========================================
// تسجيل الخروج
// ==========================================

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;

  const { error } =
    await supabaseClient.auth.signOut();

  logoutButton.disabled = false;

  if (error) {
    console.error("Logout error:", error.message);

    alert(
      "تعذر تسجيل الخروج. يرجى المحاولة مرة أخرى."
    );

    return;
  }

  currentUser = null;
  currentRole = null;
  adminAssessments = [];

  loginForm.reset();

  showLogin();

  showLoginMessage(
    "تم تسجيل الخروج بنجاح.",
    "success"
  );
});

// ==========================================
// نموذج التقييم - تحديث النتيجة
// ==========================================

assessmentForm.addEventListener("change", () => {
  updateResultPreview();
});

// ==========================================
// حفظ التقييم في قاعدة البيانات
// ==========================================

assessmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser || !currentRole) {
    showAssessmentMessage(
      "انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.",
      "error"
    );

    return;
  }

  const scores = getCurrentScores();

  if (!scores) {
    showAssessmentMessage(
      "يرجى اختيار درجات H وE وM قبل الحفظ.",
      "error"
    );

    return;
  }

  const index = calculateGlobalIndex(
    scores.H,
    scores.E,
    scores.M
  );

  const result = classifyIndex(index);

  const restrictions =
    document.getElementById("restrictions").value.trim();

  const deepNotes =
    document.getElementById("deep-assessment-notes").value.trim();

  // التحقق من الملاحظات المطلوبة حسب التصنيف
  if (
    result.classification === "مناسب مع بعض القيود" &&
    !restrictions
  ) {
    showAssessmentMessage(
      "يرجى توضيح القيود والتوصيات الوظيفية لهذا التصنيف.",
      "error"
    );

    document.getElementById("restrictions").focus();

    return;
  }

  if (
    result.classification === "غير مناسب مؤقتاً" &&
    !deepNotes
  ) {
    showAssessmentMessage(
      "يرجى إدخال ملاحظات التقييم المتعمق للحالات غير المناسبة مؤقتاً.",
      "error"
    );

    document.getElementById("deep-assessment-notes").focus();

    return;
  }

  const payload = {
    assessment_date:
      document.getElementById("assessment-date").value,

    employee_name:
      document.getElementById("employee-name").value.trim(),

    registration_number:
      document.getElementById("registration-number").value.trim(),

    job_title:
      document.getElementById("job-title").value.trim(),

    site:
      document.getElementById("site").value,

    evaluator_name:
      document.getElementById("evaluator-name").value.trim(),

    hazard_severity: scores.H,
    exposure_severity: scores.E,
    health_condition: scores.M,

    restrictions: restrictions || null,
    deep_assessment_notes: deepNotes || null,

    // ربط التقييم بالمستخدم الحالي
    created_by: currentUser.id
  };

  saveAssessmentButton.disabled = true;
  saveAssessmentButton.textContent = "جارٍ حفظ التقييم...";

  showAssessmentMessage("يرجى الانتظار أثناء حفظ البيانات...");

  // لا نرسل global_index لأنه عمود محسوب تلقائياً في Supabase
  const { error } = await supabaseClient
    .from("occupational_assessments")
    .insert(payload);

  saveAssessmentButton.disabled = false;
  saveAssessmentButton.textContent = "حفظ التقييم";

  if (error) {
    console.error("Assessment insert error:", error);

    showAssessmentMessage(
      "تعذر حفظ التقييم. يرجى مراجعة البيانات وصلاحيات قاعدة البيانات، ثم المحاولة مرة أخرى.",
      "error"
    );

    return;
  }

  assessmentForm.reset();

  setTodayDate();

  resultPreview.hidden = true;

  showAssessmentMessage(
    "تم حفظ التقييم بنجاح. المؤشر المحسوب قبل الحفظ هو " +
      index.toFixed(2) +
      "، والتصنيف: " +
      result.classification,
    "success"
  );

  // تحديث سجلات المسؤول بعد الحفظ
  if (currentRole === "admin") {
    await loadAdminAssessments();
  }
});

// ==========================================
// ضبط تاريخ اليوم
// ==========================================

function setTodayDate() {
  const dateInput =
    document.getElementById("assessment-date");

  const now = new Date();

  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);

  dateInput.value = localDate;
}

// ==========================================
// حماية النصوص عند عرضها في الجدول
// ==========================================

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return entities[character];
    }
  );
}

// ==========================================
// تحميل سجلات التقييم للمسؤول فقط
// ==========================================

async function loadAdminAssessments() {
  if (currentRole !== "admin") {
    return;
  }

  refreshAssessmentsButton.disabled = true;
  refreshAssessmentsButton.textContent = "جارٍ التحديث...";

  showAdminMessage("جارٍ تحميل سجلات التقييم...");

  try {
    let allRows = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabaseClient
        .from("occupational_assessments")
        .select(`
          id,
          assessment_date,
          employee_name,
          registration_number,
          job_title,
          site,
          evaluator_name,
          hazard_severity,
          exposure_severity,
          health_condition,
          global_index,
          restrictions,
          deep_assessment_notes,
          created_at
        `)
        .order("assessment_date", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        throw error;
      }

      const rows = data || [];

      allRows = allRows.concat(rows);

      if (rows.length < pageSize) {
        break;
      }

      from += pageSize;
    }

    adminAssessments = allRows;

    renderAssessmentsTable();

    showAdminMessage(
      "تم تحميل " +
        adminAssessments.length +
        " تقييم.",
      "success"
    );

  } catch (error) {
    console.error("Loading assessments error:", error);

    showAdminMessage(
      "تعذر تحميل السجلات. تأكد من صلاحيات مسؤول النظام وسياسات قاعدة البيانات.",
      "error"
    );

  } finally {
    refreshAssessmentsButton.disabled = false;
    refreshAssessmentsButton.textContent = "تحديث السجلات";
  }
}

// ==========================================
// عرض التصنيف بناءً على المؤشر المحفوظ
// ==========================================

function getClassificationForStoredIndex(index) {
  if (index === null || index === undefined) {
    return "غير متاح";
  }

  return classifyIndex(Number(index)).classification;
}

// ==========================================
// عرض جدول التقييمات
// ==========================================

function renderAssessmentsTable() {
  const searchTerm =
    assessmentSearch.value.trim().toLowerCase();

  const filteredRows = adminAssessments.filter((row) => {
    const searchableText = [
      row.employee_name,
      row.registration_number,
      row.job_title,
      row.site,
      row.evaluator_name
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchTerm);
  });

  if (filteredRows.length === 0) {
    assessmentsTableBody.innerHTML = `
      <tr>
        <td colspan="11">لا توجد سجلات مطابقة للبحث.</td>
      </tr>
    `;

    return;
  }

  assessmentsTableBody.innerHTML = filteredRows.map((row) => {
    const classification =
      getClassificationForStoredIndex(row.global_index);

    return `
      <tr>
        <td>${escapeHtml(row.assessment_date)}</td>
        <td>${escapeHtml(row.employee_name)}</td>
        <td>${escapeHtml(row.registration_number)}</td>
        <td>${escapeHtml(row.job_title)}</td>
        <td>${escapeHtml(row.site)}</td>
        <td>${escapeHtml(row.hazard_severity)}</td>
        <td>${escapeHtml(row.exposure_severity)}</td>
        <td>${escapeHtml(row.health_condition)}</td>
        <td>${Number(row.global_index).toFixed(2)}</td>
        <td>${escapeHtml(classification)}</td>
        <td>${escapeHtml(row.evaluator_name)}</td>
      </tr>
    `;
  }).join("");
}

// ==========================================
// البحث في السجلات
// ==========================================

assessmentSearch.addEventListener("input", () => {
  renderAssessmentsTable();
});

// ==========================================
// تحديث السجلات
// ==========================================

refreshAssessmentsButton.addEventListener("click", async () => {
  await loadAdminAssessments();
});

// ==========================================
// تصدير Excel
// ==========================================

exportExcelButton.addEventListener("click", () => {
  if (currentRole !== "admin") {
    showAdminMessage(
      "هذه الوظيفة متاحة لمسؤول النظام فقط.",
      "error"
    );

    return;
  }

  if (typeof XLSX === "undefined") {
    showAdminMessage(
      "تعذر تحميل مكتبة Excel. تحقق من اتصال الإنترنت ثم أعد تحميل الصفحة.",
      "error"
    );

    return;
  }

  if (adminAssessments.length === 0) {
    showAdminMessage(
      "لا توجد سجلات متاحة للتصدير.",
      "error"
    );

    return;
  }

  const exportRows = adminAssessments.map((row) => ({
    "تاريخ التقييم": row.assessment_date,
    "اسم العامل": row.employee_name,
    "الرقم الوظيفي": row.registration_number,
    "المسمى الوظيفي": row.job_title,
    "موقع العمل": row.site,
    "اسم القائم بالتقييم": row.evaluator_name,
    "H - شدة مخاطر الوظيفة": row.hazard_severity,
    "E - شدة التعرض": row.exposure_severity,
    "M - الحالة الصحية": row.health_condition,
    "المؤشر العام": Number(row.global_index),
    "التصنيف": getClassificationForStoredIndex(row.global_index),
    "القيود والتوصيات": row.restrictions || "",
    "ملاحظات التقييم المتعمق": row.deep_assessment_notes || ""
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);

  worksheet["!cols"] = [
    { wch: 16 },
    { wch: 25 },
    { wch: 18 },
    { wch: 24 },
    { wch: 18 },
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 32 },
    { wch: 40 },
    { wch: 45 }
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "MORS Assessments"
  );

  const today = new Date().toISOString().slice(0, 10);

  XLSX.writeFile(
    workbook,
    "MORS_Assessments_" + today + ".xlsx"
  );

  showAdminMessage(
    "تم تجهيز ملف Excel للتنزيل.",
    "success"
  );
});

// ==========================================
// متابعة أحداث المصادقة
// ==========================================

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    recoveryMode = true;

    showRecovery();

    showRecoveryMessage(
      "أدخل كلمة المرور الجديدة لحسابك."
    );

    return;
  }

  if (event === "SIGNED_OUT") {
    currentUser = null;
    currentRole = null;
    adminAssessments = [];

    if (!recoveryMode) {
      showLogin();
    }

    return;
  }

  if (
    event === "SIGNED_IN" ||
    event === "TOKEN_REFRESHED"
  ) {
    if (recoveryMode || handlingSession) {
      return;
    }

    Promise.resolve().then(async () => {
      handlingSession = true;

      try {
        await handleSession(session);
      } finally {
        handlingSession = false;
      }
    });
  }
});

// ==========================================
// بدء التطبيق
// ==========================================

async function initializeApp() {
  setTodayDate();

  if (recoveryMode) {
    showRecovery();

    showRecoveryMessage(
      "جارٍ التحقق من رابط الاستعادة..."
    );

    const { data, error } =
      await supabaseClient.auth.getSession();

    if (error || !data.session) {
      console.error(
        "Recovery session error:",
        error?.message
      );

      showRecoveryMessage(
        "تعذر التحقق من رابط الاستعادة. قد يكون الرابط منتهي الصلاحية. اطلب رسالة استعادة جديدة.",
        "error"
      );

      return;
    }

    showRecovery();

    showRecoveryMessage(
      "أدخل كلمة المرور الجديدة لحسابك."
    );

    return;
  }

  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error) {
    console.error("Session error:", error.message);

    showLogin();

    showLoginMessage(
      "تعذر التحقق من جلسة الدخول.",
      "error"
    );

    return;
  }

  await handleSession(data.session);
}

initializeApp();
