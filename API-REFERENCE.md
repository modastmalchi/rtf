# مستندات کامل API - RTF Converter

## فهرست مطالب
- [توابع اصلی](#توابع-اصلی)
- [React Hooks](#react-hooks)
- [TypeScript Types](#typescript-types)
- [مثال‌های کاربردی](#مثالهای-کاربردی)

---

## توابع اصلی

### rtfToHtml(rtf: string): string

تبدیل RTF به HTML با حفظ فرمت‌بندی، رنگ‌ها، فونت‌ها و تراز.

**پارامترها:**
- `rtf` (string): رشته RTF

**خروجی:**
- (string): HTML با تگ‌های `<p>`, `<span>`, `<strong>`, `<em>`, `<u>`

**مثال:**
```typescript
const rtf = '{\\rtf1\\ansi\\ansicpg1256 \\b سلام\\b0}';
const html = rtfToHtml(rtf);
// خروجی: "<div><p><span><strong>سلام</strong></span></p></div>"
```

**ویژگی‌های پشتیبانی شده:**
- Bold (`\b`), Italic (`\i`), Underline (`\ul`)
- Font family (`\f` + font table)
- Font size (`\fs`)
- Text color (`\cf` + color table)
- Paragraph alignment (`\qr`, `\qc`, `\ql`, `\qj`)
- Unicode (`\uN`) و hex escapes (`\'hh`)
- Code pages (Windows-1252, Windows-1256)
- Embedded images (`\pict`)

---

### htmlToRtf(html: string): string

تبدیل HTML به RTF قابل استفاده در Word/WordPad.

**پارامترها:**
- `html` (string): رشته HTML

**خروجی:**
- (string): سند RTF کامل با font table و color table

**مثال:**
```typescript
const html = '<p style="text-align:right"><strong>سلام</strong></p>';
const rtf = htmlToRtf(html);
// خروجی RTF قابل باز شدن در Word
```

**تگ‌های HTML پشتیبانی شده:**
- `<strong>`, `<b>` → `\b`
- `<em>`, `<i>` → `\i`
- `<u>` → `\ul`
- `<p>`, `<div>` → `\pard`, `\par`
- `<br>` → `\line`
- `style="color:..."` → `\cf`
- `style="font-family:..."` → `\f`
- `style="font-size:...pt"` → `\fs`
- `style="text-align:..."` → `\qr`, `\qc`, `\ql`, `\qj`

---

### rtfToHex(rtf: string): string

رمزگذاری RTF به فرمت هگزادسیمال برای ذخیره در دیتابیس.

**پارامترها:**
- `rtf` (string): رشته RTF

**خروجی:**
- (string): رشته hex (مثلاً `7b5c727466...`)

**مثال:**
```typescript
const rtf = '{\\rtf1 Test}';
const hex = rtfToHex(rtf);
// خروجی: "7b5c727466315c616e7369205465737420207d"
```

**کاربرد:**
```typescript
// ذخیره در دیتابیس
await db.query(
  'INSERT INTO articles (content_hex) VALUES ($1)',
  [hex]
);
```

---

### hexToRtf(hex: string): string

بازیابی RTF از فرمت هگزادسیمال (از دیتابیس).

**پارامترها:**
- `hex` (string): رشته هگزادسیمال

**خروجی:**
- (string): RTF بازیابی شده

**مثال:**
```typescript
const hex = "7b5c727466315c616e7369205465737420207d";
const rtf = hexToRtf(hex);
// خروجی: "{\\rtf1\\ansi Test}"
```

**کاربرد:**
```typescript
// دریافت از دیتابیس
const result = await db.query(
  'SELECT content_hex FROM articles WHERE id = $1',
  [articleId]
);
const rtf = hexToRtf(result.rows[0].content_hex);
```

---

## توابع امن (Safe Functions)

### safeRtfToHtml(rtf: string): ConversionResult<string>

نسخه امن `rtfToHtml` با مدیریت خطا.

**مثال:**
```typescript
const result = safeRtfToHtml(rtf);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### safeHexToHtml(hex: string): ConversionResult<string>

تبدیل مستقیم hex → HTML با مدیریت خطا.

**مثال:**
```typescript
const result = safeHexToHtml(hexFromDatabase);
if (result.success) {
  setHtml(result.data);
} else {
  setError(result.error);
}
```

### safeHtmlToHex(html: string): ConversionResult<string>

تبدیل مستقیم HTML → hex با مدیریت خطا.

**مثال:**
```typescript
const result = safeHtmlToHex(htmlContent);
if (result.success) {
  await saveToDatabase(result.data);
} else {
  alert(result.error);
}
```

---

## React Hooks

### useRtfConverter()

Hook برای دسترسی به تمام توابع تبدیل با state management.

**خروجی:**
```typescript
interface UseRtfConverterReturn {
  // توابع تبدیل
  convertRtfToHtml: (rtf: string) => string;
  convertHtmlToRtf: (html: string) => string;
  convertRtfToHex: (rtf: string) => string;
  convertHexToRtf: (hex: string) => string;
  
  // توابع امن
  safeConvertRtfToHtml: (rtf: string) => ConversionResult<string>;
  safeConvertHexToHtml: (hex: string) => ConversionResult<string>;
  safeConvertHtmlToHex: (html: string) => ConversionResult<string>;
  
  // State
  loading: boolean;
  error: string | null;
}
```

**مثال استفاده:**
```typescript
function MyComponent() {
  const { 
    convertHexToRtf, 
    convertRtfToHtml, 
    loading, 
    error 
  } = useRtfConverter();
  
  const displayContent = (hexFromDb: string) => {
    const rtf = convertHexToRtf(hexFromDb);
    const html = convertRtfToHtml(rtf);
    return html;
  };
  
  return <div>{/* ... */}</div>;
}
```

---

### useRtfFromDatabase(options)

Hook مخصوص نمایش محتوای RTF از دیتابیس (hex → HTML).

**پارامترها:**
```typescript
interface UseRtfFromDatabaseOptions {
  hexData: string | null;
  autoConvert?: boolean;  // default: true
}
```

**خروجی:**
```typescript
interface UseRtfFromDatabaseReturn {
  html: string | null;
  rtf: string | null;
  loading: boolean;
  error: string | null;
  convert: () => void;
  reset: () => void;
}
```

**مثال استفاده:**
```typescript
function ArticleViewer({ hexContent }: { hexContent: string }) {
  const { html, loading, error } = useRtfFromDatabase({
    hexData: hexContent,
    autoConvert: true  // تبدیل خودکار
  });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html || '' }}
      style={{ direction: 'rtl' }}
    />
  );
}
```

**ویژگی‌ها:**
- تبدیل خودکار هنگام تغییر `hexData`
- مدیریت خطا و loading state
- قابلیت reset برای پاک کردن state

---

### useHtmlToDatabase(options)

Hook مخصوص ذخیره HTML در دیتابیس (HTML → hex).

**پارامترها:**
```typescript
interface UseHtmlToDatabaseOptions {
  onSave?: (hexData: string) => void | Promise<void>;
}
```

**خروجی:**
```typescript
interface UseHtmlToDatabaseReturn {
  hexData: string | null;
  rtf: string | null;
  loading: boolean;
  error: string | null;
  convert: (html: string) => void;
  save: () => Promise<void>;
  reset: () => void;
}
```

**مثال استفاده:**
```typescript
function ArticleEditor() {
  const [content, setContent] = useState('');
  
  const { hexData, loading, error, convert, save } = useHtmlToDatabase({
    onSave: async (hex) => {
      await fetch('/api/articles', {
        method: 'POST',
        body: JSON.stringify({ content_hex: hex }),
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
  
  const handleSave = async () => {
    convert(content);  // تبدیل HTML به hex
    await save();      // ذخیره در دیتابیس
  };
  
  return (
    <div>
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

**ویژگی‌ها:**
- تبدیل و ذخیره در دو مرحله جداگانه
- مدیریت کامل خطا و loading
- پشتیبانی از async save callback

---

## TypeScript Types

### ConversionResult<T>

```typescript
interface ConversionResult<T = string> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**استفاده:**
```typescript
const result: ConversionResult<string> = safeRtfToHtml(rtf);
if (result.success && result.data) {
  console.log(result.data);
} else if (result.error) {
  console.error(result.error);
}
```

### RtfConverterOptions

```typescript
interface RtfConverterOptions {
  codePage?: string;       // e.g., 'windows-1256', 'windows-1252'
  strictMode?: boolean;    // Enable strict validation (default: false)
  maxSize?: number;        // Maximum document size in bytes (default: 10MB)
  dir?: 'rtl' | 'ltr';     // Text direction (default: 'rtl' for Persian/Arabic)
}
```

**استفاده:**
```typescript
// برای فارسی/عربی (پیش‌فرض RTL)
const options: RtfConverterOptions = {
  codePage: 'windows-1256',
  dir: 'rtl'  // راست به چپ (پیش‌فرض)
};

// برای انگلیسی
const optionsLTR: RtfConverterOptions = {
  codePage: 'windows-1252',
  dir: 'ltr'  // چپ به راست
};

const html = rtfToHtml(rtf, options);
// خروجی: <div dir="rtl">...</div>
```

---

## مثال‌های کاربردی

### مثال 1: CRUD کامل با Next.js

```typescript
// app/articles/[id]/page.tsx
import { hexToRtf, rtfToHtml, htmlToRtf, rtfToHex } from '@/lib/rtf-converter';

// Server Component - نمایش
export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);
  const html = rtfToHtml(hexToRtf(article.content_hex));
  
  return <ArticleDisplay html={html} />;
}

// Client Component - ویرایش
'use client';
function ArticleEditor({ initialContent }: { initialContent: string }) {
  const [html, setHtml] = useState(initialContent);
  
  const handleSave = async () => {
    const hex = rtfToHex(htmlToRtf(html));
    await fetch('/api/articles', {
      method: 'POST',
      body: JSON.stringify({ content_hex: hex })
    });
  };
  
  return (/* ... */);
}
```

### مثال 2: فرم با Preview

```typescript
function ArticleForm() {
  const [htmlInput, setHtmlInput] = useState('');
  const [preview, setPreview] = useState('');
  const { safeHtmlToHex } = useRtfConverter();
  
  const handlePreview = () => {
    const result = safeHtmlToHex(htmlInput);
    if (result.success && result.data) {
      // شبیه‌سازی: hex → HTML برای preview
      const rtf = hexToRtf(result.data);
      const html = rtfToHtml(rtf);
      setPreview(html);
    }
  };
  
  return (
    <div>
      <textarea value={htmlInput} onChange={e => setHtmlInput(e.target.value)} />
      <button onClick={handlePreview}>Preview</button>
      <div dangerouslySetInnerHTML={{ __html: preview }} />
    </div>
  );
}
```

### مثال 3: Lazy Loading با Suspense

```typescript
import { Suspense } from 'react';

function ArticleList() {
  return (
    <div>
      <Suspense fallback={<div>Loading articles...</div>}>
        <Articles />
      </Suspense>
    </div>
  );
}

async function Articles() {
  const articles = await fetchArticles();
  
  return (
    <>
      {articles.map(article => (
        <Article key={article.id} hexContent={article.content_hex} />
      ))}
    </>
  );
}

function Article({ hexContent }: { hexContent: string }) {
  const html = rtfToHtml(hexToRtf(hexContent));
  
  return (
    <article>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
```

### مثال 4: با React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { hexToRtf, rtfToHtml, htmlToRtf, rtfToHex } from '@/lib/rtf-converter';

function ArticleViewer({ id }: { id: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${id}`);
      return res.json();
    },
    select: (data) => ({
      ...data,
      html: rtfToHtml(hexToRtf(data.content_hex))
    })
  });
  
  const mutation = useMutation({
    mutationFn: async (html: string) => {
      const hex = rtfToHex(htmlToRtf(html));
      return fetch(`/api/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ content_hex: hex })
      });
    }
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div dangerouslySetInnerHTML={{ __html: data.html }} />
  );
}
```

---

## Performance Tips

### 1. Memoization

```typescript
import { useMemo } from 'react';

function ArticleView({ hexContent }: { hexContent: string }) {
  const html = useMemo(() => {
    return rtfToHtml(hexToRtf(hexContent));
  }, [hexContent]);
  
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### 2. Caching

```typescript
const htmlCache = new Map<string, string>();

function getCachedHtml(hex: string): string {
  if (htmlCache.has(hex)) {
    return htmlCache.get(hex)!;
  }
  
  const html = rtfToHtml(hexToRtf(hex));
  htmlCache.set(hex, html);
  return html;
}
```

### 3. Web Worker (برای فایل‌های بزرگ)

```typescript
// worker.ts
self.onmessage = (e) => {
  const { hex } = e.data;
  const rtf = hexToRtf(hex);
  const html = rtfToHtml(rtf);
  self.postMessage({ html });
};

// component.tsx
const worker = new Worker('worker.ts');
worker.postMessage({ hex: hexData });
worker.onmessage = (e) => {
  setHtml(e.data.html);
};
```

---

برای اطلاعات بیشتر به [REACT-USAGE.md](./REACT-USAGE.md) مراجعه کنید.
