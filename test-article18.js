const fs = require('fs');
const { rtfToHtml } = require('./src/rtf-renderer.js');

const rtfContent = String.raw`{\rtf1\fbidis\ansi\ansicpg1256\deff0\deflang1065{\fonttbl{\f0\fnil\fprq2\fcharset178 B Nazanin;}{\f1\fnil\fcharset0 ;}{\f2\fnil\fprq2\fcharset0 B Nazanin;}{\f3\fnil\fcharset0 Nazanin;}}
\viewkind4\uc1\pard\rtlpar\qr\ul\b\f0\rtlch\fs22\'e3\'c7\'cf\'e5 18- \'e6\'cb\'c7\u1740?\'de \'e6 \'ca\'d6\'e3\u1740?\'e4\'c7\'ca\par
\ulnone\'cc\'c7\'da\'e1 \'c8\'d1\'c7\'ed \'ca\'c7\'e3\'ed\'e4 \'e6 \'e6\'cb\'ed\'de\'e5 \'81\'d1\'cf\'c7\'ce\'ca \'e6\'cc\'e6\'e5 \'e3\'e6\'d1\'cf \'e3\'d8\'c7\'e1\'c8\'e5 \'da\'c7\'e3\'e1 \'c8\'e5 \'d4\'d1\'cd \'c7\'ed\'e4 \'de\'d1\'c7\'d1\'cf\'c7\'cf \'e5\'e3\'8d\'e4\'ed\'e4 \'c8\'e5 \'e3\'e4\'d9\'e6\'d1 \'ca\'d6\'e3\'ed\'e4 \'c7\'cc\'d1\'c7\'ed \'ca\'da\'e5\'cf\'c7\'ca \'ce\'e6\'cf \'e4\'c7\'d4\'ed \'c7\'d2 \'c7\'ed\'e4 \'de\'d1\'c7\'d1\'cf\'c7\'cf \'e3\'e6\'c7\'d1\'cf \'e3\'d4\'d1\'e6\'cd\'e5 \'d0\'ed\'e1 \'d1\'c7 \'cf\'d1 \'e6\'cb\'ed\'de\'e5 \'c8\'c7\'e4\'df \'de\'d1\'c7\'d1\'cf\'c7\'cf:\lang1033\i\f1\ltrch\par
\lang1065\i0\f0\rtlch\'c7\'e1\'dd- \'e3\'e6\'cc\'e6\'cf\'ed \'cd\'d3\'c7\'c8: \'d3\'81\'d1\'cf\'e5 \'d3\'d1\'e3\'c7\'ed\'e5 \'90\'d0\'c7\'d1\'ed \'df\'e6\'ca\'c7\'e5 \'e3\'cf\'ca/ \'d3\'81\'d1\'fd\'e5 \'d3\'d1\'e3\'c7\'ed\'e5 \'90\'d0\'c7\'d1\'ed \'c8\'e1\'e4\'cf \'e3\'cf\'ca/\'81\'d3 \'c7\'e4\'cf\'c7\'d2/ \'cd\'d3\'c7\'c8 \'d3\'81\'d1\'fd\'e5 \'d1\'ed\'c7\'e1\'ed / \'c7\'d1\'d2\'ed \'d4\'e3\'c7\'d1\'e5 #\f2\ltrch F#EXTACCNO#F\f0\rtlch # \'e4\'d2\'cf \'d4\'da\'c8\'e5 #\f2\ltrch F#ORIGINALBRANCH#F\f0\rtlch # \'c8\'c7\'e4\'df \'df\'e5 \'e3\'e6\'cc\'e6\'cf\'ed \'c2\'e4 \'c8\'e5 \'e4\'dd\'da \'c8\'c7\'e4\'df \'e3\'d3\'cf\'e6\'cf \'e6 \'e6\'d1\'de\'e5/ \'98\'c7\'d1\'ca \'cd\'d3\'c7\'c8 \'e4\'ed\'d2 \'c8\'e5 \'c8\'c7\'e4\'df \'ca\'d3\'e1\'ed\'e3 \'90\'d1\'cf\'ed\'cf \'c8\'c7\'e4\'df \'cd\'de \'cf\'c7\'d1\'cf \'e3\'e6\'cc\'e6\'cf\'ed \'cd\'d3\'c7\'c8 \'e3\'d0\'df\'e6\'d1 \'d1\'c7 \'d1\'c7\'d3\'c7" \'c8\'cf\'e6\'e4 \'e5\'ed\'8d\'90\'e6\'e4\'e5 \'ca\'d4\'d1\'ed\'dd\'c7\'ca \'de\'d6\'c7\'c6\'ed \'ed\'c7 \'c7\'cf\'c7\'d1\'ed \'c8\'d1\'cf\'c7\'d4\'ca \'e6 \'c8\'e5 \'cd\'d3\'c7\'c8 \'d8\'e1\'c8 \'ce\'e6\'cf \'e3\'e4\'d9\'e6\'d1 \'cf\'c7\'d1\'cf.\f3\ltrch\par
}`;

const htmlOutput = rtfToHtml(rtfContent);

// Write to file
const outputPath = 'dist/test-article18-output.html';
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync(outputPath, htmlOutput, 'utf8');

console.log('=== HTML Output ===');
console.log(htmlOutput);
console.log('\n=== Analysis ===');

// Check for bold+underline in ماده 18
if (htmlOutput.includes('<strong><u>ماده 18')) {
  console.log('✅ ماده 18 has bold+underline');
} else if (htmlOutput.includes('<u>ماده 18')) {
  console.log('⚠️  ماده 18 has only underline (missing bold)');
} else {
  console.log('❌ ماده 18 has no formatting');
}

// Check for unwanted formatting after \par
const hasUnwantedBold = htmlOutput.match(/<strong>[\s\r\n]*<\/strong>/);
const hasUnwantedItalic = htmlOutput.match(/<em>[\s\r\n]*<\/em>/);
if (hasUnwantedBold || hasUnwantedItalic) {
  console.log('⚠️  Found empty formatting tags');
} else {
  console.log('✅ No empty formatting tags');
}

// Check if paragraph after \i\par has italic
if (htmlOutput.includes('\i') && htmlOutput.includes('<em>الف-')) {
  console.log('❌ Paragraph "الف-" incorrectly has italic');
} else {
  console.log('✅ Paragraph "الف-" does not have unwanted italic');
}

console.log(`\nWrote ${outputPath}. Open it in a browser to verify.`);
