const { rtfToHtml } = require('./lib/rtf-converter');
const fs = require('fs');

// RTF جامع با همه ویژگی‌های جدید
const comprehensiveRtf = String.raw`{\rtf1\ansi\ansicpg1256\deff0
{\fonttbl{\f0\fnil\fcharset178 B Nazanin;}{\f1\fnil Arial;}}
{\colortbl ;\red255\green0\blue0;\red0\green0\blue255;\red0\green128\blue0;}
\f0\fs26\b
\pard\ri300\li300\qr
\cf1\'d3\'e1\'c7\'e3\cf0  - \cf2 این متن آبی است\cf0
\par
\pard\qc
\cf3 متن سبز و وسط چین\cf0
\par
\page
\pard\ql
\f1 This is English text on page 2.
\par
\trowd\cellx3000\cellx6000
\intbl First Cell\cell Second Cell\cell\row
\intbl Data 1\cell Data 2\cell\row
\pard
\par
\b0 Normal text after table.
}`;

console.log('🧪 Testing Comprehensive RTF Features...\n');
console.log('='.repeat(60));

try {
  const html = rtfToHtml(comprehensiveRtf, { dir: 'rtl' });
  console.log('✅ تبدیل موفقیت آمیز بود!\n');
  
  const features = {
    '✅ جدول (Table)': html.includes('<table'),
    '✅ رنگ قرمز (Red)': html.includes('rgb(255,0,0)'),
    '✅ رنگ آبی (Blue)': html.includes('rgb(0,0,255)'),
    '✅ رنگ سبز (Green)': html.includes('rgb(0,128,0)'),
    '✅ صفحه جدید (Page Break)': html.includes('page-break'),
    '✅ حاشیه (Margins)': html.includes('margin-left') || html.includes('margin-right'),
    '✅ فونت فارسی': html.includes('Nazanin'),
    '✅ فونت انگلیسی': html.includes('Arial'),
    '✅ تراز راست (Right Align)': html.includes('text-align:right'),
    '✅ تراز وسط (Center Align)': html.includes('text-align:center'),
    '✅ بولد (Bold)': html.includes('<strong>'),
    '✅ RTL Direction': html.includes('dir="rtl"'),
  };
  
  console.log('🔍 ویژگی‌های پیدا شده:\n');
  for (const [feature, found] of Object.entries(features)) {
    console.log(`  ${found ? '✅' : '❌'} ${feature}`);
  }
  
  // محاسبه آمار
  const foundCount = Object.values(features).filter(v => v).length;
  const totalCount = Object.keys(features).length;
  const percentage = Math.round((foundCount / totalCount) * 100);
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 نتیجه: ${foundCount}/${totalCount} ویژگی (${percentage}%) کار می‌کند`);
  console.log('='.repeat(60));
  
  // ذخیره خروجی
  fs.writeFileSync('output-comprehensive.html', html, 'utf8');
  console.log('\n💾 خروجی در output-comprehensive.html ذخیره شد');
  
  // نمایش HTML
  console.log('\n📄 HTML خروجی:');
  console.log(html);
  
} catch (error) {
  console.error('❌ خطا:', error.message);
  console.error(error.stack);
}
