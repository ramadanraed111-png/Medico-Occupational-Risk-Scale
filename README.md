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

## ربط Supabase
- يستخدم التطبيق مشروع Supabase الحالي وSupabase Auth الحاليين.
- يعيد استخدام جدول `app_users` لقراءة الدور (admin / data_entry).
- يستخدم جدولاً جديداً مستقلاً باسم `pofri_assessments`.
- لا ينفذ أي حذف أو ترحيل أو تحديث لجداول `occupational_assessments` أو `app_users` أو بيانات Auth.
- قبل تشغيل الحفظ، راجع ونفذ يدوياً وبموافقة مسؤول قاعدة البيانات ملف `supabase/pofri-schema.sql` في SQL Editor.

## القرار
تصنيفات A/B/C/D في هذه النسخة ناتجة عن قواعد فرز تشغيلية أولية وليست معياراً طبياً معتمداً. أُضيف مؤشر رقمي موزون تجريبي مؤقت لغرض العرض على اللجنة المختصة فقط؛ ويظل منفصلاً عن التصنيف ولا يجوز استخدامه لتجاوز بوابة طبية أو خطر حرج. لا تُستخدم النتيجة لاتخاذ قرار لياقة أو توظيف فعلي قبل التحقق، والمعايرة، والاعتماد الطبي/المهني، واختبارات الأمن والخصوصية.

## التشغيل
يُنشر الموقع الثابت من GitHub Pages عند ضبط النشر على الفرع المطلوب. لا تغيّر فرع Pages الرئيسي حتى اكتمال اختبار نسخة POFRI وقبولها.


## Provisional weighted index for committee demonstration
A separate, explicitly provisional numeric model is included in `pofri-score.js`. It calculates R/M/F/E using the draft weights 30%/30%/25%/15%, displays the result beside (not instead of) the existing A/B/C/D rule classification, and stores it inside the existing `decision` JSON object. The score does not override medical or safety gates. Its mappings, weights, and display bands are not validated. See [POFRI weighted model draft](docs/POFRI-weighted-model-draft.md). This is for expert-committee demonstration and discussion only, not real fitness decisions.


## IOFI development track (not yet production)
The approved IOFI foundation is being developed on the separate branch `feature/iofi-foundation` and tracked in [Draft PR #45](https://github.com/ramadanraed111-png/Medico-Occupational-Risk-Scale/pull/45). It adds an evidence-completeness engine, four independent index structures and a non-compensatory critical safety gate. It does not change the production interface or database and is not yet connected to live assessments. See the IOFI architecture, proposed logical data model, validation plan and repository audit under `docs/IOFI-*.md`. Do not use the IOFI foundation for operational fitness decisions.


## Individual FTW Examination Report

The MOFASA assessment record supports an individual report aligned with the supplied **Individual FTW Examination Report** template. From an employee assessment, authorized System Admin and Medical Admin users can:

- Generate a print-ready A4 report and use the browser print dialog to save it as PDF.
- Export a Microsoft Word-compatible `.doc` report.
- View only populated assessment fields and sections; empty clinical and HSE entries are omitted.
- Include employee/job details, HSE output, job demands, safety-critical and emergency duties, hazardous exposures and controls, site evaluation, medical history, medication review, clinical examination, functional capacity, investigations, FTW decision, review date and physician/HSE sign-off fields.

The report follows existing section-level access controls. HSE-only users do not receive the combined medical report. Medical data remains restricted to authorized medical roles and system administration. The report documents entered information and the physician's recorded decision; it does not turn the experimental CRI into a fitness decision.

**Word export note:** the download is a Word-compatible `.doc` document (HTML-based), not a native OOXML `.docx` file. PDF output is produced through the browser print dialog.
