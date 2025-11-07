const { rtfToHtml } = require('./lib/rtf-converter-pro.js');

// تست ساده برای debug
const rtf = `{\\rtf1\\ansi\\ansicpg1256\\deff0
{\\fonttbl{\\f0\\fcharset178 Tahoma;}}
\\f0 \\'d3\\'e1\\'c7\\'e3
}`;

console.log('Input:', rtf);
console.log('Output:', rtfToHtml(rtf));
console.log('\nExpected: سلام');
