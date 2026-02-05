const { rtfToHtml, htmlToRtf } = require('./lib/rtf-converter.js');
const fs = require('fs');

const rtfContent = String.raw`{\rtf1\fbidis\ansi\ansicpg1256\deff0{\fonttbl{\f0\fnil\fcharset178 B Nazanin;}{\f1\fnil\fcharset0 B Nazanin;}}
{\colortbl ;\red255\green0\blue0;\red79\green129\blue189;}
\viewkind4\uc1\pard\rtlpar\ri300\li300\qr\lang1025\f0\rtlch\fs28                                                                      \lang1065\b\fs26\'ca\'da\'e5\'cf\'e4\'c7\'e3\'e5 \'e3\'d1\'c8\'e6\'d8 \'c8\'e5 \lang1025\'81\'d0\'ed\'d1\'d4 \'ca\'db\'ed\'ed\'d1\'c7\'ca \'e6\'e4\'e6\'d3\'c7\'e4\'c7\'ca \'e4\'d1\'ce \'c7\'d1\'d2\lang1065  \'cd\'e6\'c7\'e1\'e5 \'e5\'c7\'ed \'c7\'d1\'d2\'ed\par
\pard\rtlpar\ri300\li300\sl216\slmult1\qr\b0\fs28\par
\lang1025\b\fs26\'e3\'e6\'d6\'e6\'da :\b0\fs28   \'cb\'c8\'ca \'d3\'dd\'c7\'d1\'d4 \'d4\'e3\'c7\'d1\'e5 \cf1 ( \'d4\'e3\'c7\'d1\'e5 \'cb\'c8\'ca \'d4\'cf\'e5 \'cf\'d1 \'d3\'c7\'e3\'c7\'e4\'e5)  \cf0\'c8\'e5 \'c7\'d1\'d2\'d4 (\'c8\'e5 \'c7\'d1\'d2)\cf1 ( \'e3\'c8\'e1\'db \'c7\'d1\'d2\u1740? \'cb\'c8\'ca \'d3\'dd\'c7\'d1\'d4\cf2\lang1065 ( \'e3\'c8\'e1\'db \'e6 \'e4\'e6\'da \'c7\'d1\'d2 \'c8\'c7\u1740?\'cf \'de\u1740?\'cf \'d4\'e6\'cf  - \'cd\'d1\'dd \'e6 \'da\'cf\'cf )\cf1\lang1025 )\cf2\lang1065  \cf0\lang1025\'ca\'cd\'ca \'cd\'e6\'c7\'e1\'e5 \'c7\'d1\'d2\u1740? \'d4\'e3\'c7\'d1\'e5: \cf1 (\'d4\'e3\'c7\'d1\'e5 \'cd\'e6\'c7\'e1\'e5 \'cb\'c8\'ca \'d4\'cf\'e5 \'cf\'d1 \'d3\'c7\'e3\'c7\'e4\'e5\cf0 )\par
\lang1065\'c7\'ed\'e4\'cc\'c7\'e4\'c8\'9d/\'c7\'ed\'e4\'cc\'c7\'e4\'c8\'c7\'e4\'9d/: \'e4\'c7\'e3\'9d\'e6 \'e4\'c7\'e3\'9d\'ce\'c7\'e4\'e6\'c7\'cf\'90\'ed\'9d: \cf1 (\'c7\'d4\'ce\'c7\'d5 \'cd\'de\u1740?\'de\u1740? - \'c7\'cc\'c8\'c7\'d1\u1740? \f1\ltrch -\f0\rtlch  \'cd\'d1\'e6\'dd)\cf0  \'dd\'d1\'d2\'e4\'cf: \cf1 (\'c7\'d4\'ce\'c7\'d5 \'cd\'de\u1740?\'de\u1740?- \'c7\'cc\'c8\'c7\'d1\u1740? \f1\ltrch -\f0\rtlch  \'cd\'d1\'e6\'dd)\cf0  \'c8\'e5\'9d\'d4\'e3\'c7\'d1\'e5\'9d\'d4\'e4\'c7\'d3\'e4\'c7\'e3\'e5\'9d: \cf1 ( \'c7\'cc\'c8\'c7\'d1\u1740? \f1\ltrch -\f0\rtlch  \'da\'cf\'cf\u1740?)\cf0  \'d5\'c7\'cf\'d1\'e5\'9d\'c7\'d2( \cf1\'e3\'cd\'e1 \'d5\'cf\'e6\'d1\cf0 - \cf1\'c7\'cc\'c8\'c7\'d1\u1740?- \'cd\'d1\'e6\'dd\cf0 ) \'98\'cf \'e3\'e1\'ed\cf1 ( \'c7\'cc\'c8\'c7\'d1\u1740? \f1\ltrch -\f0\rtlch  \'da\'cf\'cf\u1740?)\cf0  \'c7\'ed\'e4\'9d\'d4\'d1\'df\'ca\'9d: \cf1 (\'c7\'d4\'ce\'c7\'d5 \'cd\'de\'e6\'de\u1740?- \'c7\'cc\'c8\'c7\'d1\u1740? \f1\ltrch -\f0\rtlch  \'cd\'d1\'e6\'dd)\cf0  \'e3\'cf\'ed\'d1/\'e3\'cf\'ed\'d1\'c7\'e4\'9d\lang1025\'d4\'d1\'98\'ca \cf1\lang1065 (\'dd\'c7\'d5\'e1\'e5 \'ce\'c7\'e1\u1740?- \'e4\u1740?\'e3 \'ce\'d8)\cf0  \lang1025\'c8\'e5 \'9d\'d4\'e3\'c7\'d1\'e5 \'cb\'c8\'ca \cf1\lang1065 (\'d4\'e3\'c7\'d1\'e5 \'cb\'c8\'ca \'d4\'d1\'98\'ca- \'c7\'cc\'c8\'c7\'d1\u1740? \f1\ltrch -\f0\rtlch  \'da\'cf\'cf\u1740?)\cf0\lang1025  \'e6 \'d4\'e3\'c7\'d1\'e5 \'9d\'c7\'de\'ca\'d5\'c7\'cf\u1740? \cf1 ( \'c7\'cc\'c8\'c7\'d1\u1740?- \'da\'cf\'cf\u1740?) \cf0\lang1065\'c8\'e5\'9d \'e4\'d4\'c7\'e4\u1740?\'9d\cf1 :     ( \'c2\'cf\'d1\'d3 \f1\ltrch -\f0\rtlch  \'c7\'ce\'ca\u1740?\'c7\'d1\u1740? ) \cf0\'cf\'c7\'d1\'e4\'cf\'e5\'9d\'df\'c7\'d1\'ca\'9d\'c8\'c7\'d2\'d1\'90\'c7\'e4\'ed\'9d\'d4\'e3\'c7\'d1\'e5 \'9d\cf1 :( \'c7\'cc\'c8\'c7\'d1\u1740? \f1\ltrch -\f0\rtlch  \'da\'cf\'cf\u1740?) \cf0\'d5\'c7\'cf\'d1\'e5 \'c7\'d2: \cf1 (\'e3\'cd\'e1 \'cb\'c8\'ca \'d4\'d1\'98\'ca- \'cd\'d1\'e6\'dd)\cf0\lang1025\'e6 \'d4\'e3\'c7\'d1\'e5 \'d4\'e4\'c7\'d3\'e5 \'e3\'e1\'ed\lang1065 : \cf1 ( \'c7\'cc\'c8\'c7\'d1\u1740?- \'da\'cf\'cf\u1740?)  \par
\pard\rtlpar\ri300\li300\qr\b\par
\pard\rtlpar\ri300\li300\sl216\slmult1\qr\cf0\lang1025\b0\'c8\'cf\'ed\'e4\'e6\'d3\'ed\'e1\'e5\'9d\'d6\'e3\'e4 \'81\'d0\'ed\'d1\'d4 \'98\'e1\'ed\'e5 \'e3\'d3\'c6\'e6\'e1\'ed\'ca\'e5\'c7\'ed \'e3\'d1\'c8\'e6\'d8 \'c8\'e5 \'e5\'d1\'90\'e6\'e4\'e5 \'ca\'db\'ed\'ed\'d1\'c7\'ca \'e6 \'e4\'e6\'d3\'c7\'e4\'c7\'ca \'e4\'d1\'ce \'c7\'d1\'d2 \'e3\'ca\'da\'e5\'cf \'e3\'ed\'9d\'90\'d1\'cf\'e3/ \'e3\'ed\'9d\'90\'d1\'cf\'ed\'e3 \'cf\'d1 \'e3\'e6\'c7\'d1\'cf\'ed\'98\'e5 \'cd\'d3\'c8 \'d6\'e6\'c7\'c8\'d8 \'e6 \'cf\'d3\'ca\'e6\'d1\'c7\'e1\'da\'e3\'e1\'9d\'e5\'c7\'ed \'c7\'c8\'e1\'c7\'db\'ed \'c7\'d2 \'d3\'e6\'ed \'c8\'c7\'e4\'98 \'e3\'d1\'98\'d2\'ed\'a1 \'ca\'c3\'e3\'ed\'e4 \'e3\'c7\'c8\'e5\'9d\'c7\'e1\'ca\'dd\'c7\'e6\'ca \'e4\'d1\'ce \'c7\'d1\'d2 \'d6\'d1\'e6\'d1\'ca \'ed\'c7\'c8\'cf\'a1\'9d\'e4\'d3\'c8\'ca \'c8\'e5 \'ca\'c3\'e3\'ed\'e4 \'e6 \'81\'d1\'cf\'c7\'ce\'ca \'e3\'c8\'e1\'db \'e3\'d1\'c8\'e6\'d8\'e5 \'c7\'de\'cf\'c7\'e3 \'e4\'e3\'c7\'ed\'e3/\'e4\'e3\'c7\'ed\'ed\'e3.\'c8\'cf\'ed\'e5\'ed \'c7\'d3\'ca \'da\'e6\'c7\'de\'c8 \'e5\'d1\'90\'e6\'e4\'e5 \'de\'d5\'e6\'d1 \'cf\'d1 \'c7\'ed\'e4 \'c7\'d1\'ca\'c8\'c7\'d8 \'e3\'ca\'e6\'cc\'e5 \'c7\'ed\'e4\'cc\'c7\'e4\'c8/ \'c7\'ed\'e4\'cc\'c7\'e4\'c8\'c7\'e4 \'c8\'e6\'cf\'e5 \'e6 \'c8\'c7\'e4\'98 \'e3\'cd\'de \'ce\'e6\'c7\'e5\'cf \'c8\'e6\'cf \'ca\'c7 \'c7\'de\'cf\'c7\'e3\'c7\'ca \'e1\'c7\'d2\'e3 \lang1065\'d1\'c7\lang1025  \'c8\'e5 \'e3\'e4\'d9\'e6\'d1 \'c7\'cc\'d1\'c7 \'90\'d0\'c7\'d4\'ca\'e4 \'e6 \'ca\'e3\'e1\'98 \'e6\'cb\'c7\'ed\'de \'e3\'c3\'ce\'e6\'d0\'e5 \'e6 \'e5\'e3\'8d\'e4\'ed\'e4 \'ca\'da\'de\'ed\'c8 \'c7\'ed\'e4 \'d4\'d1\'98\'ca \'c8\'e5 \'e3\'e4\'d9\'e6\'d1 \'c7\'d3\'ca\'d1\'cf\'c7\'cf \'c7\'d1\'d2 \'e3\'d1\'c8\'e6\'d8\'e5 \'c8\'da\'e3\'e1 \'c2\'e6\'d1\'cf.\lang1065\par
\pard\rtlpar\ri300\li300\qr\'e3\'cd\'e1\'9d\'e3\'e5\'d1 \'e6 \'c7\'e3\'d6\'c7\'c1\par
\'ca\'c7\'d1\'ed\'ce\'9d\par
\'c8\'cf\'ed\'e4\'e6\'d3\'ed\'e1\'e5\'9d\'d5\'cd\'ca\'9d\'c7\'e3\'d6\'c7\'ed\'9d\'e3\'ca\'da\'e5\'cf/\'e3\'ca\'da\'e5\'cf\'ed\'e4\'9d\'90\'e6\'c7\'e5\'ed\'9d\'e3\'ed\'9d\'90\'d1\'cf\'cf.\par
\pard\rtlpar\ri300\li300\sl192\slmult1\qr\tx4677\tab\'c8\'c7\'e4\'dc\'98\'9d \'e3\'e1\'ca\tab\tab\par
\tab\'d4\'da\'c8\'e5\cf1 ( \'cf\'c7\'d1\'e4\'cf\'e5 \'de\'d1\'c7\'d1\'cf\'c7\'cf- \'c7\'cc\'c8\'c7\'d1\u1740?)\cf0\par
\tab\'c7\'e3\'d6\'c7\'c1\lang1033\f1\ltrch\par
\pard\rtlpar\ri300\li300\qr\lang1065\f0\rtlch\fs32\par
}`;

console.log('Converting RTF to HTML...\n');
const html = rtfToHtml(rtfContent);

console.log('Converting HTML back to RTF...\n');
const rtfBack = htmlToRtf(html);

console.log('Converting back to HTML for verification...\n');
const htmlBack = rtfToHtml(rtfBack);

// Save files for comparison
fs.writeFileSync('test-roundtrip-original.html', html, 'utf8');
fs.writeFileSync('test-roundtrip-back.html', htmlBack, 'utf8');

console.log('Files saved:');
console.log('- test-roundtrip-original.html');
console.log('- test-roundtrip-back.html');

// Check if tabs are preserved
const tabsInOriginal = (html.match(/(&nbsp;){8}/g) || []).length;
const tabsInBack = (htmlBack.match(/(&nbsp;){8}/g) || []).length;

console.log(`\nTab preservation check:`);
console.log(`- Tabs in original HTML: ${tabsInOriginal}`);
console.log(`- Tabs in round-trip HTML: ${tabsInBack}`);
console.log(tabsInOriginal === tabsInBack ? '✓ SUCCESS: Tabs preserved!' : '✗ FAIL: Tabs lost!');
