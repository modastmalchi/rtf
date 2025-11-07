# RTF to HTML Converter 🚀

> تبدیل حرفه‌ای RTF به HTML با پشتیبانی کامل از فارسی

[![TypeScript](https://img.shields.io/badge/TypeScript-✓-007ACC.svg)](https://www.typescriptlang.org/)
[![Persian](https://img.shields.io/badge/Persian-✓-green.svg)](https://github.com/modastmalchi/rtf)
[![Tests](https://img.shields.io/badge/tests-12/15_pass-brightgreen.svg)](./test-final.js)

## ⚡ شروع سریع

```typescript
import { rtfToHtml, htmlToRtf, rtfToHex, hexToRtf } from './lib/rtf-converter-final';

// RTF to HTML
const rtf = '{\\rtf1 \\b سلام دنیا\\b0}';
const html = rtfToHtml(rtf);
// Output: <div><b>سلام دنیا</b></div>

// HTML to RTF
const rtf2 = htmlToRtf('<p><b>Hello</b></p>');

// RTF to Hex (برای دیتابیس)
const hex = rtfToHex(rtf);

// Hex to RTF
const rtfBack = hexToRtf(hex);
```

## ✨ ویژگی‌های اصلی

- ✅ **RTF → HTML** - تبدیل با state restoration کامل
- ✅ **HTML → RTF** - ساخت RTF از HTML
- ✅ **RTF ↔ Hex** - ذخیره در دیتابیس به صورت hex
- ✅ **Bold/Italic/Underline** - فرمت‌بندی کامل
- ✅ **فونت‌ها و رنگ‌ها** - Font tables و Color tables  
- ✅ **فارسی/عربی** - Windows-1256 با 178 کاراکتر
- ✅ **Unicode** - پشتیبانی `\uN` و `\'hh` hex escapes
- ✅ **Superscript/Subscript** - `\super` و `\sub` با پارامترها
- ✅ **Nested Groups** - مدیریت state با stack
- ✅ **HTML Escaping** - ایمن در برابر injection
- ✅ **Test Coverage** - 80% (12/15 tests pass)

## 📦 نصب و راه‌اندازی

```bash
# کلون کردن
git clone https://github.com/modastmalchi/rtf.git
cd rtf

# نصب dependencies
npm install

# کامپایل TypeScript
tsc
```

## 🎯 استفاده

### Node.js - همه تابع‌ها

```javascript
const { rtfToHtml, htmlToRtf, rtfToHex, hexToRtf } = require('./lib/rtf-converter-final');

// RTF to HTML - فارسی
const rtf = '{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Tahoma;}} \\f0 سلام';
const html = rtfToHtml(rtf);

// HTML to RTF - ساخت RTF
const rtf2 = htmlToRtf('<p><b>متن Bold</b></p>');

// RTF to Hex - برای دیتابیس
const hex = rtfToHex(rtf);
console.log(hex); // "7b5c727466..."

// Hex to RTF - بازیابی از دیتابیس
const rtfRecovered = hexToRtf(hex);

// Round-trip test
console.log(rtf === rtfRecovered); // true ✅
```

### Browser

```html
<script src="./lib/rtf-converter-final.js"></script>
<script>
  // همه تابع‌ها
  const html = rtfToHtml(rtfString);
  const rtf = htmlToRtf(htmlString);
  const hex = rtfToHex(rtfString);
  const rtfBack = hexToRtf(hexString);
  
  document.getElementById('output').innerHTML = html;
</script>
```

## 📚 نسخه‌های موجود

| نسخه | فایل | تابع‌ها | وضعیت |
|------|------|---------|--------|
| **Final** | `rtf-converter-final.ts` | 4 تابع (rtfToHtml, htmlToRtf, rtfToHex, hexToRtf) | ⭐ توصیه می‌شود |
| Pro | `rtf-converter-pro.ts` | rtfToHtml فقط | ✅ کامل |
| v4 | `rtf-converter-v4.ts` | rtfToHtml فقط | ✅ Stable |
| v3 | `rtf-converter-v3.ts` | 4 تابع | ⚠️ Legacy |
| v2 | `rtf-converter.ts` | 4 تابع | 📦 Deprecated |
| v1 | `rtf-renderer.js` | rtfToHtml فقط | ❌ قدیمی |

## 🧪 تست

```bash
# تست همه تابع‌ها
node test-all-functions.js

# تست فقط rtfToHtml
node test-final.js

# نتایج:
# ✅ rtfToHtml - 12/15 tests (80%)
# ✅ htmlToRtf - Working
# ✅ rtfToHex - Working  
# ✅ hexToRtf - Working
```

## 📖 مستندات کامل

- [**API Reference**](./API-REFERENCE.md) - راهنمای کامل API
- [**RTF Converters Documentation**](./RTF-CONVERTERS-DOCUMENTATION.md) - مقایسه نسخه‌ها
- [**React Usage**](./REACT-USAGE.md) - استفاده در React

## 🔧 مثال‌های کاربردی

### متن فارسی با فرمت

```javascript
const rtf = String.raw`{\rtf1\ansi
{\fonttbl{\f0 Tahoma;}}
{\colortbl;\red255\green0\blue0;}
\f0\fs24 \b\cf1 عنوان اصلی\b0\cf0\par
متن عادی بدون فرمت
}`;

const html = rtfToHtml(rtf);
// <div><b><span style="color:#ff0000">عنوان اصلی</span></b><br>متن عادی بدون فرمت</div>
```

### Unicode و Super/Subscript

```javascript
// Unicode
const rtf1 = String.raw`{\rtf1 \u1587\u1604\u1575\u1605}`;
rtfToHtml(rtf1); // <div>سلام</div>

// Superscript
const rtf2 = String.raw`{\rtf1 x\super 2\nosupersub}`;
rtfToHtml(rtf2); // <div>x<sup>2</sup></div>
```

## 🐛 مشکلات شناخته شده

1. **Space Handling** - فضای خالی اضافی در toggle bold (Tests 2,13,14)
2. **Image Scaling** - سایز تصاویر گاهی نادرست است
3. **Complex Tables** - جداول پیچیده هنوز پشتیبانی نمی‌شوند

## 🤝 مشارکت

```bash
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

## 📝 License

MIT License - استفاده آزاد برای پروژه‌های تجاری و شخصی

## 👨‍💻 نویسنده

Made with ❤️ by modastmalchi

---

**توجه:** برای استفاده در production از نسخه **Final** استفاده کنید. این نسخه بهترین test coverage (80%) و پشتیبانی کامل از فارسی را دارد.
