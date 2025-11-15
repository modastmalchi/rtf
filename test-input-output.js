const { rtfToHtml, htmlToRtf } = require('./lib/rtf-converter');

const input = String.raw`{\rtf1\fbidis\ansi\ansicpg1256\deff0{\fonttbl{\f0\fnil\fcharset0 B Nazanin;}{\f1\fnil\fcharset2 Symbol;}}
\viewkind4\uc1\pard{\pntext\f1\'B7\tab}{\*\pn\pnlvlblt\pnf1\pnindent0{\pntxtb\'B7}}\rtlpar\fi-200\ri200\qr\lang1065\f0\fs24 1\par
\lang1033{\pntext\f1\'B7\tab}2\lang1065\par
\lang1033{\pntext\f1\'B7\tab}3\lang1065\par
\lang1033{\pntext\f1\'B7\tab}4\lang1065\par
\lang1033{\pntext\f1\'B7\tab}5\lang1065\par
\lang1033{\pntext\f1\'B7\tab}6\lang1065\par
\lang1033{\pntext\f1\'B7\tab}7\lang1065\par
\lang1033{\pntext\f1\'B7\tab}8\lang1065\par
\lang1033{\pntext\f1\'B7\tab}9\lang1065\par
}`;

console.log('=== INPUT RTF ===');
console.log(input);

console.log('\n=== STEP 1: RTF to HTML ===');
const html = rtfToHtml(input);
console.log(html);

console.log('\n=== STEP 2: HTML back to RTF ===');
const output = htmlToRtf(html);
console.log(output);

console.log('\n=== COMPARISON ===');
console.log('Input has 9 items:', (input.match(/\\par/g) || []).length);
console.log('Output has N items:', (output.match(/\\par/g) || []).length);
