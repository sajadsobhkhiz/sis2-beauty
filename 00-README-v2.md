# 🌟 SiS2 Beauty v2 — راهنمای کامل

## فایل‌های جدید

| فایل | کپی به |
|------|--------|
| `06-main.jsx` | `src/main.jsx` (جایگزین) |
| `03-shared.jsx` | `src/shared.jsx` (جایگزین) |
| `02-supabase.js` | `src/supabase.js` (جایگزین) |
| `07-LoginPage.jsx` | `src/LoginPage.jsx` (جدید) |
| `08-StaffDashboard.jsx` | `src/StaffDashboard.jsx` (جدید) |
| `04-BookingApp.jsx` | `src/BookingApp.jsx` (جایگزین) |
| `05-AdminApp.jsx` | `src/AdminApp.jsx` (جایگزین) |
| `index.html` | پوشه اصلی پروژه (جایگزین) |
| `manifest.json` | پوشه `public/` |
| `sw.js` | پوشه `public/` |
| `favicon.svg` | پوشه `public/` |

---

## ① دیتابیس — اجرا کن

توی Supabase → SQL Editor → فایل `01-schema.sql` رو اجرا کن.

---

## ② لاگین ادمین — ساخت اکانت

### ۱. یوزر بساز
Supabase → **Authentication** → **Users** → **Add user**
- Email: `your@email.com`
- Password: انتخاب کن

### ۲. توی جدول staff لینک کن
Supabase → **Table Editor** → `staff` → **Insert row**:
```
slug:     admin
name:     (اسمت)
email:    your@email.com
is_admin: true
user_id:  (از authentication → users، UUID رو کپی کن)
color:    #d4af37
status:   Active
```

### ۳. تست کن
برو `localhost:5173/login` → لاگین کن → باید به `/admin` بره.

---

## ③ لاگین استایلیست

برای هر استایلیست:

### ۱. یوزر بساز
Authentication → Users → Add user:
- Email: `stylist@email.com`
- Password: یه پسورد برای استایلیست

### ۲. توی staff لینک کن
جدول `staff` → ردیف استایلیست رو باز کن:
- `user_id` = UUID اون یوزر رو بذار
- `is_admin` = false (مگه اینکه ادمین هم باشه)

### ۳. استایلیست وارد میشه
`sis2.beauty/login` → لاگین → میره `/staff` → فقط نوبت‌های خودش رو می‌بینه

---

## ④ آپلود تصویر استایلیست

### Storage Bucket بساز
Supabase → **Storage** → **New bucket**:
- Name: `avatars`
- Public: ✅

بعد از SQL اجرا کردن، bucket و policyها خودکار ساخته میشن.

---

## ⑤ ایمیل سرور (Resend)

```bash
mkdir sis2-email
cd sis2-email
npm init -y
npm install express resend node-cron cors
```

فایل `email-server.js` رو اینجا کپی کن. بعد:

```bash
RESEND_API_KEY=re_xxxx node email-server.js
```

### توی AdminApp ربط بده
وقتی نوبت Confirm میشه، این کد اجرا میشه:
```js
await callEmailServer("booking-confirmed", {
  clientName, clientEmail, staffName, staffEmail,
  service, date, time, price
});
```

---

## ⑥ PWA — نصب روی گوشی

بعد از deploy روی Vercel:
- کروم روی گوشی → منوی سه‌نقطه → **Add to Home Screen**
- یا Safari iOS → Share → **Add to Home Screen**

آیکون لوگو SiS2 روی صفحه گوشی نصب میشه.

---

## ⑦ لوگو برای PWA

دو فایل لازم داری توی `public/`:
- `logo192.png` — 192×192 پیکسل
- `logo512.png` — 512×512 پیکسل

لوگوی PNG که داری رو با [squoosh.app](https://squoosh.app) resize کن.

---

## ⑧ مسیرها

| URL | توضیح |
|-----|-------|
| `sis2.beauty/` | صفحه اصلی + لیست استایلیست‌ها |
| `sis2.beauty/sara` | رزرو با Sara |
| `sis2.beauty/login` | لاگین ادمین/استایلیست |
| `sis2.beauty/admin` | داشبورد ادمین |
| `sis2.beauty/staff` | داشبورد استایلیست |

---

## سوال داری؟

هر مرحله‌ای که گیر کردی بگو!
