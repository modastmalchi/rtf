/**
 * Test for dir (text direction) option
 * Tests RTL and LTR text direction in HTML output
 */

const { rtfToHtml } = require('./lib/rtf-converter');

console.log('🧪 Testing dir option...\n');

// Test 1: Default (RTL)
console.log('Test 1: Default dir (should be rtl)');
const rtf1 = String.raw`{\rtf1\ansi\deff0 {\fonttbl{\f0 Tahoma;}} \f0 سلام دنیا}`;
const html1 = rtfToHtml(rtf1);
console.log('Input RTF:', rtf1);
console.log('Output HTML:', html1);
console.log('✅ Pass: Contains dir="rtl":', html1.includes('dir="rtl"'));
console.log('');

// Test 2: Explicit RTL
console.log('Test 2: Explicit dir="rtl"');
const rtf2 = String.raw`{\rtf1\ansi Persian text}`;
const html2 = rtfToHtml(rtf2, { dir: 'rtl' });
console.log('Input RTF:', rtf2);
console.log('Output HTML:', html2);
console.log('✅ Pass: Contains dir="rtl":', html2.includes('dir="rtl"'));
console.log('');

// Test 3: LTR direction
console.log('Test 3: Explicit dir="ltr"');
const rtf3 = String.raw`{\rtf1\ansi English text}`;
const html3 = rtfToHtml(rtf3, { dir: 'ltr' });
console.log('Input RTF:', rtf3);
console.log('Output HTML:', html3);
console.log('✅ Pass: Contains dir="ltr":', html3.includes('dir="ltr"'));
console.log('');

// Test 4: Mixed with other options
console.log('Test 4: dir with codePage option');
const rtf4 = String.raw`{\rtf1\ansi\ansicpg1256 متن فارسی}`;
const html4 = rtfToHtml(rtf4, { 
  dir: 'rtl',
  codePage: 'windows-1256'
});
console.log('Input RTF:', rtf4);
console.log('Output HTML:', html4);
console.log('✅ Pass: Contains dir="rtl":', html4.includes('dir="rtl"'));
console.log('');

// Summary
console.log('📊 Summary:');
console.log('✅ Test 1: Default RTL -', html1.includes('dir="rtl"') ? 'PASS' : 'FAIL');
console.log('✅ Test 2: Explicit RTL -', html2.includes('dir="rtl"') ? 'PASS' : 'FAIL');
console.log('✅ Test 3: Explicit LTR -', html3.includes('dir="ltr"') ? 'PASS' : 'FAIL');
console.log('✅ Test 4: RTL with codePage -', html4.includes('dir="rtl"') ? 'PASS' : 'FAIL');

const allPass = html1.includes('dir="rtl"') && 
                html2.includes('dir="rtl"') && 
                html3.includes('dir="ltr"') && 
                html4.includes('dir="rtl"');

console.log('\n' + (allPass ? '✅ All tests passed!' : '❌ Some tests failed'));
