const { rtfToHtml } = require('./lib/rtf-converter');

// RTF کامل با جدول که کاربر فرستاد
const complexRtf = String.raw`{\rtf1\fbidis\ansi\ansicpg1256\deff0\deflang1065{\fonttbl{\f0\fnil\fcharset178 B Nazanin;}{\f1\fnil\fcharset0 B Nazanin;}{\f2\fnil\fcharset0 Nazanin;}}
{\colortbl ;\red255\green0\blue0;\red0\green0\blue0;}
\viewkind4\uc1\pard\rtlpar\ri300\li300\qr\tqc\tx4513\tqr\tx9026\b\f0\rtlch\fs26\'d4\'e3\'c7\'d1\'e5: \'dd\'c7\'d5\'e1\'e5 \'ce\'c7\'e1\u1740?\par
\'ca\'c7\'d1\u1740?\'ce: \'dd\'c7\'d5\'e1\'e5 \'ce\'c7\'e1\u1740?\lang1033\f1\ltrch\par
\lang1065\f0\rtlch\'d5\'dd\'cd\'e51\par
\pard\rtlpar\ri300\li300\qc\'c8\'d3\'e3\'e5 \'ca\'da\'c7\'e1\u1740?\par
\trowd\trleft300\trbrdrt\brdrs\brdrw10\brdrcf2 \trbrdrl\brdrs\brdrw10\brdrcf2 \trbrdrb\brdrs\brdrw10\brdrcf2 \trbrdrr\brdrs\brdrw10\brdrcf2 \clbrdrt\brdrw15\brdrs\clbrdrl\brdrw15\brdrs\clbrdrb\brdrw15\brdrs\clbrdrr\brdrw15\brdrs \cellx1168\pard\intbl\ltrpar\'e3\'cd\'e1 \'c7\'e1\'d5\'c7\'de \'ca\'e3\'c8\'d1\lang1033\f1\ltrch\cell\row
\pard\rtlpar\ri300\li300\sl180\slmult1\qr\lang1065\f0\rtlch\par
}`;

console.log('🧪 Testing Complex RTF with Table...\n');

try {
  const html = rtfToHtml(complexRtf, { dir: 'rtl' });
  console.log('✅ تبدیل موفقیت آمیز بود!\n');
  console.log('📄 HTML خروجی:');
  console.log(html);
  console.log('\n');
  
  // بررسی ویژگی‌های خاص
  const features = {
    'جدول (table tag)': html.includes('<table'),
    'رنگ (color)': html.includes('color:') || html.includes('rgb('),
    'تب (tab stops)': html.includes('text-align'),
    'صفحه جدید (page break)': html.includes('page-break'),
    'حاشیه (margin)': html.includes('margin'),
    'فونت فارسی': html.includes('Nazanin') || html.includes('B Nazanin'),
    'متن RTL': html.includes('dir="rtl"'),
    'بولد': html.includes('<strong>') || html.includes('<b>'),
  };
  
  console.log('🔍 ویژگی‌های پیدا شده:');
  for (const [feature, found] of Object.entries(features)) {
    console.log(`  ${found ? '✅' : '❌'} ${feature}`);
  }
  
  // ذخیره خروجی
  const fs = require('fs');
  fs.writeFileSync('f:\\file rtf\\rtf\\output-complex-table.html', html, 'utf8');
  console.log('\n💾 خروجی در output-complex-table.html ذخیره شد');
  
} catch (error) {
  console.error('❌ خطا:', error.message);
  console.error(error.stack);
}

console.log('\n' + '='.repeat(50));
console.log('ویژگی‌هایی که احتمالاً ساپورت نمی‌شوند:');
console.log('='.repeat(50));
console.log('1. ❌ جداول (\\trowd, \\cell, \\row)');
console.log('2. ❌ Tab stops (\\tqc, \\tx)');
console.log('3. ❌ صفحه جدید (\\page)');
console.log('4. ❌ Border styling در جدول (\\trbrdrt, \\clbrdrt)');
console.log('5. ⚠️  رنگ‌ها (\\cf1, \\cf2) - نیاز به Color Table Parsing');
console.log('6. ⚠️  حاشیه‌ها (\\ri300, \\li300) - تا حدی ساپورت می‌شود');
