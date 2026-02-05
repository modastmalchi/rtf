const { rtfToHtml, htmlToRtf } = require('./lib/rtf-converter.js');

// Test RTF with tabs
const originalRtf = String.raw`{\rtf1\ansi\deff0{\fonttbl{\f0\fnil B Nazanin;}}
\pard\rtlpar\tab بانک ملت\par
\tab شعبه\par
\tab امضاء\par
}`;

console.log('Original RTF:');
console.log(originalRtf);
console.log('\n---\n');

// Convert to HTML
const html = rtfToHtml(originalRtf);
console.log('HTML Output:');
console.log(html);
console.log('\n---\n');

// Convert back to RTF
const rtfBack = htmlToRtf(html);
console.log('RTF Back:');
console.log(rtfBack);
console.log('\n---\n');

// Convert back to HTML again
const htmlBack = rtfToHtml(rtfBack);
console.log('HTML Back (Round Trip):');
console.log(htmlBack);
