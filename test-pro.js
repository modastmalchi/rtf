const { rtfToHtml } = require('./lib/rtf-converter-pro.js');

console.log('🚀 RTF Converter Professional Edition - Test Suite\n');
console.log('='.repeat(70));

// تست 1: متن فارسی با کدگذاری صحیح
console.log('\n📝 تست 1: Windows-1256 Encoding (فارسی)');
const rtf1 = `{\\rtf1\\ansi\\ansicpg1256\\deff0
{\\fonttbl{\\f0\\fnil\\fcharset178 B Nazanin;}}
\\f0\\fs24 \'d3\'e1\'c7\'e3 \'cf\'e6\'d3\'ca
}`;

const html1 = rtfToHtml(rtf1);
console.log('Input RTF:', rtf1);
console.log('Output HTML:', html1);
console.log('✓ آیا "سلام دوست" نمایش داده شد؟', html1.includes('سلام') ? '✅' : '❌');

// تست 2: Group Nesting
console.log('\n' + '='.repeat(70));
console.log('\n📝 تست 2: Group Nesting & State Stack');
const rtf2 = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 Normal {\\b Bold {\\i Bold+Italic} Bold again} Normal
}`;

const html2 = rtfToHtml(rtf2);
console.log('Input RTF:', rtf2);
console.log('Output HTML:', html2);

// تست 3: Escaped Characters
console.log('\n' + '='.repeat(70));
console.log('\n📝 تست 3: Escaped Characters');
const rtf3 = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 Test \\{ and \\} and \\\\ characters
}`;

const html3 = rtfToHtml(rtf3);
console.log('Input RTF:', rtf3);
console.log('Output HTML:', html3);
console.log('✓ آیا { و } و \\\\ درست نمایش داده شدند؟', 
  html3.includes('{') && html3.includes('}') && html3.includes('\\\\') ? '✅' : '❌');

// تست 4: Special Characters
console.log('\n' + '='.repeat(70));
console.log('\n📝 تست 4: Special Characters');
const rtf4 = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 \\bullet Item 1\\par
\\bullet Item 2\\par
\\emdash Test \\endash\\par
\\lquote Quote\\rquote
}`;

const html4 = rtfToHtml(rtf4);
console.log('Input RTF:', rtf4);
console.log('Output HTML:', html4);
console.log('✓ آیا bullet و dash و quote درست هستند؟', 
  html4.includes('•') && html4.includes('—') ? '✅' : '❌');

// تست 5: Unicode
console.log('\n' + '='.repeat(70));
console.log('\n📝 تست 5: Unicode Support');
const rtf5 = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 \\u1587?\\u1604?\\u1575?\\u1605? Unicode
}`;

const html5 = rtfToHtml(rtf5);
console.log('Input RTF:', rtf5);
console.log('Output HTML:', html5);
console.log('✓ آیا Unicode درست decode شد؟', html5.includes('سلام') ? '✅' : '❌');

// تست 6: State Management بین پاراگراف‌ها
console.log('\n' + '='.repeat(70));
console.log('\n📝 تست 6: Format Continuation Across Paragraphs');
const rtf6 = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
{\\colortbl ;\\red255\\green0\\blue0;}
\\f0 \\b\\ul\\cf1 Start bold+underline+red
\\par Still all formats active
\\par \\b0 Only bold off
\\par \\ul0\\cf0 All off
}`;

const html6 = rtfToHtml(rtf6);
console.log('Input RTF:', rtf6);
console.log('Output HTML:', html6);
console.log('✓ آیا فرمت‌ها ادامه پیدا کردند؟', 
  html6.includes('Still all formats active') ? '✅' : '❌');

// تست 7: Complex Persian Document
console.log('\n' + '='.repeat(70));
console.log('\n📝 تست 7: سند پیچیده فارسی');
const rtf7 = `{\\rtf1\\ansi\\ansicpg1256\\deff0\\fbidis
{\\fonttbl{\\f0\\fnil\\fcharset178 B Nazanin;}{\\f1\\fnil\\fcharset0 Calibri;}}
{\\colortbl ;\\red255\\green0\\blue0;\\red0\\green0\\blue255;\\red0\\green128\\blue0;}
\\rtlpar\\f0\\fs28
\\b\\cf1 \'da\'e4\'e6\'c7\'e4:\\b0\\cf0\\par
\\par
\\fs24 \\bullet \'e3\'e6\'d1\'cf \'c7\'e6\'e1: \\b \'e3\'e5\'e3\\b0\\par
\\bullet \'e3\'e6\'d1\'cf \'cf\'e6\'e3: {\\cf2 \\i \'cc\'cf\'ed\'cf\\i0}\\cf0\\par
\\par
{\\f1\\ltrpar English text with \\b bold\\b0}\\par
\\par
\\rtlpar\\cf3 \'e4\'ca\'ed\'cc\'e5: \\ul \'e3\'e6\'dd\'de\\ulnone\\cf0
}`;

const html7 = rtfToHtml(rtf7);
console.log('Input RTF (بخشی):', rtf7.substring(0, 200) + '...');
console.log('Output HTML:', html7);
console.log('✓ آیا عنوان، لیست، رنگ، و انگلیسی درست هستند؟', 
  html7.includes('•') && html7.includes('rgb') && html7.includes('English') ? '✅' : '❌');

// تست 8: HTML Escaping
console.log('\n' + '='.repeat(70));
console.log('\n📝 تست 8: HTML Character Escaping');
const rtf8 = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 Test < and > and & characters
}`;

const html8 = rtfToHtml(rtf8);
console.log('Input RTF:', rtf8);
console.log('Output HTML:', html8);
console.log('✓ آیا <, >, & به &lt;, &gt;, &amp; تبدیل شدند؟', 
  html8.includes('&lt;') && html8.includes('&gt;') && html8.includes('&amp;') ? '✅' : '❌');

console.log('\n' + '='.repeat(70));
console.log('\n✅ همه تست‌ها تمام شد!');
console.log('\n💡 RTF Converter Pro Features:');
console.log('   • Windows-1256 encoding برای فارسی');
console.log('   • Group nesting & state stack');
console.log('   • Escaped characters (\\{, \\}, \\\\)');
console.log('   • Special characters (bullet, dash, quotes)');
console.log('   • Unicode support (\\u)');
console.log('   • State management بین پاراگراف‌ها');
console.log('   • HTML character escaping');
console.log('   • RTL/LTR support');
