const { rtfToHtml, rtfToHtmlSafe } = require('./lib/rtf-converter-final.js');

console.log('=== Testing Safe vs Normal ===\n');

// Test 1: Normal RTF
console.log('1. Valid RTF with rtfToHtml():');
const rtf1 = String.raw`{\rtf1 \b Bold\b0}`;
try {
  const html1 = rtfToHtml(rtf1);
  console.log('   ✅ Success:', html1);
} catch (err) {
  console.log('   ❌ Error:', err.message);
}

// Test 2: Valid RTF with rtfToHtmlSafe()
console.log('\n2. Valid RTF with rtfToHtmlSafe():');
const result2 = rtfToHtmlSafe(rtf1);
console.log('   Success:', result2.success);
console.log('   Data:', result2.data);

// Test 3: Invalid RTF with rtfToHtml()
console.log('\n3. Invalid RTF with rtfToHtml() (normal mode):');
const badRtf = 'Not RTF at all';
try {
  const html3 = rtfToHtml(badRtf);
  console.log('   ✅ Returned:', html3);
} catch (err) {
  console.log('   ❌ Error:', err.message);
}

// Test 4: Invalid RTF with rtfToHtml() strict mode
console.log('\n4. Invalid RTF with rtfToHtml() (strict mode):');
try {
  const html4 = rtfToHtml(badRtf, { strictMode: true });
  console.log('   ✅ Returned:', html4);
} catch (err) {
  console.log('   ❌ Error caught:', err.message);
}

// Test 5: Invalid RTF with rtfToHtmlSafe()
console.log('\n5. Invalid RTF with rtfToHtmlSafe():');
const result5 = rtfToHtmlSafe(badRtf);
console.log('   Success:', result5.success);
console.log('   Error:', result5.error);

console.log('\n=== Summary ===');
console.log('✅ rtfToHtml() - Simple, returns empty div on error');
console.log('✅ rtfToHtml(rtf, {strictMode: true}) - Throws on error');
console.log('✅ rtfToHtmlSafe() - Returns ConversionResult with success/error');
