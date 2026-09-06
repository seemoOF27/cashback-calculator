# حاسبة الكاش باك

مقارنة بطاقات الكاش باك السعودية حسب الصرف الشهري الفعلي.

## التشغيل محليًا

```bash
npm install
npm run dev
```

## النشر على GitHub Pages

1. أنشئ مستودعًا على GitHub وارفع هذه الملفات على فرع `main`.
2. من إعدادات المستودع: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
3. أي `push` على `main` ينشر الموقع تلقائيًا عبر `.github/workflows/deploy.yml`.

الرابط سيكون: `https://<username>.github.io/<repo>/`

### النطاق المخصص

لو ربطت نطاقًا خاصًا، أضف ملف `public/CNAME` يحتوي على النطاق فقط،
وأضف متغيّر البيئة `CUSTOM_DOMAIN=1` في خطوة البناء حتى يصبح `base` هو `/`.

## إضافة بطاقة جديدة

كل شيء في `src/CashbackCalculator.jsx`:

- `CATEGORIES` — الفئات المعروضة في لوحة الإدخال.
- `CARDS` — البطاقات. انسخ أي كائن وعدّل `rates` و `cap` و `totalCap` و `fee`.
