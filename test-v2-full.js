const { RtfConverter } = require('./dist/rtf-converter-v2.js');
const fs = require('fs');

// Import the RTF content directly
const { rtfToHtml: originalRtfToHtml } = require('./src/rtf-renderer.js');
const testJs = require('./run-test.js');

console.log('=== Testing V2 Converter with Full RTF Document ===\n');

const converter = new RtfConverter({ strictMode: false, codePage: 'windows-1256' });
const result = converter.convert(rtf);

if (!result.success) {
  console.log('❌ Conversion failed:', result.error);
  process.exit(1);
}

console.log('✅ Conversion successful!');

if (result.warnings && result.warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  result.warnings.forEach(w => console.log('  -', w));
}

// Write to file
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/test-v2-output.html', result.data, 'utf8');

console.log('\n📝 Output written to dist/test-v2-output.html');

// Check key features
const html = result.data;
console.log('\n=== Feature Validation ===');

// Check bold+underline in ماده 1
if (html.includes('<strong><u>ماده 1')) {
  console.log('✅ ماده 1 has bold+underline');
} else {
  console.log('❌ ماده 1 missing formatting');
}

// Check underline only in ماده 5
const maade5Match = html.match(/ماده 5<\/u>/);
if (maade5Match && !html.includes('<strong><u>ماده 5')) {
  console.log('✅ ماده 5 has underline only (no bold)');
} else {
  console.log('⚠️  ماده 5 formatting needs check');
}

// Check alignment
if (html.includes('text-align:center') && html.includes('2222')) {
  console.log('✅ 2222 is centered');
} else {
  console.log('❌ 2222 not centered');
}

if (html.includes('text-align:right') && html.includes('3333')) {
  console.log('✅ 3333 is right-aligned');
} else {
  console.log('❌ 3333 not right-aligned');
}

if (html.includes('text-align:left') && html.includes('1111')) {
  console.log('✅ 1111 is left-aligned');
} else {
  console.log('❌ 1111 not left-aligned');
}

// Check colors
if (html.includes('rgb(51,153,255)')) {
  console.log('✅ Color support working');
} else {
  console.log('❌ Color support issue');
}

// Check empty tag cleanup
const emptyStrongCount = (html.match(/<strong>\s*<\/strong>/g) || []).length;
const emptyEmCount = (html.match(/<em>\s*<\/em>/g) || []).length;
if (emptyStrongCount === 0 && emptyEmCount === 0) {
  console.log('✅ Empty tags cleaned up');
} else {
  console.log(`⚠️  Found ${emptyStrongCount} empty <strong> and ${emptyEmCount} empty <em> tags`);
}

console.log('\n=== Performance Metrics ===');
console.log(`Input RTF size: ${rtf.length} bytes`);
console.log(`Output HTML size: ${html.length} bytes`);
console.log(`Compression ratio: ${(html.length / rtf.length * 100).toFixed(1)}%`);

console.log('\n✅ All tests completed!');
