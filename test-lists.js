/**
 * Test for RTF Lists support
 */

const { rtfToHtml, htmlToRtf } = require('./lib/rtf-converter');

console.log('========================================');
console.log('Test: RTF Lists Support');
console.log('========================================\n');

// Test 1: Bulleted list from RTF
console.log('Test 1: RTF Bulleted List');
const rtf1 = String.raw`{\rtf1\ansi
{\*\listtable{\list\listtemplateid1{\listlevel\levelnfc23}}}
{\*\listoverridetable{\listoverride\listid1}}
\pard{\pntext\bullet\tab}First item\par
{\pntext\bullet\tab}Second item\par
{\pntext\bullet\tab}Third item\par
}`;
console.log('Input RTF:', rtf1.substring(0, 100) + '...');
const html1 = rtfToHtml(rtf1);
console.log('Output HTML:', html1);
console.log('Contains <ul>:', html1.includes('<ul>'));
console.log('Contains <li>:', html1.includes('<li>'));
console.log('');

// Test 2: Simple bullet points with \bullet
console.log('Test 2: Simple bullet markers');
const rtf2 = String.raw`{\rtf1\ansi
\bullet First item\par
\bullet Second item\par
\bullet Third item\par
}`;
console.log('Input RTF:', rtf2);
const html2 = rtfToHtml(rtf2);
console.log('Output HTML:', html2);
console.log('');

// Test 3: HTML list to RTF
console.log('Test 3: HTML <ul> to RTF');
const htmlList = '<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>';
console.log('Input HTML:', htmlList);
const rtfFromHtml = htmlToRtf(htmlList);
console.log('Output RTF:');
console.log(rtfFromHtml);
console.log('');

// Test 4: HTML ordered list to RTF
console.log('Test 4: HTML <ol> to RTF');
const htmlOrderedList = '<ol><li>First</li><li>Second</li><li>Third</li></ol>';
console.log('Input HTML:', htmlOrderedList);
const rtfFromOrderedHtml = htmlToRtf(htmlOrderedList);
console.log('Output RTF:');
console.log(rtfFromOrderedHtml);
console.log('');

// Test 5: Round-trip HTML list -> RTF -> HTML
console.log('Test 5: Round-trip HTML list -> RTF -> HTML');
const originalHtml = '<ul><li>سلام</li><li>خداحافظ</li></ul>';
console.log('Original HTML:', originalHtml);
const rtfFromList = htmlToRtf(originalHtml);
console.log('RTF:');
console.log(rtfFromList);
const backToHtml = rtfToHtml(rtfFromList);
console.log('Back to HTML:', backToHtml);
console.log('Contains bullets (•):', backToHtml.includes('•'));
console.log('');

console.log('========================================');
console.log('List Support Test Complete');
console.log('========================================');
