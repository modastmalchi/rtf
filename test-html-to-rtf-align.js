const { htmlToRtf, rtfToHtml } = require('./lib/rtf-converter.js');

console.log('========================================');
console.log('Test: HTML to RTF Alignment Issue');
console.log('========================================\n');

// Test 1: Simple paragraphs without alignment
const html1 = `<p>First paragraph</p><p>Second paragraph</p><p>Third paragraph</p>`;
console.log('Test 1: Simple paragraphs (no alignment)');
console.log('HTML:', html1);
const rtf1 = htmlToRtf(html1);
console.log('RTF:', rtf1);
console.log('\nBack to HTML:');
const htmlBack1 = rtfToHtml(rtf1);
console.log(htmlBack1);
console.log('\n---\n');

// Test 2: Paragraphs with center alignment
const html2 = `<p style="text-align:center">First centered</p><p style="text-align:center">Second centered</p>`;
console.log('Test 2: Centered paragraphs');
console.log('HTML:', html2);
const rtf2 = htmlToRtf(html2);
console.log('RTF:', rtf2);
console.log('\nBack to HTML:');
const htmlBack2 = rtfToHtml(rtf2);
console.log(htmlBack2);
console.log('\n---\n');

// Test 3: Mixed alignments
const html3 = `<p style="text-align:center">Centered</p><p>Normal (should be no align)</p><p style="text-align:right">Right</p>`;
console.log('Test 3: Mixed alignments');
console.log('HTML:', html3);
const rtf3 = htmlToRtf(html3);
console.log('RTF:', rtf3);
console.log('\nBack to HTML:');
const htmlBack3 = rtfToHtml(rtf3);
console.log(htmlBack3);

console.log('\n========================================');
console.log('Check if first 2 paragraphs have text-align:left');
console.log('========================================');
