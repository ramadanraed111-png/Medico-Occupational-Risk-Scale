# POFRI – Petroleum Occupational Fitness & Risk Index

واجهة عربية لتقييم اللياقة الطبية والمهنية **على مستوى المهمة والموقع والظروف** في قطاع البترول والغاز.

## حالة المشروع
الفرع `main` يحتوي واجهة POFRI الجديدة بعد إحلالها محل واجهات MORS القديمة. توجد تحسينات إضافية لقواعد القرار قيد المراجعة في فرع منفصل قبل دمجها أو نشرها. لا تُحذف ولا تُعدّل جداول MORS أو سجلاتها أو حسابات المستخدمين القديمة في Supabase؛ يظل الوصول إليها خارج واجهة POFRI.

## المحاور الستة
1. Job & Task Library – مكتبة الوظائف والمهام والمتطلبات.
2. Job Exposure Matrix (JEM) – مصفوفة التعرضات.
3. Task Risk Assessment (TRA) – الخطر قبل التحكم، فعالية التحكم، والخطر المتبقي.
4. Medical Conditions Matrix (MCM) – التوافق الطبي والقدرة الوظيفية والقيود.
5. Location & Emergency Matrix – الرعاية الطبية والإخلاء والاتصالات ودعم الموقع.
6. Fitness Decision Engine – بوابات القرار وأسبابه وقيوده وتوصياته.

## ربط Supabase والملف الموحد
- يستخدم التطبيق مشروع Supabase الحالي وSupabase Auth الحاليين، مع جدول `app_users` وصلاحيات Super Admin / HSE Admin / Physician.
- تُنشأ التقييمات الجديدة كملف MOFASA واحد في `mofasa_assessments`، ويحفظ إدخال المحاور المهنية في `mofasa_hse_sections`، بينما تبقى MCM والفحوصات والقدرة والرأي الطبي في `mofasa_medical_sections`.
- لا تُنشأ سجلات تقييم جديدة في `pofri_assessments`؛ تبقى السجلات القديمة كما هي ولا تُحذف أو تُنقل تلقائياً.
- يتطلب إنشاء الملف الأولي RPC مقيداً بمسؤول السلامة، وتظل بيانات MCM والفحص السريري ضمن صلاحيات الطبيب.
- لا تُحذف حسابات Auth أو ملفات العاملين أو سجلات التقييم السابقة عند دمج الواجهتين.

## القرار
تصنيفات A/B/C/D في هذه النسخة ناتجة عن قواعد فرز تشغيلية أولية وليست معياراً طبياً معتمداً. أُضيف مؤشر رقمي موزون تجريبي مؤقت لغرض العرض على اللجنة المختصة فقط؛ ويظل منفصلاً عن التصنيف ولا يجوز استخدامه لتجاوز بوابة طبية أو خطر حرج. لا تُستخدم النتيجة لاتخاذ قرار لياقة أو توظيف فعلي قبل التحقق، والمعايرة، والاعتماد الطبي/المهني، واختبارات الأمن والخصوصية.

## التشغيل
يُنشر الموقع الثابت من GitHub Pages عند ضبط النشر على الفرع المطلوب. لا تغيّر فرع Pages الرئيسي حتى اكتمال اختبار نسخة POFRI وقبولها.


## Provisional weighted index for committee demonstration
A separate, explicitly provisional numeric model is included in `pofri-score.js`. It calculates R/M/F/E using the draft weights 30%/30%/25%/15%, displays the result beside (not instead of) the existing A/B/C/D rule classification, and stores it inside the existing `decision` JSON object. The score does not override medical or safety gates. Its mappings, weights, and display bands are not validated. See [POFRI weighted model draft](docs/POFRI-weighted-model-draft.md). This is for expert-committee demonstration and discussion only, not real fitness decisions.



## IOFI – Integrated Occupational Fitness Intelligence (separate development track)

IOFI is being developed as a job-, task-, worksite- and date-specific framework with four independent profiles (OERI, IHVI, JTCI and WORM), a non-compensatory Critical Safety Gate and an occupational-physician review layer. It is not the current production assessment workflow and must not be used as an autonomous fitness decision system.

The working library is documented in:
- docs/IOFI-job-library-families-01-08.md
- docs/IOFI-job-library-logistics-emergency.md
- docs/IOFI-job-library-engineering-marine-construction-warehouse.md

The static bilingual preview is iofi-preview.html. The isolated foundation engine only checks evidence completeness and non-compensatory gates; it does not calculate weighted scores, medical penalties, exposure limits or final fitness decisions.

All 15 family documents are working drafts. Site applicability, measurements, controls, demands, emergency duties and Egyptian legal requirements require verification by the relevant operations, HSE/industrial-hygiene, occupational-medicine and legal reviewers. Missing data remain Unknown / Pending verification.

This development track does not alter the live application entry point, Supabase schema/data, Auth users, roles, RLS policies or existing MORS/POFRI/MOFASA assessment records.
