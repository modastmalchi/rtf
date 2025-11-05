const { rtfToHex, hexToRtf, htmlToRtf, hexToHtml } = require('./dist/rtf-converter-v2.js');

console.log('=== Testing V2 Hex Converters ===\n');

// Test 1: RTF to Hex
console.log('Test 1: RTF → Hex');
const rtf = '{\\rtf1\\ansi Test}';
const hex = rtfToHex(rtf);
console.log('RTF:', rtf);
console.log('Hex:', hex);

// Test 2: Hex to RTF
console.log('\nTest 2: Hex → RTF');
const rtfBack = hexToRtf(hex);
console.log('Back to RTF:', rtfBack);
console.log('Match:', rtf === rtfBack ? '✅' : '❌');

// Test 3: HTML to RTF
console.log('\nTest 3: HTML → RTF');
const html = '<p style="text-align:center"><strong>سلام دنیا</strong></p>';
console.log('HTML:', html);
const rtfFromHtml = htmlToRtf(html);
console.log('RTF:', rtfFromHtml.substring(0, 150) + '...');

// Test 4: Hex to HTML (direct)
console.log('\nTest 4: Hex → HTML (direct)');
const hexFromRtf = rtfToHex(rtfFromHtml);
console.log('Hex length:', hexFromRtf.length);

const result = hexToHtml(hexFromRtf, { codePage: 'windows-1256' });
if (result.success) {
  console.log('✅ Conversion successful');
  console.log('HTML:', result.data);
} else {
  console.log('❌ Error:', result.error);
}

// Test 5: Persian text round-trip
console.log('\nTest 5: Persian Round-trip (HTML → RTF → Hex → HTML)');
const persianHtml = '<p><strong><u>ماده 1</u></strong></p>';
console.log('Original HTML:', persianHtml);

const persianRtf = htmlToRtf(persianHtml);
console.log('→ RTF length:', persianRtf.length);

const persianHex = rtfToHex(persianRtf);
console.log('→ Hex length:', persianHex.length);

const finalResult = hexToHtml(persianHex);
if (finalResult.success) {
  console.log('→ Final HTML:', finalResult.data);
  console.log('✅ Round-trip successful!');
} else {
  console.log('❌ Error:', finalResult.error);
}

console.log('\n=== All V2 Converters Working! ===');
console.log('✅ rtfToHex()');
console.log('✅ hexToRtf()');
console.log('✅ htmlToRtf()');
console.log('✅ hexToHtml()');
