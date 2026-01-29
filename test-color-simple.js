const { rtfToHtml } = require('./lib/rtf-converter');

// تست ساده رنگ
const colorRtf = String.raw`{\rtf1\ansi\ansicpg1256\deff0{\fonttbl{\f0\fnil Arial;}}
{\colortbl ;\red255\green0\blue0;\red0\green0\blue255;}
\f0\fs24 This is \cf1 red text\cf0  and this is \cf2 blue text\cf0 .
}`;

console.log('🧪 Testing Simple Color...\n');

try {
  const html = rtfToHtml(colorRtf);
  console.log('✅ تبدیل موفق!\n');
  console.log('📄 HTML:');
  console.log(html);
  console.log('\n');
  
  if (html.includes('color:rgb(255,0,0)') || html.includes('color:rgb(255, 0, 0)')) {
    console.log('✅ رنگ قرمز پیدا شد!');
  } else {
    console.log('❌ رنگ قرمز پیدا نشد');
  }
  
  if (html.includes('color:rgb(0,0,255)') || html.includes('color:rgb(0, 0, 255)')) {
    console.log('✅ رنگ آبی پیدا شد!');
  } else {
    console.log('❌ رنگ آبی پیدا نشد');
  }
  
} catch (error) {
  console.error('❌ خطا:', error.message);
}
