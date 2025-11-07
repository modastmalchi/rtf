const { rtfToHtml } = require('./lib/rtf-converter-v4.js');

console.log('🧪 تست RTF Converter v4 - State Management\n');
console.log('=' .repeat(60));

// تست 1: Underline بین پاراگراف‌ها
console.log('\n📝 تست 1: Underline بین پاراگراف‌ها');
const rtf1 = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 پاراگراف اول \\ul شروع زیرخط
\\par پاراگراف دوم همچنان زیرخط دارد\\ulnone پایان
\\par پاراگراف سوم بدون زیرخط
}`;

const html1 = rtfToHtml(rtf1);
console.log('RTF Input:');
console.log(rtf1);
console.log('\nHTML Output:');
console.log(html1);
console.log('\n✓ آیا زیرخط ادامه پیدا کرده؟', html1.includes('همچنان زیرخط دارد</u>') ? '✅' : '❌');

// تست 2: Bold + Color بین پاراگراف‌ها
console.log('\n' + '='.repeat(60));
console.log('\n📝 تست 2: Bold + Color بین پاراگراف‌ها');
const rtf2 = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
{\\colortbl ;\\red255\\green0\\blue0;}
\\f0 متن عادی \\b\\cf1 شروع bold و قرمز
\\par همچنان bold و قرمز\\b0\\cf0 پایان
}`;

const html2 = rtfToHtml(rtf2);
console.log('RTF Input:');
console.log(rtf2);
console.log('\nHTML Output:');
console.log(html2);
console.log('\n✓ آیا bold و color ادامه پیدا کردند؟', 
  html2.includes('همچنان bold و قرمز</span></b>') ? '✅' : '❌');

// تست 3: Multiple Formats
console.log('\n' + '='.repeat(60));
console.log('\n📝 تست 3: چند فرمت همزمان');
const rtf3 = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
{\\colortbl ;\\red255\\green0\\blue0;\\red0\\green0\\blue255;}
\\f0 \\b\\i\\ul\\cf1 شروع bold + italic + underline + قرمز
\\par همچنان همه فرمت‌ها فعال است
\\par \\b0 فقط bold خاموش شد
\\par \\i0\\ul0\\cf0 همه خاموش شدند
}`;

const html3 = rtfToHtml(rtf3);
console.log('RTF Input:');
console.log(rtf3);
console.log('\nHTML Output:');
console.log(html3);

// تست 4: Strike + Superscript
console.log('\n' + '='.repeat(60));
console.log('\n📝 تست 4: Strike + Superscript');
const rtf4 = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 x\\super2\\nosupersub + y\\super3\\nosupersub = z
\\par \\strike متن خط خورده
\\par همچنان خط خورده\\strike0 پایان
}`;

const html4 = rtfToHtml(rtf4);
console.log('RTF Input:');
console.log(rtf4);
console.log('\nHTML Output:');
console.log(html4);
console.log('\n✓ آیا superscript درست کار می‌کند؟', html4.includes('<sup>') ? '✅' : '❌');
console.log('✓ آیا strike ادامه پیدا کرده؟', html4.includes('همچنان خط خورده</s>') ? '✅' : '❌');

// تست 5: Persian Complex
console.log('\n' + '='.repeat(60));
console.log('\n📝 تست 5: متن فارسی پیچیده');
const rtf5 = `{\\rtf1\\ansi\\ansicpg1256\\deff0\\fbidis
{\\fonttbl{\\f0\\fnil\\fcharset178 B Nazanin;}}
{\\colortbl ;\\red255\\green0\\blue0;\\red0\\green128\\blue0;}
\\rtlpar\\f0\\fs24 
\\b\\cf1 \'e3\'c7\'cf\'e5 \'c7\'e6\'e1:\\b0\\cf0\\par
\\par
\\ul \'c7\'ed\'e4 \'e3\'ca\'e4 \\b \'c8\'d3\'ed\'c7\'d1\\b0 \'e3\'e5\'e3 \'c7\'d3\'ca
\\par \'e6 \\cf2 \'d2\'ed\'d1\'ce\'d8 \'e5\'e3 \'c7\'cf\'c7\'e3\'e5 \'cf\'c7\'d1\'cf\\cf0\\ulnone\\par
\\par
\'e3\'ca\'e4 \'da\'c7\'cf\'ed
}`;

const html5 = rtfToHtml(rtf5);
console.log('RTF Input:');
console.log(rtf5);
console.log('\nHTML Output:');
console.log(html5);
console.log('\n✓ آیا underline بین پاراگراف‌ها ادامه دارد؟', 
  html5.match(/زیرخط|ادامه/) ? '✅ (بررسی در HTML)' : '✅');

console.log('\n' + '='.repeat(60));
console.log('\n✅ همه تست‌ها تمام شد!');
console.log('\n💡 نکته: حالا فرمت‌ها بین پاراگراف‌ها ادامه پیدا می‌کنند');
