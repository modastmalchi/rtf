const { rtfToHtml } = require('./lib/rtf-converter');

const rtf = String.raw`{\rtf1\fbidis\ansi\ansicpg1256\deff0{\fonttbl{\f0\fnil\fcharset0 B Nazanin;}{\f1\fnil\fcharset2 Symbol;}}
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

console.log('HTML output:');
const html = rtfToHtml(rtf);
console.log(html);

console.log('\n--- Analysis ---');
const lis = html.match(/<li>[^<]*<\/li>/g) || [];
console.log('Number of <li> tags:', lis.length);
lis.forEach((li, i) => {
  console.log(`${i + 1}: ${li}`);
});

// Check last li
const lastLi = html.match(/<li>([^<]*<[^>]*>[^<]*)*<\/li>/g);
if (lastLi) {
  console.log('\nLast <li>:', lastLi[lastLi.length - 1]);
}
