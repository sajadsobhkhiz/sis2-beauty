# 🌟 SiS2 Beauty — راهنمای کامل راه‌اندازی (Windows)

از صفر تا اپ زنده روی **sis2.beauty**.

---

## 🎨 برندینگ

اپ با هویت بصری SiS2 Beauty طراحی شده:
- **رنگ اصلی:** طلایی (#d4af37)
- **پس‌زمینه:** مشکی (دارک) / کرم (لایت)
- **فونت:** Cormorant Garamond (سرامیک، لاکچری) + DM Sans
- **اسم:** همه جا **SiS2 Beauty**

---

## 📋 چی داری

7 تا فایل آماده:

| فایل | چیه |
|------|------|
| `01-schema.sql` | ساختار دیتابیس |
| `02-supabase.js` | اتصال به Supabase |
| `03-shared.jsx` | کامپوننت‌ها + برند SiS2 |
| `04-BookingApp.jsx` | سایت رزرو مشتری |
| `05-AdminApp.jsx` | داشبورد ادمین |
| `06-main.jsx` | روتر اصلی |
| `00-README.md` | همین فایل |

---

## 🎯 خلاصه کار

سه چیز رایگان نیاز داری:
1. **Supabase** — دیتابیس
2. **Vercel** — هاست
3. **GitHub** — برای آپلود کد به Vercel

دامنه `sis2.beauty` که داری → به Vercel وصل می‌کنی.

---

## 📦 مرحله 1 — نصب نرم‌افزارهای پایه (10 دقیقه)

### 1.1 — Node.js

1. برو [nodejs.org](https://nodejs.org)
2. نسخه **LTS** (دکمه سبز سمت چپ) رو دانلود کن
3. نصب کن (همه گزینه‌ها پیشفرض، فقط Next بزن)
4. PowerShell باز کن:
   ```powershell
   node --version
   ```
   باید چیزی شبیه `v20.x.x` نشون بده

### 1.2 — Git

1. برو [git-scm.com/download/win](https://git-scm.com/download/win)
2. دانلود و نصب (همه گزینه‌ها پیشفرض)
3. تست:
   ```powershell
   git --version
   ```

### 1.3 — VS Code

1. برو [code.visualstudio.com](https://code.visualstudio.com) و دانلود کن

---

## 🗄️ مرحله 2 — Supabase (5 دقیقه)

1. برو [supabase.com](https://supabase.com) → **Start your project**
2. با GitHub لاگین کن
3. **New Project**:
   - Name: `sis2-beauty`
   - Database Password: یه پسورد قوی (یادداشت کن!)
   - Region: نزدیک‌ترین (Frankfurt برای ایران/اروپا)
4. ~2 دقیقه صبر کن

### اجرای اسکریپت دیتابیس:

5. منوی چپ → **SQL Editor** → **+ New query**
6. فایل `01-schema.sql` رو با Notepad باز کن، همه‌ش رو کپی کن
7. توی Editor پیست کن، دکمه **Run** پایین سمت راست
8. باید پیام `Success` بیاد

### گرفتن کلیدها:

9. منوی چپ → ⚙️ **Project Settings** → **API**
10. دو چیز رو یادداشت کن:
    - **Project URL** (مثلا `https://abcd1234.supabase.co`)
    - **anon public** key (یه رشته طولانی که با `eyJ` شروع میشه)

---

## 💻 مرحله 3 — ساخت پروژه روی کامپیوتر (10 دقیقه)

### 3.1 — یه پوشه برای پروژه بساز

مثلا توی `C:\Users\YourName\Documents\` یه پوشه به اسم `sis2-beauty` بساز.

### 3.2 — PowerShell توی همون پوشه باز کن

داخل پوشه `sis2-beauty`، **شیفت + کلیک راست** بزن → **Open PowerShell window here**

### 3.3 — پروژه React بساز

```powershell
npm create vite@latest . -- --template react
```

اگه پرسید "Current directory not empty"، **Yes** بزن. بعد:

```powershell
npm install
npm install @supabase/supabase-js react-router-dom
```

### 3.4 — فایل‌ها رو بذار سر جاشون

پوشه `src/` رو باز کن داخل پروژه. **همه فایل‌های قبلی توش رو پاک کن** (مثل `App.jsx`، `App.css`).

حالا فایل‌های زیر رو از پوشه دانلودت کپی کن داخل `src/` و **اسم‌هاشون رو عوض کن**:

| فایل دانلودی | اسم جدید توی `src/` |
|---|---|
| `02-supabase.js` | `supabase.js` |
| `03-shared.jsx` | `shared.jsx` |
| `04-BookingApp.jsx` | `BookingApp.jsx` |
| `05-AdminApp.jsx` | `AdminApp.jsx` |
| `06-main.jsx` | `main.jsx` |

فایل `index.css` رو باز کن، محتواش رو پاک کن، فقط اینو بذار:
```css
body { margin: 0; background: #0a0a0d; }
```

### 3.5 — کلیدهای Supabase رو وارد کن

`src/supabase.js` رو با VS Code باز کن. خط 6-7:

```js
const SUPABASE_URL      = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
```

دو چیزی که از Supabase کپی کرده بودی، اینجا بذار:

```js
const SUPABASE_URL      = "https://abcd1234.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbG...";
```

ذخیره کن (Ctrl+S).

### 3.6 — تست محلی

```powershell
npm run dev
```

یه آدرس میده مثل `http://localhost:5173` — تو مرورگر باز کن.

✅ تست کن:
- `http://localhost:5173/` → صفحه ورود SiS2 Beauty با لیست استایلیست‌ها
- `http://localhost:5173/zara` → رزرو با Zara
- `http://localhost:5173/admin` → داشبورد ادمین

برای متوقف کردن: `Ctrl+C` توی PowerShell.

---

## 🌐 مرحله 4 — آپلود به GitHub (5 دقیقه)

### 4.1 — repo جدید بساز

1. برو [github.com/new](https://github.com/new)
2. Repository name: `sis2-beauty`
3. **Private** انتخاب کن (مهم! کلیدها توشن)
4. **Create repository**

### 4.2 — کد رو آپلود کن

توی PowerShell:

```powershell
git init
git add .
git commit -m "Initial SiS2 Beauty app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/sis2-beauty.git
git push -u origin main
```

(اگه اول بار push می‌زنی، GitHub ممکنه ازت لاگین بخواد — یه Personal Access Token بساز و به جای پسورد بزن)

---

## 🚀 مرحله 5 — Deploy روی Vercel (5 دقیقه)

1. برو [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. **Add New Project** → repo `sis2-beauty` → **Import**
3. همه چیز پیشفرض → **Deploy**
4. ~2 دقیقه صبر کن

✅ یه URL میده مثل `sis2-beauty.vercel.app`. باز کن، باید زنده باشه.

---

## 🌍 مرحله 6 — وصل کردن دامنه `sis2.beauty` (10 دقیقه)

### توی Vercel:

1. توی پروژه‌ت → **Settings** → **Domains**
2. `sis2.beauty` رو وارد کن → **Add**
3. Vercel یه سری DNS بهت میده، مثل:
   - Type: `A`, Name: `@`, Value: `76.76.21.21`
   - Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`

### توی پنل دامنه (هر جا که خریدی):

1. وارد بخش DNS Management شو
2. اون رکوردها رو اضافه کن
3. صبر کن (5 دقیقه تا چند ساعت)

✅ بعدش `sis2.beauty` کار می‌کنه!

---

## 🔒 مرحله 7 — امنیت (مهم! قبل پخش به مشتری)

برو Supabase → SQL Editor → اینو اجرا کن:

```sql
alter table staff enable row level security;
create policy "p1" on staff for select using (status = 'Active' and accepts_bookings = true);

alter table services enable row level security;
create policy "p2" on services for select using (active = true);

alter table staff_services enable row level security;
create policy "p3" on staff_services for select using (true);

alter table staff_availability enable row level security;
create policy "p4" on staff_availability for select using (true);

alter table staff_time_off enable row level security;
create policy "p5" on staff_time_off for select using (true);

alter table appointments enable row level security;
create policy "p6" on appointments for select using (true);
create policy "p7" on appointments for insert with check (status = 'Pending');

alter table clients enable row level security;
alter table transactions enable row level security;
create policy "p8" on clients for all using (auth.role() = 'authenticated');
create policy "p9" on transactions for all using (auth.role() = 'authenticated');
```

برای لاگین ادمین، یه نسخه بعدی می‌سازم. الان فقط زود راه بنداز و تست کن.

---

## 📞 الان چی داری

- ✅ `sis2.beauty` → صفحه ورود لاکچری SiS2 Beauty
- ✅ `sis2.beauty/zara` → رزرو با Zara (هر استایلیست لینک شخصی)
- ✅ `sis2.beauty/admin` → داشبورد تو
- ✅ مدیریت کامل سرویس‌ها (با دسته‌بندی)
- ✅ ساعات کاری هر استایلیست
- ✅ مرخصی و تعطیلی
- ✅ چک تداخل خودکار
- ✅ تم طلایی/مشکی هماهنگ با لوگو

---

## 🆘 مشکلی پیش اومد؟

| خطا | راه‌حل |
|---|---|
| `npm: command not found` | Node.js نصب نیست — مرحله 1.1 |
| صفحه سفید | F12 → Console. معمولا کلید Supabase اشتباهه |
| `Stylist not found` | slug توی URL غلطه — توی Supabase → Table Editor → staff چک کن |
| Vercel error | `npm install` بزن، دوباره push کن |

---

## ✨ مرحله بعد

وقتی کار کرد، بهم بگو کدوم بعدی رو می‌خوای:
- 🔐 لاگین ادمین (محافظت داشبورد با ایمیل/پسورد)
- 📧 ایمیل تایید + ریمایندر 24 ساعت قبل
- 👤 داشبورد جدا برای هر استایلیست
- 📸 آپلود عکس پروفایل برای استایلیست‌ها
- 🎨 صفحه شخصی استایلیست با عکس بک‌گراند خودش
- 💳 پرداخت آنلاین (Stripe)
- 📱 حالت PWA (نصب روی صفحه گوشی)

موفق باشی! ✨
