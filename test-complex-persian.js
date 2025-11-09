const { rtfToHtml } = require('./lib/rtf-converter.js');
const fs = require('fs');

console.log('========================================');
console.log('Test: Complex Persian Banking Contract with Headings');
console.log('========================================\n');

// RTF سند واقعی بانکی فارسی با heading ها
const rtf = String.raw`{\rtf1\fbidis\ansi\ansicpg1256\deff0\deflang1065{\fonttbl{\f0\fnil\fprq2\fcharset178 B Nazanin;}{\f1\fnil\fcharset0 ;}{\f2\fnil\fprq2\fcharset178 B Titr;}{\f3\fnil\fprq2\fcharset0 B Nazanin;}{\f4\fswiss\fprq2\fcharset178 Arial Unicode MS;}{\f5\fnil\fprq2\fcharset178 Mitra;}{\f6\fnil\fcharset0 Nazanin;}}
{\colortbl ;\red0\green0\blue0;}
{\stylesheet{ Normal;}{\s1 heading 1;}{\s2 heading 2;}}
\viewkind4\uc1\pard\rtlpar\keepn\s2\qr\cf1\lang1025\b\f0\rtlch\fs18\par
\pard\rtlpar\keepn\s2\qc\'c8\'d3\'e3\'e5\'9d\'ca\'da\'c7\'e1\'ed\lang1065\par
\pard\rtlpar\qr\tx2040\f1\ltrch\fs22\tab\par
\pard\rtlpar\keepn\s2\qr\lang1025\f2\rtlch\fs28\'de\'d1\'c7\'d1\'cf\'c7\'cf \'cc\'da\'c7\'e1\'e5 \lang1065\par
\pard\rtlpar\qr\f0\fs22\'c7\'ed\'e4 \'de\'d1\'c7\'d1\'df\'c7\'cf \'c8\'c7 \'ca\'e6\'cc\'e5 \'e3\'c7\'cf\'e5 10 \'de\'c7\'e4\'e6\'e4 \'e3\'cf\'e4\u1740? \'c7\u1740?\'d1\'c7\'e4 \'e6 \'c8\'d1 \'c7\'d3\'c7\'d3 \'de\'c7\'e4\'e6\'e4 \'da\'e3\'e1\'ed\'c7\'ca \'c8\'c7\'e4\'98\'ed \'c8\'cf\'e6\'e4 \'d1\'c8\'c7 (\'c8\'e5\'d1\'e5) \'e3\'d5\'e6\'c8 8/6/1362\par
\ul\'e3\'c7\'cf\'e5 1- \'e3\'e6\'d6\'e6\'da\par
\ulnone\'cc\'c7\'da\'e1 \'c7\'d2 \'c8\'c7\'e4\'98 \'cf\'d1\'ce\'e6\'c7\'d3\'ca \'e4\'e3\'e6\'cf \'e4\'d3\'c8\'ca \'c8\'e5 \'c8\'d1\'d1\'d3\u1740? \'e6 \'d9\'e5\'d1\'e4\'e6\u1740?\'d3\u1740? \'c7\'d3\'e4\'c7\'cf \'e3\'e6\'d6\'e6\'da \'cb\'c8\'ca \'d3\'dd\'c7\'d1\'d4 \'c8\'d1\'e6\'c7\'ca \'c7\'d3\'e4\'c7\'cf\u1740?\par
\ul\'e3\'c7\'cf\'e5 2- \'e3\'cf\'ca\par
\ulnone\'e3\'cf\'ca \'c7\'ed\'e4 \'de\'d1\'c7\'d1\'df\'c7\'cf \'c7\'d2 \'ca\'c7\'d1\'ed\'ce \'dd\'e6\'de \'ca\'c7 \'e3\'ed \'c8\'c7\'d4\'cf \'e6 \'c8\'c7 \'e3\'e6\'c7\'dd\'de\'ca \'c8\'c7\'e4\'98 \'de\'c7\'c8\'e1 \'ca\'e3\'cf\u1740?\'cf \'c7\'d3\'ca\par
\ul\'e3\'c7\'cf\'e53- \'cc\'da\'e1\par
\ulnone\'cc\'da\'e1 \'c8\'c7\'e4\'df \'c8\'c7\'c8\'ca \'c7\'e4\'cc\'c7\'e3 \'da\'e3\'e1\'ed\'c7\'ca \'e3\'d1\'c8\'e6\'d8 \'c8\'e5 \'cb\'c8\'ca \'d3\'dd\'c7\'d1\'d4\par
}`;

console.log('Test 1: Parse Complex Persian Document');
console.log('RTF Length:', rtf.length, 'characters');

try {
  const html = rtfToHtml(rtf);
  
  console.log('\nHTML Output (first 500 chars):');
  console.log(html.substring(0, 500));
  console.log('...\n');
  
  console.log('HTML Length:', html.length, 'characters');
  
  // Check for headings
  const h1Count = (html.match(/<h1[^>]*>/g) || []).length;
  const h2Count = (html.match(/<h2[^>]*>/g) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/g) || []).length;
  const ulCount = (html.match(/<ul>/g) || []).length;
  
  console.log('\nStructure Analysis:');
  console.log('  h1 tags:', h1Count);
  console.log('  h2 tags:', h2Count);
  console.log('  h3 tags:', h3Count);
  console.log('  ul tags (underline):', ulCount);
  
  // Check for Persian text
  const hasPersian = /[\u0600-\u06FF]/.test(html);
  console.log('  Contains Persian:', hasPersian ? '✅' : '❌');
  
  // Check for specific words
  const hasQarardad = html.includes('قرارداد');
  const hasMadde = html.includes('ماده');
  
  console.log('  Contains "قرارداد":', hasQarardad ? '✅' : '❌');
  console.log('  Contains "ماده":', hasMadde ? '✅' : '❌');
  
  // Save to file for inspection
  fs.writeFileSync('G:\\rtf\\output-complex-persian.html', html, 'utf8');
  console.log('\n✅ HTML saved to output-complex-persian.html');
  
  if (hasPersian && html.length > 100) {
    console.log('\n✅ PASS - Complex Persian document parsed successfully');
  } else {
    console.log('\n❌ FAIL - Issue with Persian parsing');
  }
  
} catch (err) {
  console.error('❌ ERROR:', err.message);
  console.error(err.stack);
}

console.log('\n========================================');
console.log('Test Complete');
console.log('========================================');
