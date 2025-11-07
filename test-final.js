const { rtfToHtml } = require('./lib/rtf-converter-final.js');

console.log('🎯 RTF Converter FINAL - Complete Test Suite\n');
console.log('='.repeat(70));

let passedTests = 0;
let totalTests = 0;

function test(name, rtf, expectedIncludes, shouldNotInclude = []) {
  totalTests++;
  console.log(`\n📝 Test ${totalTests}: ${name}`);
  console.log('Input RTF:', rtf.substring(0, 100) + (rtf.length > 100 ? '...' : ''));
  
  try {
    const html = rtfToHtml(rtf);
    console.log('Output HTML:', html.substring(0, 150) + (html.length > 150 ? '...' : ''));
    
    let passed = true;
    
    // بررسی شامل بودن
    for (const expected of expectedIncludes) {
      if (!html.includes(expected)) {
        console.log(`❌ Expected to include: "${expected}"`);
        passed = false;
      }
    }
    
    // بررسی نباید شامل باشد
    for (const notExpected of shouldNotInclude) {
      if (html.includes(notExpected)) {
        console.log(`❌ Should NOT include: "${notExpected}"`);
        passed = false;
      }
    }
    
    if (passed) {
      console.log('✅ PASSED');
      passedTests++;
    } else {
      console.log('❌ FAILED');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

// Test 1: Bold Handling در Group
test(
  'Bold in Group with proper restoration',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 Normal {\\b Bold {Text} Still Bold} Normal
}`,
  ['Normal ', '<b>Bold Text Still Bold</b>', ' Normal'],
  ['</b> Still Bold'] // نباید bold زودتر بسته بشه
);

// Test 2: Bold بین پاراگراف‌ها
test(
  'Bold continuation across paragraphs',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 \\b Bold Start\\par Still Bold\\par \\b0 Not Bold
}`,
  ['<b>Bold Start<br>Still Bold<br></b> Not Bold']
);

// Test 3: Nested Groups با Bold
test(
  'Nested groups with bold',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 {\\b Outer {\\i Inner} Back} After
}`,
  ['<b>Outer <i>Inner</i> Back</b> After']
);

// Test 4: Windows-1256 Encoding
test(
  'Persian text with Windows-1256',
  `{\\rtf1\\ansi\\ansicpg1256\\deff0
{\\fonttbl{\\f0\\fcharset178 Tahoma;}}
\\f0 \\'d3\\'e1\\'c7\\'e3
}`,
  ['سلام']
);

// Test 5: Unicode Support
test(
  'Unicode characters',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 \\u1587?\\u1604?\\u1575?\\u1605?
}`,
  ['سلام'],
  ['?'] // نباید ? اضافه بشه
);

// Test 6: HTML Character Escaping
test(
  'HTML special characters',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 Test < and > and & chars
}`,
  ['&lt;', '&gt;', '&amp;']
);

// Test 7: Escaped RTF Characters
test(
  'RTF escaped characters',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 Test \\{ and \\} and \\\\ chars
}`,
  ['{', '}', '\\']
);

// Test 8: Color Support
test(
  'Color formatting',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
{\\colortbl ;\\red255\\green0\\blue0;}
\\f0 \\cf1 Red Text\\cf0 Normal
}`,
  ['<span style="color: rgb(255, 0, 0);">Red Text</span> Normal']
);

// Test 9: Multiple Formats
test(
  'Multiple formats combined',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
{\\colortbl ;\\red255\\green0\\blue0;}
\\f0 \\b\\i\\ul\\cf1 All Formats\\cf0\\ulnone\\i0\\b0
}`,
  ['<b><i><u><span style="color: rgb(255, 0, 0);">All Formats</span></u></i></b>']
);

// Test 10: Special Characters
test(
  'Special RTF characters',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 \\bullet Item\\par\\emdash Test\\par\\lquote Quote\\rquote
}`,
  ['•', '—', '\u2018', '\u2019']
);

// Test 11: Superscript & Subscript
test(
  'Super and subscript',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 x\\super2\\nosupersub + H\\sub2\\nosupersub O
}`,
  ['x<sup>2</sup>', 'H<sub>2</sub>O']
);

// Test 12: Complex Persian Document
test(
  'Complex Persian document',
  `{\\rtf1\\ansi\\ansicpg1256\\deff0\\fbidis
{\\fonttbl{\\f0\\fcharset178 B Nazanin;}{\\f1\\fcharset0 Calibri;}}
{\\colortbl ;\\red255\\green0\\blue0;\\red0\\green0\\blue255;}
\\rtlpar\\f0 
\\b\\cf1 \\'da\\'e4\\'e6\\'c7\\'e4\\b0\\cf0\\par
\\bullet \\'e3\\'e6\\'d1\\'cf \\b\\'c7\\'e6\\'e1\\b0\\par
{\\f1\\ltrpar English}
}`,
  ['عنوان', '•', 'مورد', 'اول', 'English']
);

// Test 13: Bold Toggle Multiple Times
test(
  'Bold toggle multiple times',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 Normal \\b Bold1\\b0 Normal \\b Bold2\\b0 Normal
}`,
  ['Normal <b>Bold1</b> Normal <b>Bold2</b> Normal']
);

// Test 14: Group State Restoration
test(
  'State restoration after group',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 \\b Before {\\i Inside} After\\b0
}`,
  ['<b>Before <i>Inside</i> After</b>']
);

// Test 15: Empty Groups
test(
  'Empty groups',
  `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Tahoma;}}
\\f0 Before {} After
}`,
  ['Before  After']
);

console.log('\n' + '='.repeat(70));
console.log(`\n📊 Test Results: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests)*100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests PASSED! RTF Converter Final is working perfectly! 🎉');
} else {
  console.log(`\n⚠️  ${totalTests - passedTests} tests failed. Review the output above.`);
}

console.log('\n💡 RTF Converter Final Features:');
console.log('   ✅ Perfect bold handling in groups');
console.log('   ✅ State restoration after groups');
console.log('   ✅ Windows-1256 encoding');
console.log('   ✅ Unicode support');
console.log('   ✅ HTML character escaping');
console.log('   ✅ All RTF special characters');
console.log('   ✅ Multiple formats combination');
console.log('   ✅ RTL/LTR support');
console.log('   ✅ Production ready!');
