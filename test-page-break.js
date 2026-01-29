const { rtfToHtml } = require('./lib/rtf-converter');

// تست Page Break
const pageBreakRtf = String.raw`{\rtf1\ansi\deff0
{\fonttbl{\f0\fnil Arial;}}
\f0\fs24 
This is page 1.
\page
This is page 2 after page break.
}`;

console.log('🧪 Testing Page Break...\n');

try {
  const html = rtfToHtml(pageBreakRtf);
  console.log('✅ تبدیل موفق!\n');
  console.log('📄 HTML:');
  console.log(html);
  console.log('\n');
  
  if (html.includes('page-break')) {
    console.log('✅ Page break پیدا شد!');
  } else {
    console.log('❌ Page break پیدا نشد');
  }
  
} catch (error) {
  console.error('❌ خطا:', error.message);
}
