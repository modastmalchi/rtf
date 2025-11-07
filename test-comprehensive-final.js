const { rtfToHtml, htmlToRtf, rtfToHex, hexToRtf } = require('./lib/rtf-converter.js');

console.log('='.repeat(60));
console.log('RTF CONVERTER - COMPREHENSIVE FINAL TEST');
console.log('='.repeat(60));

let passed = 0;
let total = 0;

function test(name, rtf, checks) {
  total++;
  console.log(`\n📝 Test ${total}: ${name}`);
  console.log(`RTF: ${rtf.substring(0, 50)}...`);
  
  try {
    const html = rtfToHtml(rtf, { codePage: 'windows-1256' });
    console.log(`HTML: ${html.substring(0, 80)}...`);
    
    let allPassed = true;
    for (const check of checks) {
      if (!check.fn(html)) {
        console.log(`  ❌ ${check.desc}`);
        allPassed = false;
      }
    }
    
    if (allPassed) {
      console.log(`✅ PASS`);
      passed++;
    } else {
      console.log(`❌ FAIL`);
    }
  } catch (e) {
    console.log(`❌ ERROR: ${e.message}`);
  }
}

// Test 1: Simple bold
test('Simple Bold', 
  '{\\rtf1\\ansi This is \\b bold\\b0  text.}',
  [
    { desc: 'Has bold tag', fn: h => h.includes('<strong>bold</strong>') }
  ]
);

// Test 2: Bold across paragraphs  
test('Bold Across Paragraphs',
  '{\\rtf1\\ansi\\deff0\n{\\fonttbl{\\f0 Times New Roman;}}\n\\f0\\fs24\nNormal \\b bold1\\par\nbold2\\b0  normal2}',
  [
    { desc: 'First bold', fn: h => h.includes('<strong>bold1</strong>') },
    { desc: 'Second bold', fn: h => h.includes('<strong>bold2</strong>') }
  ]
);

// Test 3: Persian text
test('Persian Text (Windows-1256)',
  '{\\rtf1\\ansi\\ansicpg1256 \\\'d3\\\'e1\\\'c7\\\'e5}',
  [
    { desc: 'Persian decoded', fn: h => h.includes('سلام') }
  ]
);

// Test 4: HTML to RTF
console.log(`\n📝 Test ${++total}: HTML to RTF`);
const htmlInput = '<p><strong>Bold</strong> and <em>Italic</em></p>';
const rtfOutput = htmlToRtf(htmlInput);
console.log(`HTML: ${htmlInput}`);
console.log(`RTF: ${rtfOutput.substring(0, 80)}...`);
if (rtfOutput.includes('\\b ') && rtfOutput.includes('Bold') && rtfOutput.includes('\\i ')) {
  console.log('✅ PASS');
  passed++;
} else {
  console.log('❌ FAIL');
}

// Test 5: Hex round trip
console.log(`\n📝 Test ${++total}: Hex Round Trip`);
const original = '{\\rtf1\\ansi Test}';
const hex = rtfToHex(original);
const recovered = hexToRtf(hex);
console.log(`Original: ${original}`);
console.log(`Hex: ${hex}`);
console.log(`Recovered: ${recovered}`);
if (original === recovered) {
  console.log('✅ PASS');
  passed++;
} else {
  console.log('❌ FAIL');
}

// Test 6: Nested groups
test('Nested Groups',
  '{\\rtf1\\ansi Normal {\\b Bold} Normal}',
  [
    { desc: 'Has bold', fn: h => h.includes('<strong>Bold</strong>') },
    { desc: 'Has normal', fn: h => h.includes('Normal') }
  ]
);

// Test 7: Format changes
test('Format Changes Mid-Text',
  '{\\rtf1\\ansi Start \\b bold \\i bold-italic\\b0  italic-only\\i0  normal}',
  [
    { desc: 'Has strong', fn: h => h.includes('<strong>') },
    { desc: 'Has em', fn: h => h.includes('<em>') }
  ]
);

// Test 8: Font properties
test('Font Properties',
  '{\\rtf1\\ansi\\deff0\n{\\fonttbl{\\f0 Arial;}}\n\\f0\\fs24 Text}',
  [
    { desc: 'Has font family', fn: h => h.includes('font-family:Arial') || h.includes('Arial') },
    { desc: 'Has font size', fn: h => h.includes('font-size') || h.includes('12pt') }
  ]
);

// Summary
console.log('\n' + '='.repeat(60));
console.log('TEST SUMMARY');
console.log('='.repeat(60));
console.log(`Total: ${total}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${total - passed}`);
console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
console.log('='.repeat(60));

if (passed === total) {
  console.log('\n🎉 ALL TESTS PASSED! 🎉');
  console.log('✅ RTF Converter is PRODUCTION READY!');
} else {
  console.log(`\n⚠️  ${total - passed} test(s) failed`);
}
