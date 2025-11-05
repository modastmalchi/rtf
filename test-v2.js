const { rtfToHtml, RtfConverter } = require('./dist/rtf-converter-v2.js');
const fs = require('fs');

// Test 1: Basic conversion
console.log('=== Test 1: Basic RTF ===');
const simpleRtf = String.raw`{\rtf1\ansi\ansicpg1256
\pard\qc\b\fs24 Hello World\par
\pard Normal text\par
}`;

try {
  const html1 = rtfToHtml(simpleRtf);
  console.log('✅ Basic conversion successful');
  console.log(html1);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// Test 2: Using class with error handling
console.log('\n=== Test 2: Class-based conversion ===');
const converter = new RtfConverter({ strictMode: false });
const result = converter.convert(simpleRtf);

if (result.success) {
  console.log('✅ Conversion successful');
  if (result.warnings && result.warnings.length > 0) {
    console.log('⚠️  Warnings:', result.warnings);
  }
  console.log('HTML:', result.data);
} else {
  console.log('❌ Error:', result.error);
}

// Test 3: Invalid RTF
console.log('\n=== Test 3: Invalid RTF ===');
const invalidRtf = 'This is not RTF {{{}';
const result3 = converter.convert(invalidRtf);
if (!result3.success) {
  console.log('✅ Correctly detected invalid RTF');
  console.log('Error:', result3.error);
}

// Test 4: Complex Persian document
console.log('\n=== Test 4: Complex Persian RTF ===');
const persianRtf = String.raw`{\rtf1\ansi\ansicpg1256
\pard\qr\b\ul\fs22\'e3\'c7\'cf\'e5 1- \'e3\'e6\'d6\'e6\'da\par
\ulnone\'e3\'ca\'e4 \'d3\'c7\'cf\'e5\par
}`;

const result4 = converter.convert(persianRtf);
if (result4.success) {
  console.log('✅ Persian conversion successful');
  console.log(result4.data);
}

console.log('\n=== All tests completed ===');
