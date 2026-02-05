# آموزش کامل RTF Converter - راهنمای توسعه‌دهندگان

## 📚 فهرست مطالب

1. [مقدمه](#مقدمه)
2. [RTF چیست؟](#rtf-چیست)
3. [معماری کلی](#معماری-کلی)
4. [ساختار RTF](#ساختار-rtf)
5. [نحوه پردازش RTF](#نحوه-پردازش-rtf)
6. [ویژگی‌های پیاده‌سازی شده](#ویژگیهای-پیاده‌سازی-شده)
7. [مثال‌های کاربردی](#مثالهای-کاربردی)
8. [نکات پیشرفته](#نکات-پیشرفته)

---

## مقدمه

این کتابخانه یک مبدل حرفه‌ای RTF به HTML است که با TypeScript نوشته شده و از متن‌های فارسی/عربی (با کدگذاری Windows-1256) پشتیبانی می‌کند.

### ویژگی‌های کلیدی:
- ✅ پشتیبانی کامل از فارسی و عربی
- ✅ تبدیل دوطرفه: RTF ↔ HTML
- ✅ پشتیبانی از جداول، لیست‌ها، رنگ‌ها، فونت‌ها
- ✅ مدیریت حافظه بهینه
- ✅ تست و اعتبارسنجی کامل

---

## RTF چیست؟

**RTF (Rich Text Format)** یک فرمت متنی است که توسط مایکروسافت توسعه داده شده و برای ذخیره اسناد با قالب‌بندی (فونت، رنگ، لیست، جدول و...) استفاده می‌شود.

### ساختار اصلی یک فایل RTF:

```rtf
{\rtf1\ansi\deff0
  {\fonttbl{\f0 Arial;}}
  {\colortbl ;\red255\green0\blue0;}
  \f0\fs24 Hello \b World\b0
}
```

**توضیح:**
- `{\rtf1...}` - همه چیز داخل براکت‌ها قرار دارد
- `\ansi` - نوع کدگذاری کاراکتر
- `{\fonttbl...}` - جدول فونت‌ها
- `{\colortbl...}` - جدول رنگ‌ها
- `\b` - شروع bold
- `\b0` - پایان bold

---

## معماری کلی

```
┌─────────────────────────────────────────────┐
│           RTF Document (Input)              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          Validation & Parsing               │
│  - بررسی براکت‌ها                          │
│  - بررسی حجم فایل                          │
│  - تجزیه Control Words                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           State Management                  │
│  - Font Table                                │
│  - Color Table                               │
│  - Formatting State Stack                   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         HTML Generation                     │
│  - تولید تگ‌های HTML                       │
│  - اعمال استایل‌ها                         │
│  - پاکسازی تگ‌های خالی                    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         HTML Output (Clean & Valid)         │
└─────────────────────────────────────────────┘
```

---

## ساختار RTF

### 1. Control Words (دستورات کنترلی)

Control Word ها با `\` شروع می‌شوند و رفتار متن را تعیین می‌کنند:

```rtf
\b          → Bold شروع
\b0         → Bold پایان
\i          → Italic شروع
\fs24       → Font Size = 24/2 = 12pt
\cf1        → رنگ شماره 1 از جدول رنگ
\par        → پاراگراف جدید
\line       → خط جدید
\tab        → Tab
```

### 2. Groups (گروه‌ها)

هر چیزی که بین `{` و `}` باشد یک گروه است:

```rtf
{\b bold text}     → فقط این متن bold است
normal text        → این متن عادی است
```

### 3. Hex Escape (کاراکترهای خاص)

کاراکترهای غیر-ASCII با `\'XX` نمایش داده می‌شوند:

```rtf
\'ca\'da\'e5\'cf   → تعهد (فارسی در Windows-1256)
```

### 4. Unicode

کاراکترهای یونیکد:

```rtf
\u1740?    → کاراکتر یونیکد 1740 (ی فارسی)
           → ? یک fallback برای نرم‌افزارهای قدیمی است
```

---

## نحوه پردازش RTF

### 1. **Tokenization (توکن سازی)**

مثال RTF:
```rtf
{\rtf1 Hello \b World\b0}
```

توکن‌های تولید شده:
```javascript
[
  '{',
  '\\rtf1',
  'Hello',
  '\\b',
  'World',
  '\\b0',
  '}'
]
```

### 2. **State Stack (پشته حالت)**

```javascript
interface RtfState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number | null;
  font: string | null;
  color: string | null;
  // ... سایر ویژگی‌ها
}
```

**چرا Stack؟**
چون RTF از گروه‌های تودرتو استفاده می‌کند:

```rtf
{normal {bold text} normal again}
```

وقتی `{` می‌بینیم → حالت فعلی را push می‌کنیم
وقتی `}` می‌بینیم → حالت قبلی را pop می‌کنیم

### 3. **Font Table Processing**

```rtf
{\fonttbl
  {\f0\fnil Arial;}
  {\f1\fnil Times New Roman;}
}
```

تبدیل به:
```javascript
fontTable = {
  0: "Arial",
  1: "Times New Roman"
}
```

بعداً در متن:
```rtf
\f0 This is Arial
\f1 This is Times
```

### 4. **Color Table Processing**

```rtf
{\colortbl
  ;                           ← رنگ 0 (پیش‌فرض)
  \red255\green0\blue0;       ← رنگ 1 (قرمز)
  \red0\green255\blue0;       ← رنگ 2 (سبز)
}
```

تبدیل به:
```javascript
colorTable = [
  null,
  "rgb(255,0,0)",
  "rgb(0,255,0)"
]
```

---

## ویژگی‌های پیاده‌سازی شده

### 1. **Text Formatting (قالب‌بندی متن)**

```rtf
\b Bold text\b0
\i Italic text\i0
\ul Underline text\ul0
\fs24 Font size 12pt
```

→ HTML:
```html
<strong>Bold text</strong>
<em>Italic text</em>
<u>Underline text</u>
<span style="font-size:12pt">Font size 12pt</span>
```

### 2. **Paragraph Alignment (تراز پاراگراف)**

```rtf
\qr Right aligned
\qc Center aligned
\ql Left aligned
\qj Justified
```

→ HTML:
```html
<p style="text-align:right">Right aligned</p>
<p style="text-align:center">Center aligned</p>
```

### 3. **Lists (لیست‌ها)**

```rtf
{\pntext ·\tab}First item\par
{\pntext ·\tab}Second item\par
```

→ HTML:
```html
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>
```

**نکته مهم:** `\pntext` group شامل bullet marker است که باید ignore شود.

### 4. **Tables (جداول)**

```rtf
\trowd              ← شروع تعریف سطر
\cellx1000          ← عرض ستون اول = 1000 twips
\cellx2000          ← عرض ستون دوم = 2000 twips
\intbl Cell 1\cell  ← محتوای سلول اول
\intbl Cell 2\cell  ← محتوای سلول دوم
\row                ← پایان سطر
```

→ HTML:
```html
<table>
  <tr>
    <td>Cell 1</td>
    <td>Cell 2</td>
  </tr>
</table>
```

**ویژگی‌های جدول:**
- `\clbrdrt` - Border بالا
- `\clbrdrb` - Border پایین
- `\clbrdrl` - Border چپ
- `\clbrdrr` - Border راست
- `\clmgf` - اولین سلول merged
- `\clmrg` - سلول merged با قبلی
- `\clvertalt` - تراز عمودی بالا
- `\clvertalc` - تراز عمودی وسط
- `\clvertalb` - تراز عمودی پایین

### 5. **Space & Tab Handling**

**مشکل اولیه:**
```
Space معمولی در HTML collapse می‌شود
```

**راه‌حل:**
```javascript
.replace(/ /g, '&nbsp;')     // تمام spaceها به &nbsp;
.replace(/\t/g, '&nbsp;'.repeat(8))  // Tab = 8 nbsp
```

**Round-trip:**
```javascript
// HTML → RTF
.replace(/(&nbsp;){8}/g, '\t')  // 8 nbsp به tab
.replace(/&nbsp;/g, ' ')         // بقیه به space
```

### 6. **Persian/Arabic Support**

**Windows-1256 Mapping:**
```javascript
const win1256 = {
  0xCA: 0x062A,  // ت
  0xCD: 0x062D,  // ح
  // ... 256 مورد
};
```

**Unicode Escape:**
```rtf
\u1578?  → ت (Unicode 1578)
```

---

## مثال‌های کاربردی

### مثال 1: متن ساده با قالب‌بندی

**RTF:**
```rtf
{\rtf1\ansi
Hello \b World\b0!
\par
This is \i italic\i0 text.
}
```

**فرآیند پردازش:**

1. خواندن `{\rtf1\ansi` → شروع سند
2. خواندن `Hello` → appendText("Hello")
3. خواندن `\b` → state.bold = true
4. flushText() → `<span>Hello</span>`
5. خواندن `World` → appendText("World")
6. خواندن `\b0` → state.bold = false
7. flushText() → `<span><strong>World</strong></span>`

**HTML خروجی:**
```html
<div dir="rtl" style="text-align:right">
  <p>Hello&nbsp;<span><strong>World</strong></span>!</p>
  <br/>
  <p>This&nbsp;is&nbsp;<span><em>italic</em></span>&nbsp;text.</p>
</div>
```

### مثال 2: جدول با بوردر

**RTF:**
```rtf
{\rtf1
\trowd
\clbrdrt\clbrdrb\clbrdrl\clbrdrr
\cellx1440
\clbrdrt\clbrdrb\clbrdrl\clbrdrr
\cellx2880
\pard\intbl Cell 1\cell
\pard\intbl Cell 2\cell
\row
}
```

**پردازش:**

```javascript
// \trowd → شروع جدول
if (!inTable) {
  output.push('<table style="border-collapse:collapse">');
  inTable = true;
}
output.push('<tr>');

// \clbrdrt, \clbrdrb, ... → ذخیره border properties
currentCellProps.borders = {
  top: true, bottom: true, left: true, right: true
};

// \cellx1440 → عرض سلول
currentCellProps.width = 1440; // twips
cellPropsArray.push({...currentCellProps});

// \intbl Cell 1 → باز کردن سلول
let cellStyle = 'padding:5px;';
cellStyle += 'border-top:1px solid #000;';
cellStyle += 'border-bottom:1px solid #000;';
cellStyle += 'border-left:1px solid #000;';
cellStyle += 'border-right:1px solid #000;';
// تبدیل twips به pixel: 1440 * 96 / 1440 = 96px
cellStyle += 'width:96px;';

output.push(`<td style="${cellStyle}">Cell 1`);

// \cell → بستن سلول
output.push('</td>');

// \row → بستن سطر
output.push('</tr>');
```

### مثال 3: متن فارسی

**RTF:**
```rtf
{\rtf1\ansi\ansicpg1256
\f0\fs24 \'d3\'e1\'c7\'e3
}
```

**پردازش Hex:**

```javascript
// \'d3 → byte 0xD3
const byte = parseInt("d3", 16); // = 211

// Windows-1256 mapping
win1256[0xD3] = 0x0633; // س

// تبدیل به کاراکتر
String.fromCharCode(0x0633); // "س"
```

**یا با Unicode:**
```rtf
{\rtf1
\u1587?\u1604?\u1575?\u1605?
}
```

```javascript
// \u1587? → Unicode 1587
String.fromCharCode(1587); // "س"
```

---

## نکات پیشرفته

### 1. **Optimization: flushText()**

**چرا flushText داریم؟**

```javascript
// بدون flush:
"Hello \b World\b0" → "<span>Hello <strong>World</strong></span>"
// ❌ اشتباه! bold فقط برای World است

// با flush:
flushText();  // قبل از \b → "<span>Hello</span>"
state.bold = true;
flushText();  // بعد از \b0 → "<span><strong>World</strong></span>"
// ✅ درست!
```

### 2. **Ignorable Destinations**

برخی group ها باید نادیده گرفته شوند:

```rtf
{\*\generator Microsoft Word 16}
```

`\*` یعنی: اگر این دستور را نمی‌شناسی، کل group را ignore کن.

```javascript
if (rtf[i+1] === '\\' && rtf[i+2] === '*') {
  // پرش از کل group
  let depth = 1;
  while (depth > 0) {
    i++;
    if (rtf[i] === '{') depth++;
    if (rtf[i] === '}') depth--;
  }
}
```

### 3. **Look-ahead برای تشخیص ادامه جدول**

```javascript
// آیا \pard جدول را تمام می‌کند؟
let isTableEnd = true;
for (let j = i; j < i + 100; j++) {
  if (findWord(j) === 'trowd' || findWord(j) === 'intbl') {
    isTableEnd = false; // نه، جدول ادامه دارد
    break;
  }
}
```

### 4. **Memory Management**

```javascript
// بد: ذخیره تمام state history
const allStates = [];
while (...) {
  allStates.push(clone(state)); // ❌ حافظه زیاد
}

// خوب: استفاده از stack
const stateStack = [initialState];
when '{': stateStack.push(clone(current));
when '}': stateStack.pop();
```

### 5. **HTML Entity Encoding**

**چرا همه space ها را به `&nbsp;` تبدیل می‌کنیم؟**

```html
<!-- بدون encoding: -->
<p>Hello     World</p>
→ در مرورگر: "Hello World" (فقط یک space!)

<!-- با encoding: -->
<p>Hello&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;World</p>
→ در مرورگر: "Hello     World" (5 space!)
```

### 6. **Tab to Non-breaking Spaces**

```javascript
// Tab = 8 non-breaking spaces
.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')

// Round-trip: HTML → RTF
.replace(/(&nbsp;){8}/g, '\\tab ')
```

---

## الگوریتم‌های کلیدی

### الگوریتم 1: Parse Control Word

```javascript
function parseControlWord(rtf, i) {
  let word = '';
  let param = null;
  
  // خواندن حروف (a-z)
  while (/[a-z]/i.test(rtf[i])) {
    word += rtf[i];
    i++;
  }
  
  // خواندن پارامتر عددی
  if (rtf[i] === '-' || /\d/.test(rtf[i])) {
    let numStr = '';
    if (rtf[i] === '-') {
      numStr += '-';
      i++;
    }
    while (/\d/.test(rtf[i])) {
      numStr += rtf[i];
      i++;
    }
    param = parseInt(numStr);
  }
  
  // space اختیاری بعد از control word
  if (rtf[i] === ' ') i++;
  
  return { word, param, nextIndex: i };
}
```

### الگوریتم 2: Build HTML Style

```javascript
function stateToStyle(state, colorTable) {
  const styles = [];
  
  if (state.font) {
    styles.push(`font-family:${state.font}`);
  }
  
  if (state.fontSize) {
    styles.push(`font-size:${state.fontSize}pt`);
  }
  
  if (state.colorIndex > 0) {
    const color = colorTable[state.colorIndex];
    if (color) styles.push(`color:${color}`);
  }
  
  return styles.length > 0 
    ? ` style="${styles.join(';')}"` 
    : '';
}
```

### الگوریتم 3: Clean Empty Tags

```javascript
function cleanupEmptyTags(html) {
  let cleaned = html;
  let prevCleaned = '';
  
  // تکرار تا زمانی که تغییری نباشد
  while (cleaned !== prevCleaned) {
    prevCleaned = cleaned;
    
    // حذف تگ‌های خالی
    cleaned = cleaned
      .replace(/<(strong|em|u|span[^>]*)>\s*<\/\1>/g, '')
      .replace(/<span[^>]*>\s*<\/span>/g, '');
  }
  
  // تبدیل پاراگراف‌های خالی به <br/>
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/g, '<br/>');
  
  return cleaned;
}
```

---

## نکات Performance

### 1. String Concatenation

```javascript
// بد:
let html = '';
for (...) {
  html += '<span>text</span>'; // ❌ کند برای اسناد بزرگ
}

// خوب:
const buffer = [];
for (...) {
  buffer.push('<span>text</span>'); // ✅ سریع
}
const html = buffer.join('');
```

### 2. Regex Optimization

```javascript
// بد:
html = html.replace(/\s+/g, ' ');      // اول
html = html.replace(/<br>/g, '<br/>'); // دوم
html = html.replace(/&/g, '&amp;');    // سوم

// خوب: همه در یک pass
html = html
  .replace(/\s+/g, ' ')
  .replace(/<br>/g, '<br/>')
  .replace(/&/g, '&amp;');
```

### 3. Early Exit

```javascript
// بد:
for (let i = 0; i < len; i++) {
  if (someCondition) {
    // کاری انجام بده
  }
}

// خوب:
for (let i = 0; i < len; i++) {
  if (!someCondition) continue; // skip سریع
  // کاری انجام بده
}
```

---

## تست و Debug

### چاپ State برای Debug:

```javascript
function debugState(state, position) {
  console.log(`Position ${position}:`, {
    bold: state.bold,
    italic: state.italic,
    font: state.font,
    fontSize: state.fontSize,
    inTable: state.inTable
  });
}
```

### تست Round-trip:

```javascript
const rtf = '{\rtf1 Test}';
const html = rtfToHtml(rtf);
const rtfBack = htmlToRtf(html);
const htmlBack = rtfToHtml(rtfBack);

console.log('Original HTML:', html);
console.log('Round-trip HTML:', htmlBack);
console.log('Match:', html === htmlBack); // باید true باشد
```

---

## منابع و مراجع

1. **RTF Specification 1.9.1**
   - [Microsoft RTF Spec](https://www.microsoft.com/en-us/download/details.aspx?id=10725)

2. **Windows-1256 Encoding**
   - جدول کاراکتر فارسی/عربی

3. **Twips Unit**
   - 1 inch = 1440 twips
   - 1 point = 20 twips
   - به pixel: `twips * 96 / 1440`

---

## خلاصه نکات مهم

1. ✅ همیشه از Stack برای مدیریت state استفاده کن
2. ✅ قبل از تغییر state، flushText() را فراخوانی کن
3. ✅ control word های ناشناخته را ignore کن (در non-strict mode)
4. ✅ همه space ها را به `&nbsp;` تبدیل کن
5. ✅ از Buffer برای concatenation استفاده کن
6. ✅ Look-ahead برای تشخیص ادامه ساختارها (جدول، لیست)
7. ✅ Round-trip را تست کن
8. ✅ Windows-1256 برای فارسی ضروری است

---

## تمرین: یک Converter ساده بنویس

```javascript
function simpleRtfToHtml(rtf) {
  let html = '';
  let bold = false;
  
  for (let i = 0; i < rtf.length; i++) {
    if (rtf[i] === '\\') {
      i++; // skip backslash
      
      // خواندن control word
      let word = '';
      while (/[a-z]/i.test(rtf[i])) {
        word += rtf[i];
        i++;
      }
      
      if (word === 'b') {
        if (bold) html += '</strong>';
        html += '<strong>';
        bold = true;
      } else if (word === 'b0') {
        if (bold) html += '</strong>';
        bold = false;
      } else if (word === 'par') {
        html += '<br/>';
      }
    } else if (rtf[i] === '{' || rtf[i] === '}') {
      // skip braces
    } else {
      html += rtf[i];
    }
  }
  
  return html;
}

// تست
const rtf = '{\\rtf1 Hello \\b World\\b0}';
console.log(simpleRtfToHtml(rtf));
// Output: Hello <strong>World</strong>
```

---

**موفق باشید! 🚀**

اگر سوالی داشتید، در Issues گیت‌هاب بپرسید.
