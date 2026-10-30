
const SUPABASE_URL = "https://vvagucmjmjoxnyumxtcq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_4jVHbUXOKy4TWG19LvQJJg_4f656sU2";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const authPanel = document.getElementById("auth-panel");
const appPanel = document.getElementById("app-panel");
const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");
const logoutButton = document.getElementById("logout-button");

const userInfo = document.getElementById("user-info");
const userRole = document.getElementById("user-role");

const adminPanel = document.getElementById("admin-panel");
const dataEntryPanel = document.getElementById("data-entry-panel");

function showLoginMessage(message) {
  loginMessage.textContent = message;
}

function showLogin() {
  authPanel.hidden = false;
  appPanel.hidden = true;
}

function showWorkspace() {
  authPanel.hidden = true;
  appPanel.hidden = false;
}

function hideRolePanels() {
  adminPanel.hidden = true;
  dataEntryPanel.hidden = true;
}

async function handleSession(session) {
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

// استعادة جلسة الدخول عند فتح الموقع
async function initializeApp() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Session error:", error.message);
    showLogin();
    showLoginMessage("تعذر التحقق من جلسة الدخول.");
    return;
  }

  await handleSession(data.session);
}

// متابعة تغييرات جلسة الدخول
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    showLogin();
    return;
  }

  if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
    Promise.resolve().then(() => handleSession(session));
  }
});

initializeApp();
