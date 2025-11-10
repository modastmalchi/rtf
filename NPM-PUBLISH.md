# دستورالعمل انتشار در NPM

## مراحل انتشار پکیج در npm:

### 1️⃣ ساخت حساب npm (اگر ندارید)
```bash
# ثبت نام در https://www.npmjs.com/signup
```

### 2️⃣ لاگین به npm در ترمینال
```bash
npm login
# Username: modastmalchi
# Password: [رمز عبور npm]
# Email: [ایمیل شما]
```

### 3️⃣ بررسی package.json
```bash
# بررسی کنید که همه چیز صحیح است:
# - name: @modastmalchi/rtf-converter
# - version: 1.0.0
# - author: Mostafa Dastmalchi
# - main: lib/rtf-converter.js
# - types: lib/rtf-converter.ts
```

### 4️⃣ Build و Test
```bash
npm run build
npm test
```

### 5️⃣ بررسی فایل‌هایی که publish می‌شوند
```bash
npm pack --dry-run
# این لیست فایل‌هایی که در پکیج قرار می‌گیرند را نشان می‌دهد
```

### 6️⃣ Publish به npm
```bash
# برای اولین بار (public package):
npm publish --access public

# برای آپدیت‌های بعدی:
npm publish
```

### 7️⃣ نصب و استفاده
```bash
# دیگران می‌توانند نصب کنند:
npm install @modastmalchi/rtf-converter

# یا با yarn:
yarn add @modastmalchi/rtf-converter
```

### 8️⃣ استفاده در پروژه
```typescript
// Node.js / TypeScript
import { rtfToHtml, htmlToRtf } from '@modastmalchi/rtf-converter';

// CommonJS
const { rtfToHtml, htmlToRtf } = require('@modastmalchi/rtf-converter');

// استفاده
const html = rtfToHtml(rtfString);
```

## 🔄 آپدیت نسخه بعدی

```bash
# تغییر نسخه در package.json
npm version patch   # 1.0.0 → 1.0.1 (bug fixes)
npm version minor   # 1.0.0 → 1.1.0 (new features)
npm version major   # 1.0.0 → 2.0.0 (breaking changes)

# بعد publish کنید
npm publish
```

## ⚠️ نکات مهم

1. **نام پکیج**: `@modastmalchi/rtf-converter` یک scoped package است
   - اگر می‌خواهید بدون @ باشد: نام را به `rtf-converter-persian` تغییر دهید

2. **Access Public**: اولین publish باید `--access public` داشته باشد

3. **Version**: هر publish باید version جدید داشته باشد

4. **.npmignore**: فایل‌های test و development در npm قرار نمی‌گیرند

5. **Git Tag**: `npm version` خودکار git tag می‌سازد

## 📊 آمار پکیج

بعد از publish در این لینک‌ها موجود می‌شود:
- npm: https://www.npmjs.com/package/@modastmalchi/rtf-converter
- unpkg CDN: https://unpkg.com/@modastmalchi/rtf-converter
- GitHub: https://github.com/modastmalchi/rtf

## 🎯 چک‌لیست نهایی قبل از Publish

- [ ] npm login انجام شده
- [ ] package.json به‌روز است
- [ ] README.md کامل است
- [ ] تمام testها pass می‌شوند
- [ ] TypeScript compile می‌شود
- [ ] .npmignore درست است
- [ ] Git تمیز است (همه committed)
- [ ] نسخه جدید است
