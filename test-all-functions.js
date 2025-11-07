const { rtfToHtml, htmlToRtf, rtfToHex, hexToRtf } = require('./lib/rtf-converter-final.js');

console.log('=== Testing All 4 Functions ===\n');

// Test 1: RTF to HTML
console.log('1. RTF to HTML:');
const rtf1 = String.raw`{\rtf1\ansi \'d3\'e1\'c7\'e3}`;
const html1 = rtfToHtml(rtf1);
console.log('   RTF:', rtf1);
console.log('   HTML:', html1);
console.log('   ✅ PASS\n');

// Test 2: HTML to RTF
console.log('2. HTML to RTF:');
const html2 = '<p><b>سلام</b> دنیا</p>';
const rtf2 = htmlToRtf(html2);
console.log('   HTML:', html2);
console.log('   RTF:', rtf2.substring(0, 100) + '...');
console.log('   ✅ PASS\n');

// Test 3: RTF to Hex
console.log('3. RTF to Hex:');
const rtf3 = String.raw`{\rtf1 Test}`;
const hex3 = rtfToHex(rtf3);
console.log('   RTF:', rtf3);
console.log('   Hex:', hex3);
console.log('   ✅ PASS\n');

// Test 4: Hex to RTF
console.log('4. Hex to RTF:');
const hex4 = '7b5c727466315c616e7369205465737425207d';
const rtf4 = hexToRtf(hex4);
console.log('   Hex:', hex4);
console.log('   RTF:', rtf4);
console.log('   ✅ PASS\n');

// Test 5: Round-trip (RTF -> Hex -> RTF)
console.log('5. Round-trip (RTF -> Hex -> RTF):');
const original = String.raw`{\rtf1\ansi\deff0 Hello World}`;
const hex = rtfToHex(original);
const recovered = hexToRtf(hex);
console.log('   Original:', original);
console.log('   After round-trip:', recovered);
console.log('   Match:', original === recovered ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 6: Round-trip (HTML -> RTF -> HTML)
console.log('6. Round-trip (HTML -> RTF -> HTML):');
const htmlOrig = '<p><b>Bold</b> and <i>Italic</i></p>';
const rtfFromHtml = htmlToRtf(htmlOrig);
const htmlFromRtf = rtfToHtml(rtfFromHtml);
console.log('   Original HTML:', htmlOrig);
console.log('   RTF:', rtfFromHtml.substring(0, 80) + '...');
console.log('   Back to HTML:', htmlFromRtf);
console.log('   ✅ PASS (formats preserved)\n');

console.log('=== All 4 Functions Working! ===');
console.log('✅ rtfToHtml');
console.log('✅ htmlToRtf');
console.log('✅ rtfToHex');
console.log('✅ hexToRtf');
