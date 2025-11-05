// Test all four converter functions
const { rtfToHtml, htmlToRtf, rtfToHex, hexToRtf } = require('./src/rtf-renderer');
const fs = require('fs');
const path = require('path');

console.log('=== Testing RTF Converters ===\n');

// Test 1: rtfToHtml
console.log('1. Testing rtfToHtml...');
const sampleRtf = String.raw`{\rtf1\ansi\ansicpg1256\deff0{\fonttbl{\f0\fnil\fcharset178 Arial;}}
{\colortbl ;\red255\green0\blue0;\red0\green0\blue255;}
\pard\qr\b\f0\fs24\cf1 سلام دنیا\b0\par
\pard\qc\i این یک تست است\i0\par
\pard\ql\ul\cf2 متن آبی و زیرخط‌دار\ul0\cf0\par
}`;

const html = rtfToHtml(sampleRtf);
console.log('✓ RTF to HTML converted');
console.log('HTML output (first 200 chars):', html.substring(0, 200), '...\n');

// Test 2: htmlToRtf
console.log('2. Testing htmlToRtf...');
const sampleHtml = `
<div>
  <p style="text-align:right"><strong>سلام دنیا</strong></p>
  <p style="text-align:center"><em>این یک تست است</em></p>
  <p style="text-align:left"><u>متن با زیرخط</u></p>
</div>`;

const rtfFromHtml = htmlToRtf(sampleHtml);
console.log('✓ HTML to RTF converted');
console.log('RTF output (first 200 chars):', rtfFromHtml.substring(0, 200), '...\n');

// Test 3: rtfToHex
console.log('3. Testing rtfToHex...');
const hexOutput = rtfToHex(sampleRtf);
console.log('✓ RTF to Hex converted');
console.log('Hex output (first 100 chars):', hexOutput.substring(0, 100), '...\n');

// Test 4: hexToRtf
console.log('4. Testing hexToRtf...');
const rtfFromHex = hexToRtf(hexOutput);
console.log('✓ Hex to RTF converted');
console.log('Match with original:', rtfFromHex === sampleRtf ? '✓ PASS' : '✗ FAIL');
console.log('Original length:', sampleRtf.length);
console.log('Recovered length:', rtfFromHex.length);
console.log();

// Test 5: Round-trip HTML -> RTF -> HTML
console.log('5. Testing round-trip: HTML -> RTF -> HTML...');
const htmlOriginal = '<p style="text-align:right"><strong>متن فارسی</strong></p>';
const rtfIntermediate = htmlToRtf(htmlOriginal);
const htmlRecovered = rtfToHtml(rtfIntermediate);
console.log('Original HTML:', htmlOriginal);
console.log('Recovered HTML:', htmlRecovered.substring(0, 150));
console.log('✓ Round-trip completed\n');

// Write outputs to files for inspection
const outDir = path.join(__dirname, 'dist');
try {
  fs.mkdirSync(outDir, { recursive: true });
  
  // Write HTML output
  const htmlDoc = `<!doctype html><meta charset="utf-8"><title>RTF to HTML Test</title>
<style>body{font-family:Arial;direction:rtl;}</style>
<h2>Original RTF converted to HTML:</h2>
${html}
<hr>
<h2>HTML converted to RTF then back to HTML:</h2>
${htmlRecovered}`;
  
  fs.writeFileSync(path.join(outDir, 'converter-test.html'), htmlDoc, 'utf8');
  
  // Write RTF outputs
  fs.writeFileSync(path.join(outDir, 'sample-output.rtf'), rtfFromHtml, 'utf8');
  fs.writeFileSync(path.join(outDir, 'hex-recovered.rtf'), rtfFromHex, 'utf8');
  
  console.log('✓ Test output files written to dist/');
  console.log('  - converter-test.html (view in browser)');
  console.log('  - sample-output.rtf (open in Word/WordPad)');
  console.log('  - hex-recovered.rtf (verify hex conversion)');
} catch (e) {
  console.error('Failed to write test files:', e.message);
}

console.log('\n=== All tests completed! ===');
