# RTF to HTML Converter# RTF Converter Library - مبدل جامع RTF



A lightweight TypeScript library for converting RTF (Rich Text Format) to HTML and vice versa, with full support for Persian/Arabic (Windows-1256) and Latin (Windows-1252) encodings.این پروژه یک کتابخانه کامل برای تبدیل RTF است که چهار نوع تبدیل را پشتیبانی می‌کند و برای فارسی/عربی بهینه شده است.



## Features## ویژگی‌های اصلی



✅ **RTF to HTML Conversion**✅ **RTF to HTML** (`rtfToHtml`) - نمایش پیشرفته RTF در مرورگر مانند Microsoft Word  

- Full support for Persian/Farsi and Arabic text✅ **HTML to RTF** (`htmlToRtf`) - ایجاد فایل RTF از HTML  

- Handles bold, italic, underline formatting✅ **RTF to Hex** (`rtfToHex`) - رمزگذاری RTF به فرمت هگزادسیمال  

- Font family and font size conversion✅ **Hex to RTF** (`hexToRtf`) - بازیابی RTF از هگزادسیمال

- Color support with RGB color tables

- Text alignment (left, right, center, justify)

- Paragraph and line breaks### پشتیبانی از ویژگی‌های RTF

- Embedded images (PNG, JPEG)

- ✅ **فرمت‌بندی متن**: Bold, Italic, Underline

✅ **HTML to RTF Conversion**- ✅ **فونت‌ها و رنگ‌ها**: Font tables, Color tables

- Convert HTML back to RTF format- ✅ **پاراگراف‌ها**: Alignment (راست، چپ، وسط، justify)

- Preserves formatting and styles- ✅ **کدگذاری**: Windows-1252, Windows-1256 (فارسی/عربی)

- ✅ **Unicode**: پشتیبانی کامل از `\uN` و hex escapes `\'hh`

✅ **Hex Encoding Support**- ✅ **تصاویر**: Embedded PNG/JPEG در RTF

- Convert RTF to hexadecimal for database storage- ✅ **تبدیل دوطرفه**: HTML ↔ RTF با حفظ فرمت‌ها

- Decode hex strings back to RTF

## استفاده سریع

✅ **Safe Conversion Functions**

- Error handling with `ConversionResult` type### در Node.js

- Batch conversion for multiple files

```javascript

## Installationconst { rtfToHtml, htmlToRtf, rtfToHex, hexToRtf } = require('./src/rtf-renderer');



```bash// RTF to HTML

npm installconst html = rtfToHtml(rtfString);

```

// HTML to RTF

## Usageconst rtf = htmlToRtf(htmlString);



### Basic RTF to HTML Conversion// RTF to Hex

const hex = rtfToHex(rtfString);

```typescript

import { rtfToHtml } from './lib/rtf-converter';// Hex to RTF

const rtfRecovered = hexToRtf(hexString);

const rtfContent = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}} \\f0\\fs24 Hello World!}';```

const html = rtfToHtml(rtfContent);

### در مرورگر

console.log(html);

// Output: <div>Hello World!</div>```html

```<script src="./rtf-renderer.js"></script>

<script>

### HTML to RTF Conversion  const html = window.rtfToHtml(rtfString);

  const rtf = window.htmlToRtf(htmlString);

```typescript  const hex = window.rtfToHex(rtfString);

import { htmlToRtf } from './lib/rtf-converter';  const rtfFromHex = window.hexToRtf(hexString);

</script>

const html = '<p><strong>Hello World!</strong></p>';```

const rtf = htmlToRtf(html);

## اسکریپت‌های npm

console.log(rtf);

``````bash

# راه‌اندازی وب‌سرور برای دموها (پورت 8080)

### Hex Encoding (for Database Storage)npm run start:web



```typescript# تست تبدیل RTF به HTML با نمونه فارسی بزرگ

import { rtfToHex, hexToRtf, hexToHtml } from './lib/rtf-converter';npm run test:rtf



// Convert RTF to hex for storage# تست تمام چهار مبدل

const rtf = '{\\rtf1\\ansi Hello}';npm run test:converters

const hex = rtfToHex(rtf);```

console.log(hex); // "7b5c727466315c616e73692048656c6c6f7d"

## دموهای تعاملی وب

// Decode hex back to RTF

const decodedRtf = hexToRtf(hex);### دموی کامل چهار مبدل

```bash

// Or directly convert hex to HTMLnpm run start:web

const html = rtfToHtml(hexToRtf(hex));# باز کنید: http://localhost:8080/demo.html

``````



### Safe Conversion with Error Handlingویژگی‌های دمو:

- ✅ چهار پنل برای تبدیل‌های مختلف

```typescript- ✅ پیش‌نمایش زنده HTML

import { safeRtfToHtml, safeHexToHtml } from './lib/rtf-converter';- ✅ آپلود فایل RTF و دانلود RTF

- ✅ رابط کاربری فارسی کامل

const result = safeRtfToHtml(rtfContent);

## لایسنس

if (result.success) {

  console.log('HTML:', result.data);MIT

} else {
  console.error('Conversion failed:', result.error);
}
```

### Batch Conversion

```typescript
import { hexListToHtml, hexListToCombinedHtml } from './lib/rtf-converter';

const hexList = ['7b5c727466...', '7b5c727466...'];

// Convert to array of HTML strings
const htmlArray = hexListToHtml(hexList);

// Or combine into single HTML with separators
const combinedHtml = hexListToCombinedHtml(hexList, '<hr/>');
```

## API Reference

### Core Functions

#### `rtfToHtml(rtf: string): string`
Converts RTF string to HTML.

#### `htmlToRtf(html: string): string`
Converts HTML string to RTF.

#### `rtfToHex(rtf: string): string`
Converts RTF to hexadecimal string.

#### `hexToRtf(hex: string): string`
Converts hexadecimal string to RTF.

### Safe Conversion Functions

#### `safeRtfToHtml(rtf: string, options?: RtfConverterOptions): ConversionResult<string>`
Safe RTF to HTML conversion with error handling.

#### `safeHexToHtml(hex: string): ConversionResult<string>`
Safe hex to HTML conversion.

#### `safeHtmlToHex(html: string): ConversionResult<string>`
Safe HTML to hex conversion.

### Batch Functions

#### `hexListToHtml(hexes: string[]): string[]`
Converts array of hex strings to array of HTML strings.

#### `hexListToCombinedHtml(hexes: string[], separator?: string): string`
Converts array of hex strings to single combined HTML.

#### `safeHexListToHtml(hexes: string[]): ConversionResult<string[]>`
Safe batch conversion with error handling.

## Supported RTF Features

### Formatting
- `\b` - Bold
- `\i` - Italic
- `\ul` / `\ulnone` - Underline
- `\fs` - Font size
- `\f` - Font family
- `\cf` - Text color

### Alignment
- `\ql` - Left align
- `\qr` - Right align
- `\qc` - Center align
- `\qj` - Justify

### Structure
- `\par` - Paragraph break
- `\line` - Line break
- `\tab` - Tab character
- `\pard` - New paragraph

### Encoding
- `\ansi` - ANSI encoding
- `\ansicpg1256` - Windows-1256 (Persian/Arabic)
- `\ansicpg1252` - Windows-1252 (Latin)
- `\u` - Unicode characters

### Colors
- `{\colortbl ...}` - Color table support
- Full RGB color support

### Images
- `\pngblip` - PNG images
- `\jpegblip` - JPEG images

## TypeScript Support

Full TypeScript support with type definitions included.

```typescript
import { 
  RtfConverterOptions, 
  ConversionResult 
} from './lib/rtf-converter';
```

## Testing

Run the test files:

```bash
npx tsx test-hex-conversion.ts
npx tsx test-colors-final.ts
```

## Recent Fixes

✅ Fixed `\ulnone` handling - no longer adds extra `<u>` tags  
✅ Fixed color table parsing - colors now parse correctly  
✅ Fixed color indexing - color indices now match RTF specification  

## Browser Support

This library works in both Node.js and modern browsers. For browser usage, ensure you have a bundler (webpack, vite, etc.) configured for TypeScript.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

RTF Converter Library - Optimized for React TypeScript projects
