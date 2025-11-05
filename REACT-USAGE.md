# RTF Converter for React TypeScript

کتابخانه مبدل RTF بهینه شده برای پروژه‌های React TypeScript با پشتیبانی از ذخیره‌سازی hex در دیتابیس

## نصب در پروژه React

### گام 1: کپی فایل‌های کتابخانه

فایل‌های زیر را به پروژه React خود کپی کنید:

```
your-project/
└── src/
    └── lib/
        ├── rtf-converter.ts      # توابع اصلی مبدل
        └── useRtfConverter.ts    # React hooks
```

### گام 2: نصب وابستگی‌های React (اگر ندارید)

```bash
npm install react react-dom
npm install -D @types/react @types/react-dom
```

## استفاده در React Component

### 1. نمایش RTF از دیتابیس (Hex → HTML)

```typescript
import { useRtfFromDatabase } from './lib/useRtfConverter';

function ArticleViewer({ articleId }: { articleId: number }) {
  // فرض: دیتا به صورت hex از API میاد
  const [hexData, setHexData] = useState<string | null>(null);

  // Fetch data from database
  useEffect(() => {
    fetch(`/api/articles/${articleId}`)
      .then(res => res.json())
      .then(data => setHexData(data.content_hex));
  }, [articleId]);

  // تبدیل خودکار hex به HTML
  const { html, loading, error } = useRtfFromDatabase({
    hexData,
    autoConvert: true
  });

  if (loading) return <div>در حال بارگذاری...</div>;
  if (error) return <div>خطا: {error}</div>;

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html || '' }}
      style={{ direction: 'rtl' }}
    />
  );
}
```

### 2. ذخیره HTML به دیتابیس (HTML → Hex)

```typescript
import { useHtmlToDatabase } from './lib/useRtfConverter';

function ArticleEditor() {
  const [htmlContent, setHtmlContent] = useState('');

  const { hexData, loading, error, convert, save } = useHtmlToDatabase({
    onSave: async (hex) => {
      // ذخیره hex در دیتابیس
      await fetch('/api/articles', {
        method: 'POST',
        body: JSON.stringify({ content_hex: hex }),
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

  const handleSave = async () => {
    // تبدیل HTML به hex
    convert(htmlContent);
    // ذخیره در دیتابیس
    await save();
  };

  return (
    <div>
      <textarea 
        value={htmlContent}
        onChange={(e) => setHtmlContent(e.target.value)}
        style={{ direction: 'rtl' }}
      />
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'در حال ذخیره...' : 'ذخیره'}
      </button>
      {error && <div>{error}</div>}
    </div>
  );
}
```

### 3. استفاده مستقیم از توابع

```typescript
import { hexToRtf, rtfToHtml, htmlToRtf, rtfToHex } from './lib/rtf-converter';

function MyComponent() {
  // دریافت hex از دیتابیس
  const hexFromDb = "7b5c727466315c616e736...";
  
  // تبدیل به HTML برای نمایش
  const rtf = hexToRtf(hexFromDb);
  const html = rtfToHtml(rtf);
  
  // یا به صورت مستقیم:
  // const html = rtfToHtml(hexToRtf(hexFromDb));

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

## API Reference

### React Hooks

#### `useRtfFromDatabase(options)`
برای نمایش محتوای RTF از دیتابیس (hex → HTML)

```typescript
const { html, rtf, loading, error, convert, reset } = useRtfFromDatabase({
  hexData: string | null,
  autoConvert?: boolean  // default: true
});
```

#### `useHtmlToDatabase(options)`
برای ذخیره HTML به دیتابیس (HTML → hex)

```typescript
const { hexData, rtf, loading, error, convert, save, reset } = useHtmlToDatabase({
  onSave?: (hexData: string) => void | Promise<void>
});
```

#### `useRtfConverter()`
دسترسی به تمام توابع تبدیل با مدیریت state

```typescript
const {
  convertRtfToHtml,
  convertHtmlToRtf,
  convertRtfToHex,
  convertHexToRtf,
  safeConvertRtfToHtml,
  safeConvertHexToHtml,
  safeConvertHtmlToHex,
  loading,
  error
} = useRtfConverter();
```

### توابع مستقیم

```typescript
// تبدیل RTF به HTML
function rtfToHtml(rtf: string): string

// تبدیل HTML به RTF
function htmlToRtf(html: string): string

// تبدیل RTF به Hex (برای ذخیره در دیتابیس)
function rtfToHex(rtf: string): string

// تبدیل Hex به RTF (از دیتابیس)
function hexToRtf(hex: string): string
```

### توابع امن (با مدیریت خطا)

```typescript
// هر کدام یک شیء ConversionResult برمی‌گردانند
function safeRtfToHtml(rtf: string): ConversionResult<string>
function safeHexToHtml(hex: string): ConversionResult<string>
function safeHtmlToHex(html: string): ConversionResult<string>

// ConversionResult interface:
interface ConversionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## مثال کامل با API

```typescript
import React, { useState, useEffect } from 'react';
import { useRtfFromDatabase, useHtmlToDatabase } from './lib/useRtfConverter';

interface Article {
  id: number;
  title: string;
  content_hex: string;
}

function ArticlePage({ articleId }: { articleId: number }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedHtml, setEditedHtml] = useState('');

  // بارگذاری مقاله از API
  useEffect(() => {
    fetch(`/api/articles/${articleId}`)
      .then(res => res.json())
      .then(data => setArticle(data));
  }, [articleId]);

  // نمایش محتوا (hex → HTML)
  const { html, loading: loadingView } = useRtfFromDatabase({
    hexData: article?.content_hex || null,
    autoConvert: true
  });

  // ذخیره تغییرات (HTML → hex → database)
  const { convert, save, loading: saving } = useHtmlToDatabase({
    onSave: async (hex) => {
      await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_hex: hex })
      });
    }
  });

  const handleEdit = () => {
    setEditedHtml(html || '');
    setEditMode(true);
  };

  const handleSave = async () => {
    convert(editedHtml);
    await save();
    setEditMode(false);
    // بارگذاری مجدد داده
    window.location.reload();
  };

  if (loadingView) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div style={{ direction: 'rtl', padding: '20px' }}>
      <h1>{article?.title}</h1>
      
      {!editMode ? (
        <>
          <div 
            dangerouslySetInnerHTML={{ __html: html || '' }}
            style={{ 
              border: '1px solid #ddd',
              padding: '20px',
              minHeight: '300px'
            }}
          />
          <button onClick={handleEdit}>ویرایش</button>
        </>
      ) : (
        <>
          <textarea
            value={editedHtml}
            onChange={(e) => setEditedHtml(e.target.value)}
            style={{
              width: '100%',
              minHeight: '300px',
              fontFamily: 'Arial',
              fontSize: '14px'
            }}
          />
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'در حال ذخیره...' : 'ذخیره'}
          </button>
          <button onClick={() => setEditMode(false)}>
            انصراف
          </button>
        </>
      )}
    </div>
  );
}
```

## ساختار دیتابیس پیشنهادی

### PostgreSQL

```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  content_hex TEXT,  -- محتوای RTF به صورت hex
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB

```javascript
{
  _id: ObjectId,
  title: String,
  content_hex: String,  // محتوای RTF به صورت hex
  created_at: Date
}
```

### MySQL

```sql
CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  content_hex LONGTEXT,  -- محتوای RTF به صورت hex
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## نکات مهم

### 1. چرا Hex؟
- ذخیره‌سازی امن در دیتابیس (بدون مشکل encoding)
- سازگاری با تمام دیتابیس‌ها
- حجم کمتر نسبت به Base64

### 2. Performance
- تبدیل‌ها در کلاینت انجام می‌شود
- برای محتوای بزرگ از useMemo استفاده کنید
- کش کردن نتایج تبدیل را در نظر بگیرید

### 3. امنیت
- همیشه HTML را sanitize کنید قبل از نمایش
- از dangerouslySetInnerHTML با احتیاط استفاده کنید
- برای محتوای کاربران، validation انجام دهید

## TypeScript Types

```typescript
import { 
  ConversionResult,
  RtfConverterOptions,
  UseRtfConverterReturn,
  UseRtfFromDatabaseReturn,
  UseHtmlToDatabaseReturn 
} from './lib/rtf-converter';
```

## مثال Next.js با Server Component

```typescript
// app/articles/[id]/page.tsx
import { hexToRtf, rtfToHtml } from '@/lib/rtf-converter';

async function getArticle(id: string) {
  const res = await fetch(`${process.env.API_URL}/articles/${id}`);
  return res.json();
}

export default async function ArticlePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const article = await getArticle(params.id);
  
  // تبدیل در سمت سرور
  const rtf = hexToRtf(article.content_hex);
  const html = rtfToHtml(rtf);
  
  return (
    <div>
      <h1>{article.title}</h1>
      <div 
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ direction: 'rtl' }}
      />
    </div>
  );
}
```

## پشتیبانی و لایسنس

- **زبان‌ها**: فارسی، عربی، انگلیسی
- **Code Pages**: Windows-1256, Windows-1252
- **لایسنس**: MIT

---

برای سوالات و مشکلات، issue باز کنید یا به مستندات اصلی مراجعه کنید.
