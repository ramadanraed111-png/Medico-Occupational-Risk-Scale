
const SUPABASE_URL = "https://vvagucmjmjoxnyumxtcq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_4jVHbUXOKy4TWG19LvQJJg_4f656sU2";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// اكتشاف رابط استعادة كلمة المرور قبل عرض أي لوحة
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

// عناصر الواجهة
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

// رسائل الواجهة
function showLoginMessage(message) {
  loginMessage.textContent = message;
}

function showRecoveryMessage(message) {
  recoveryMessage.textContent = message;
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

// التحقق من صلاحيات المستخدم
async function handleSession(session) {
  if (recoveryMode) {
    showRecovery();
    return;
  }

  if (!session) {
    showLogin();
    return;
  }

  const user = session.user;

  userInfo.textContent = "تم تسجيل الدخول باسم: " + user.email;

  const { data, error } = await supabaseClient
    .from("app_users")
    .select("role, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Role lookup error:", error.message);
    await supabaseClient.auth.signOut();
    showLogin();
    showLoginMessage(
      "تعذر التحقق من صلاحيات الحساب. يرجى مراجعة مسؤول النظام."
    );
    return;
  }

  if (!data) {
    await supabaseClient.auth.signOut();
    showLogin();
    showLoginMessage(
      "هذا الحساب غير مصرح له باستخدام MORS. يرجى التواصل مع المسؤول."
    );
    return;
  }

  showWorkspace();
  hideRolePanels();

  if (data.role === "admin") {
    userRole.textContent = "صلاحية المستخدم: مسؤول النظام";
    adminPanel.hidden = false;
  } else if (data.role === "data_entry") {
    userRole.textContent = "صلاحية المستخدم: إدخال البيانات";
    dataEntryPanel.hidden = false;
  } else {
    await supabaseClient.auth.signOut();
    showLogin();
    showLoginMessage("صلاحية الحساب غير معروفة.");
  }
}

// تسجيل الدخول
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  loginButton.disabled = true;
  loginButton.textContent = "جارٍ تسجيل الدخول...";
  showLoginMessage("يرجى الانتظار...");

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  loginButton.disabled = false;
  loginButton.textContent = "تسجيل الدخول";

  if (error) {
    console.error("Login error:", error.message);
    showLoginMessage(
      "تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور."
    );
    return;
  }

  await handleSession(data.session);
});

// طلب رسالة استعادة كلمة المرور
forgotPasswordButton.addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();

  if (!email) {
    showLoginMessage(
      "أدخل بريدك الإلكتروني أولاً، ثم اضغط نسيت كلمة المرور."
    );
    return;
  }

  forgotPasswordButton.disabled = true;
  forgotPasswordButton.textContent = "جارٍ إرسال الرسالة...";

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/"
  });

  forgotPasswordButton.disabled = false;
  forgotPasswordButton.textContent = "نسيت كلمة المرور؟";

  if (error) {
    console.error("Password reset request error:", error.message);
    showLoginMessage(
      "تعذر إرسال رسالة الاستعادة. يرجى المحاولة لاحقاً."
    );
    return;
  }

  showLoginMessage(
    "إذا كان البريد مسجلاً، فستصلك رسالة استعادة كلمة المرور. افحص البريد الوارد والرسائل غير المرغوب فيها."
  );
});

// حفظ كلمة المرور الجديدة
recoveryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const password = document.getElementById("new-password").value;
  const confirmation =
    document.getElementById("confirm-password").value;

  if (password.length < 8) {
    showRecoveryMessage(
      "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل."
    );
    return;
  }

  if (password !== confirmation) {
    showRecoveryMessage("كلمتا المرور غير متطابقتين.");
    return;
  }

  recoveryButton.disabled = true;
  recoveryButton.textContent = "جارٍ حفظ كلمة المرور...";

  const { error } = await supabaseClient.auth.updateUser({
    password: password
  });

  recoveryButton.disabled = false;
  recoveryButton.textContent = "حفظ كلمة المرور الجديدة";

  if (error) {
    console.error("Password update error:", error.message);
    showRecoveryMessage(
      "لم نتمكن من تغيير كلمة المرور. قد يكون رابط الاستعادة منتهي الصلاحية. اطلب رسالة جديدة وحاول مرة أخرى."
    );
    return;
  }

  recoveryMode = false;

  // إزالة بيانات رابط الاستعادة من شريط العنوان
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );

  recoveryForm.reset();
  loginForm.reset();

  await supabaseClient.auth.signOut();

  showLogin();
  showLoginMessage(
    "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة."
  );
});

// تسجيل الخروج
logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;

  const { error } = await supabaseClient.auth.signOut();

  logoutButton.disabled = false;

  if (error) {
    console.error("Logout error:", error.message);
    alert("تعذر تسجيل الخروج. يرجى المحاولة مرة أخرى.");
    return;
  }

  loginForm.reset();
  showLogin();
  showLoginMessage("تم تسجيل الخروج بنجاح.");
});

// متابعة أحداث المصادقة
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    recoveryMode = true;
    showRecovery();
    showRecoveryMessage("أدخل كلمة المرور الجديدة لحسابك.");
    return;
  }

  if (event === "SIGNED_OUT") {
    if (!recoveryMode) {
      showLogin();
    }
    return;
  }

  if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
    if (recoveryMode || handlingSession) return;

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

// بدء التطبيق
async function initializeApp() {
  // إذا كان الرابط خاصاً باستعادة كلمة المرور،
  // نعرض شاشة الاستعادة ولا نعرض مساحة العمل.
  if (recoveryMode) {
    showRecovery();
    showRecoveryMessage("جارٍ التحقق من رابط الاستعادة...");

    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
      console.error("Recovery session error:", error?.message);

      showRecoveryMessage(
        "تعذر التحقق من رابط الاستعادة. قد يكون الرابط منتهي الصلاحية. اطلب رسالة استعادة جديدة."
      );
      return;
    }

    showRecovery();
    showRecoveryMessage("أدخل كلمة المرور الجديدة لحسابك.");
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Session error:", error.message);
    showLogin();
    showLoginMessage("تعذر التحقق من جلسة الدخول.");
    return;
  }

  await handleSession(data.session);
}

initializeApp();
