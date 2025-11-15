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

// Get last 50 characters
const last50 = input.slice(-50);
console.log('Last 50 chars:');
console.log(last50);
console.log('\nHex:');
for (let i = 0; i < last50.length; i++) {
  console.log(`${i}: '${last50[i]}' (${last50.charCodeAt(i).toString(16).padStart(2, '0')})`);
}
