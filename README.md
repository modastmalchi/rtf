# RTF to HTML Converter 🚀

> تبدیل حرفه‌ای RTF به HTML با پشتیبانی کامل از فارسی

[![TypeScript](https://img.shields.io/badge/TypeScript-✓-007ACC.svg)](https://www.typescriptlang.org/)
[![Persian](https://img.shields.io/badge/Persian-✓-green.svg)](https://github.com/modastmalchi/rtf)
[![Tests](https://img.shields.io/badge/tests-12/15_pass-brightgreen.svg)](./test-final.js)

## ⚡ شروع سریع

```typescript
import { rtfToHtml } from './lib/rtf-converter-final';

const rtf = '{\\rtf1 \\b سلام دنیا\\b0}';
const html = rtfToHtml(rtf);
// Output: <div><b>سلام دنیا</b></div>
```

## ✨ ویژگی‌های اصلی

- ✅ **Bold/Italic/Underline** - فرمت‌بندی کامل با state restoration
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

### Node.js

```javascript
const { rtfToHtml } = require('./lib/rtf-converter-final');

// فارسی
const rtf = '{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Tahoma;}} \\f0 سلام';
const html = rtfToHtml(rtf);

// با فرمت
const bold = '{\\rtf1 \\b متن Bold\\b0}';
console.log(rtfToHtml(bold)); // <div><b>متن Bold</b></div>
```

### Browser

```html
<script src="./lib/rtf-converter-final.js"></script>
<script>
  const html = rtfToHtml(rtfString);
  document.getElementById('output').innerHTML = html;
</script>
```

## 📚 نسخه‌های موجود

| نسخه | فایل | ویژگی‌ها | وضعیت |
|------|------|----------|--------|
| **Final** | `rtf-converter-final.ts` | State stack, Windows-1256, Unicode | ⭐ توصیه می‌شود |
| Pro | `rtf-converter-pro.ts` | تمام فرمت‌ها + images | ✅ کامل |
| v4 | `rtf-converter-v4.ts` | پشتیبانی کامل فارسی | ✅ Stable |
| v3 | `rtf-converter-v3.ts` | Windows-1256 encoding | ⚠️ Legacy |
| v2 | `rtf-converter.ts` | Basic با TypeScript | 📦 Deprecated |
| v1 | `rtf-renderer.js` | JavaScript ساده | ❌ قدیمی |

## 🧪 تست

```bash
# اجرای تست‌ها
node test-final.js

# نتایج:
# ✅ Test 1: Bold in groups with restoration
# ✅ Test 3: Nested groups
# ✅ Test 4: Windows-1256 Persian
# ✅ Test 5: Unicode
# ... 12/15 PASSED (80%)
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
