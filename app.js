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

const USER_MANAGEMENT_FUNCTION = "mors-user-management";

// ==========================================
// اكتشاف رابط استعادة كلمة المرور أو دعوة مستخدم
// ==========================================

function getAuthFlowType() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(
    window.location.hash.replace(/^#/, "")
  );

  return query.get("type") || hash.get("type") || "";
}

function isPasswordRecoveryUrl() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(
    window.location.hash.replace(/^#/, "")
  );
  const flowType = getAuthFlowType();

  return (
    query.has("code") ||
    flowType === "recovery" ||
    flowType === "invite"
  );
}

let recoveryMode = isPasswordRecoveryUrl();
let inviteMode = getAuthFlowType() === "invite";
let handlingSession = false;
let currentUser = null;
let currentRole = null;
let adminAssessments = [];
let managedUsers = [];

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
const recoveryEyebrow = document.getElementById("recovery-eyebrow");
const recoveryHeading = document.getElementById("recovery-heading");
const recoveryDescription = document.getElementById("recovery-description");

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

// عناصر إدارة المستخدمين
const userManagementPanel =
  document.getElementById("user-management-panel");
const inviteUserForm = document.getElementById("invite-user-form");
const inviteUserEmail = document.getElementById("invite-user-email");
const inviteUserRole = document.getElementById("invite-user-role");
const inviteUserButton = document.getElementById("invite-user-button");
const refreshUsersButton = document.getElementById("refresh-users-button");
const userManagementMessage =
  document.getElementById("user-management-message");
const usersTableBody = document.getElementById("users-table-body");

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

function showUserManagementMessage(message, type = "") {
  userManagementMessage.textContent = message;
  userManagementMessage.className = "status" + (type ? " " + type : "");
  userManagementMessage.hidden = false;
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

  if (inviteMode) {
    recoveryEyebrow.textContent = "تفعيل حساب مستخدم جديد";
    recoveryHeading.textContent = "إنشاء كلمة المرور الخاصة بك";
    recoveryDescription.textContent =
      "مرحباً بك في MORS. أنشئ كلمة مرور لحسابك ثم أكدها لإكمال تفعيل الحساب.";
    recoveryButton.textContent = "تفعيل الحساب وحفظ كلمة المرور";
  } else {
    recoveryEyebrow.textContent = "استعادة كلمة المرور";
    recoveryHeading.textContent = "تعيين كلمة مرور جديدة";
    recoveryDescription.textContent =
      "أدخل كلمة المرور الجديدة ثم أكدها.";
    recoveryButton.textContent = "حفظ كلمة المرور الجديدة";
  }
}

function hideRolePanels() {
  adminPanel.hidden = true;
  dataEntryPanel.hidden = true;
  userManagementPanel.hidden = true;
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
// استدعاء وظيفة إدارة المستخدمين الآمنة
// ==========================================

async function invokeUserManagement(payload) {
  const { data, error } = await supabaseClient.functions.invoke(
    USER_MANAGEMENT_FUNCTION,
    { body: payload }
  );

  if (error) {
    let message = error.message || "تعذر الاتصال بوظيفة إدارة المستخدمين.";

    // تحصيل رسالة الخطأ التي أعادتها الوظيفة، إن توفرت.
    if (error.context && typeof error.context.json === "function") {
      try {
        const responseBody = await error.context.json();
        if (responseBody && responseBody.error) {
          message = responseBody.error;
        }
      } catch (_parseError) {
        // نستخدم رسالة الخطأ الأصلية عند تعذر قراءة الاستجابة.
      }
    }

    throw new Error(message);
  }

  if (data && data.error) {
    throw new Error(data.error);
  }

  return data;
}

function translateUserRole(role) {
  if (role === "admin") return "مسؤول النظام";
  if (role === "data_entry") return "إدخال البيانات";
  return "غير معروف";
}

function translateUserStatus(status) {
  if (status === "active") return "نشط";
  if (status === "pending") return "بانتظار التفعيل";
  if (status === "disabled") return "معطّل";
  return "غير معروف";
}

function formatLastSignIn(value) {
  if (!value) return "لم يسجل الدخول بعد";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "غير متاح";

  return date.toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderManagedUsersTable() {
  if (!usersTableBody) return;

  if (!managedUsers.length) {
    usersTableBody.innerHTML = `
      <tr><td colspan="6">لا توجد حسابات مسجلة في قائمة MORS.</td></tr>
    `;
    return;
  }

  usersTableBody.innerHTML = managedUsers.map((user) => {
    const isCurrentUser = currentUser && user.id === currentUser.id;
    const statusClass = ["active", "pending", "disabled"].includes(user.status)
      ? user.status
      : "unknown";
    const isActive = user.status === "active";
    const isUnknown = user.status === "unknown";

    const roleControl = isCurrentUser
      ? `<span class="user-self-label">لا يمكن تعديل صلاحيتك من هنا</span>`
      : `
        <div class="user-role-cell">
          <select class="managed-user-role" data-user-id="${escapeHtml(user.id)}" aria-label="الصلاحية الجديدة">
            <option value="data_entry" ${user.role === "data_entry" ? "selected" : ""}>إدخال البيانات</option>
            <option value="admin" ${user.role === "admin" ? "selected" : ""}>مسؤول النظام</option>
          </select>
          <button type="button" class="user-action-button" data-action="update-role" data-user-id="${escapeHtml(user.id)}">حفظ</button>
        </div>
      `;

    let accountControl = "—";
    if (isCurrentUser) {
      accountControl = `<span class="user-self-label">الحساب الحالي</span>`;
    } else if (!isUnknown) {
      accountControl = isActive
        ? `<button type="button" class="user-action-button danger-button" data-action="disable-user" data-user-id="${escapeHtml(user.id)}">تعطيل الحساب</button>`
        : `<button type="button" class="user-action-button activate-button" data-action="activate-user" data-user-id="${escapeHtml(user.id)}">إعادة التفعيل</button>`;
    }

    return `
      <tr>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(translateUserRole(user.role))}</td>
        <td><span class="user-status ${statusClass}">${escapeHtml(translateUserStatus(user.status))}</span></td>
        <td>${escapeHtml(formatLastSignIn(user.last_sign_in_at))}</td>
        <td>${roleControl}</td>
        <td>${accountControl}</td>
      </tr>
    `;
  }).join("");
}

async function loadManagedUsers(options = {}) {
  const silent = options.silent === true;

  if (currentRole !== "admin") return;

  if (!silent) {
    refreshUsersButton.disabled = true;
    refreshUsersButton.textContent = "جارٍ التحديث...";
    showUserManagementMessage("جارٍ تحميل قائمة المستخدمين...");
  }

  try {
    const result = await invokeUserManagement({ action: "list_users" });
    managedUsers = Array.isArray(result.users) ? result.users : [];
    renderManagedUsersTable();

    if (!silent) {
      showUserManagementMessage(
        "تم تحميل " + managedUsers.length + " حساب.",
        "success"
      );
    }
  } catch (error) {
    console.error("Loading users error:", error);
    if (!silent) {
      showUserManagementMessage(
        "تعذر تحميل المستخدمين: " + error.message,
        "error"
      );
    }
  } finally {
    if (!silent) {
      refreshUsersButton.disabled = false;
      refreshUsersButton.textContent = "تحديث قائمة المستخدمين";
    }
  }
}

// إرسال دعوة لمستخدم جديد
inviteUserForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (currentRole !== "admin") {
    showUserManagementMessage(
      "هذه العملية متاحة لمسؤول النظام فقط.",
      "error"
    );
    return;
  }

  const email = inviteUserEmail.value.trim().toLowerCase();
  const role = inviteUserRole.value;

  if (!email) {
    showUserManagementMessage("أدخل البريد الإلكتروني للمستخدم.", "error");
    inviteUserEmail.focus();
    return;
  }

  inviteUserButton.disabled = true;
  inviteUserButton.textContent = "جارٍ إرسال الدعوة...";

  try {
    await invokeUserManagement({
      action: "invite_user",
      email,
      role
    });

    inviteUserForm.reset();
    inviteUserRole.value = "data_entry";

    await loadManagedUsers({ silent: true });

    showUserManagementMessage(
      "تم إرسال دعوة إلى " + email + ". سيحتاج المستخدم إلى فتح رسالة البريد وتعيين كلمة مرور قبل تسجيل الدخول.",
      "success"
    );
  } catch (error) {
    console.error("Invite user error:", error);
    showUserManagementMessage(
      "تعذر إرسال الدعوة: " + error.message,
      "error"
    );
  } finally {
    inviteUserButton.disabled = false;
    inviteUserButton.textContent = "إرسال دعوة المستخدم";
  }
});

// تحديث قائمة المستخدمين
refreshUsersButton.addEventListener("click", async () => {
  await loadManagedUsers();
});

// التعامل مع أزرار تغيير الصلاحية والتفعيل/التعطيل داخل الجدول
usersTableBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (currentRole !== "admin") {
    showUserManagementMessage(
      "هذه العملية متاحة لمسؤول النظام فقط.",
      "error"
    );
    return;
  }

  const userId = button.dataset.userId;
  const action = button.dataset.action;
  const targetUser = managedUsers.find((user) => user.id === userId);

  if (!targetUser) {
    showUserManagementMessage("لم يتم العثور على الحساب المطلوب.", "error");
    return;
  }

  if (action === "update-role") {
    const select = usersTableBody.querySelector(
      `select.managed-user-role[data-user-id="${CSS.escape(userId)}"]`
    );
    const newRole = select ? select.value : "";

    if (!newRole || !["admin", "data_entry"].includes(newRole)) {
      showUserManagementMessage("اختر صلاحية صحيحة.", "error");
      return;
    }

    if (newRole === targetUser.role) {
      showUserManagementMessage("هذه هي الصلاحية الحالية بالفعل.");
      return;
    }

    const confirmation = window.confirm(
      "هل تريد تغيير صلاحية " + targetUser.email + " إلى " +
      translateUserRole(newRole) + "؟"
    );
    if (!confirmation) return;

    button.disabled = true;
    button.textContent = "جارٍ الحفظ...";

    try {
      await invokeUserManagement({
        action: "update_role",
        user_id: userId,
        role: newRole
      });

      await loadManagedUsers({ silent: true });
      showUserManagementMessage(
        "تم تحديث صلاحية " + targetUser.email + " بنجاح.",
        "success"
      );
    } catch (error) {
      console.error("Update role error:", error);
      showUserManagementMessage(
        "تعذر تغيير الصلاحية: " + error.message,
        "error"
      );
    }

    return;
  }

  if (action === "disable-user" || action === "activate-user") {
    const active = action === "activate-user";
    const confirmationText = active
      ? "هل تريد إعادة تفعيل حساب " + targetUser.email + "؟"
      : "هل تريد تعطيل حساب " + targetUser.email + "؟ لن يتم حذف الحساب أو سجلات تقييماته.";

    if (!window.confirm(confirmationText)) return;

    button.disabled = true;
    button.textContent = active ? "جارٍ التفعيل..." : "جارٍ التعطيل...";

    try {
      await invokeUserManagement({
        action: "set_active",
        user_id: userId,
        active
      });

      await loadManagedUsers({ silent: true });
      showUserManagementMessage(
        active
          ? "تمت إعادة تفعيل حساب " + targetUser.email + "."
          : "تم تعطيل حساب " + targetUser.email + " دون حذف بياناته أو تقييماته.",
        "success"
      );
    } catch (error) {
      console.error("Change account status error:", error);
      showUserManagementMessage(
        "تعذر تغيير حالة الحساب: " + error.message,
        "error"
      );
    }
  }
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
    managedUsers = [];
    adminAssessments = [];
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
    userManagementPanel.hidden = false;

    // تحميل السجلات وقائمة المستخدمين للمسؤول فقط
    await loadAdminAssessments();
    await loadManagedUsers();

  } else {
    userRole.textContent =
      "صلاحية المستخدم: إدخال البيانات";

    adminPanel.hidden = true;
    userManagementPanel.hidden = true;
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
// حفظ كلمة المرور الجديدة أو تفعيل الدعوة
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
    inviteMode ? "جارٍ تفعيل الحساب..." : "جارٍ حفظ كلمة المرور...";

  const { error } = await supabaseClient.auth.updateUser({
    password: password
  });

  recoveryButton.disabled = false;
  recoveryButton.textContent = inviteMode
    ? "تفعيل الحساب وحفظ كلمة المرور"
    : "حفظ كلمة المرور الجديدة";

  if (error) {
    console.error(
      "Password update error:",
      error.message
    );

    showRecoveryMessage(
      "لم نتمكن من تغيير كلمة المرور. قد يكون رابط الدعوة أو الاستعادة منتهي الصلاحية. اطلب رابطاً جديداً وحاول مرة أخرى.",
      "error"
    );

    return;
  }

  const completedInvitation = inviteMode;

  recoveryMode = false;
  inviteMode = false;

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
    completedInvitation
      ? "تم تفعيل حسابك وتعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول."
      : "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
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
  managedUsers = [];

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
    inviteMode = false;

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
    managedUsers = [];

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
      inviteMode
        ? "جارٍ التحقق من رابط الدعوة..."
        : "جارٍ التحقق من رابط الاستعادة..."
    );

    const { data, error } =
      await supabaseClient.auth.getSession();

    if (error || !data.session) {
      console.error(
        "Recovery / invitation session error:",
        error?.message
      );

      showRecoveryMessage(
        "تعذر التحقق من الرابط. قد يكون رابط الدعوة أو الاستعادة منتهي الصلاحية أو سبق استخدامه. اطلب رابطاً جديداً من مسؤول النظام.",
        "error"
      );

      return;
    }

    showRecovery();

    showRecoveryMessage(
      inviteMode
        ? "تم التحقق من الدعوة. أنشئ كلمة المرور لإكمال تفعيل حسابك."
        : "تم التحقق من الرابط. أدخل كلمة المرور الجديدة لحسابك."
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
