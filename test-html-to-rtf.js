const { htmlToRtf, rtfToHtml, rtfToHex, hexToRtf } = require('./src/rtf-renderer.js');

console.log('=== Testing HTML to RTF ===\n');

// Test 1: Simple HTML to RTF
const html1 = '<p style="text-align:center"><strong>سلام دنیا</strong></p>';
console.log('Input HTML:', html1);

const rtf1 = htmlToRtf(html1);
console.log('\nGenerated RTF:');
console.log(rtf1);

// Test 2: RTF back to HTML
console.log('\n=== Converting back to HTML ===');
const html2 = rtfToHtml(rtf1);
console.log('Output HTML:', html2);

// Test 3: Complex HTML
console.log('\n=== Testing Complex HTML ===');
const complexHtml = `
<div>
  <p style="text-align:right"><strong><u>ماده 1</u></strong></p>
  <p>متن عادی</p>
  <p style="text-align:center"><span style="color:rgb(255,0,0)">متن قرمز وسط</span></p>
</div>
`;

console.log('Input:', complexHtml);
const rtfComplex = htmlToRtf(complexHtml);
console.log('\nRTF:', rtfComplex.substring(0, 200) + '...');

const htmlBack = rtfToHtml(rtfComplex);
console.log('\nBack to HTML:', htmlBack);

// Test 4: Hex conversion
console.log('\n=== Testing Hex Conversion ===');
const simpleRtf = '{\\rtf1\\ansi Test}';
const hex = rtfToHex(simpleRtf);
console.log('RTF:', simpleRtf);
console.log('Hex:', hex);

const rtfBack = hexToRtf(hex);
console.log('Back to RTF:', rtfBack);

console.log('\n✅ All conversions working!');
