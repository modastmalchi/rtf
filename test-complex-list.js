/**
 * Test for complex RTF list with pn (paragraph numbering)
 */

const { rtfToHtml } = require('./lib/rtf-converter');

console.log('========================================');
console.log('Test: Complex RTF List with pn tags');
console.log('========================================\n');

const rtf = String.raw`{\rtf1\fbidis\ansi\ansicpg1256\deff0\deflang1065{\fonttbl{\f0\fnil\fcharset178 Nazanin;}{\f1\fnil\fcharset0 Nazanin;}{\f2\fnil\fcharset2 Symbol;}}
\viewkind4\uc1\pard{\pntext\f2\'B7\tab}{\*\pn\pnlvlblt\pnf2\pnindent0{\pntxtb\'B7}}\rtlpar\fi-200\ri200\qr\b\f0\rtlch\fs22 1\f1\ltrch\par
\f0\rtlch{\pntext\f2\'B7\tab}2\f1\ltrch\par
\lang1033{\pntext\f2\'B7\tab}3\lang1065\par
\lang1033{\pntext\f2\'B7\tab}4\lang1065\par
\lang1033{\pntext\f2\'B7\tab}5\lang1065\par
\lang1033{\pntext\f2\'B7\tab}6\lang1065\par
\lang1033{\pntext\f2\'B7\tab}7\lang1065\par
\pard\rtlpar\qr\par
\par
}`;

console.log('Input RTF (first 200 chars):');
console.log(rtf.substring(0, 200) + '...\n');

const html = rtfToHtml(rtf);

console.log('Output HTML:');
console.log(html);
console.log('');

console.log('Analysis:');
console.log('- Contains <ul>:', html.includes('<ul>'));
console.log('- Contains <li>:', html.includes('<li>'));
console.log('- Number of <li> tags:', (html.match(/<li>/g) || []).length);
console.log('- Contains bullets (·):', html.includes('·'));
console.log('');

// Expected structure
console.log('Expected: Should have <ul> with 7 <li> items (1-7)');
console.log('');
