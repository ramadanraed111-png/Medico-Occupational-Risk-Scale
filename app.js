
const SUPABASE_URL = "https://vvagucmjmjoxnyumxtcq.supabase.co";

// ضع هنا Publishable Key الخاص بمشروعك
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_4jVHbUXOKy4TWG19LvQJJg_4f656sU2";

const statusElement = document.getElementById("app-status");

function showStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

if (
  !window.supabase ||
  SUPABASE_PUBLISHABLE_KEY === "PASTE_YOUR_PUBLISHABLE_KEY_HERE"
) {
  showStatus("النظام في مرحلة الإعداد. لم يتم استكمال إعداد الاتصال بقاعدة البيانات.");
} else {
  try {
    const supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    window.morsSupabase = supabaseClient;

    supabaseClient.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          showStatus("تعذر التحقق من الاتصال. يرجى مراجعة إعدادات النظام.");
          console.error("Supabase session error:", error.message);
          return;
        }

        showStatus("تم تجهيز الاتصال بقاعدة البيانات بنجاح.");
      })
      .catch((error) => {
        showStatus("تعذر الاتصال بقاعدة البيانات.");
        console.error(error);
      });

  } catch (error) {
    showStatus("حدث خطأ أثناء إعداد الاتصال.");
    console.error(error);
  }
}
