const { rtfToHtml } = require('./lib/rtf-converter.js');

console.log('========================================');
console.log('Test: RTF Headings Support');
console.log('========================================\n');

// Test 1: Simple heading
console.log('Test 1: Simple Heading (h1)');
const rtf1 = String.raw`{\rtf1\ansi\deff0
\pard\outlinelevel0 This is Heading 1\par
\pard Normal paragraph\par
}`;
const html1 = rtfToHtml(rtf1, { codePage: 'windows-1252' });
console.log('RTF:', rtf1.substring(0, 60) + '...');
console.log('HTML:', html1);
if (html1.includes('<h1>')) {
  console.log('✅ PASS - h1 created\n');
} else {
  console.log('❌ FAIL - h1 not found\n');
}

// Test 2: Multiple heading levels
console.log('Test 2: Multiple Heading Levels');
const rtf2 = String.raw`{\rtf1\ansi\deff0
\pard\outlinelevel0 Heading 1\par
\pard\outlinelevel1 Heading 2\par
\pard\outlinelevel2 Heading 3\par
\pard Normal text\par
}`;
const html2 = rtfToHtml(rtf2, { codePage: 'windows-1252' });
console.log('HTML:', html2);
if (html2.includes('<h1>') && html2.includes('<h2>') && html2.includes('<h3>')) {
  console.log('✅ PASS - h1, h2, h3 created\n');
} else {
  console.log('❌ FAIL - Missing heading tags\n');
}

// Test 3: Heading with formatting
console.log('Test 3: Heading with Bold Text');
const rtf3 = String.raw`{\rtf1\ansi\deff0
\pard\outlinelevel0\b Bold Heading 1\b0\par
\pard Normal paragraph\par
}`;
const html3 = rtfToHtml(rtf3, { codePage: 'windows-1252' });
console.log('HTML:', html3);
if (html3.includes('<h1>') && html3.includes('<strong>')) {
  console.log('✅ PASS - Heading with bold formatting\n');
} else {
  console.log('❌ FAIL\n');
}

// Test 4: All heading levels (0-5 for h1-h6)
console.log('Test 4: All Heading Levels (h1-h6)');
const rtf4 = String.raw`{\rtf1\ansi\deff0
\pard\outlinelevel0 Heading 1\par
\pard\outlinelevel1 Heading 2\par
\pard\outlinelevel2 Heading 3\par
\pard\outlinelevel3 Heading 4\par
\pard\outlinelevel4 Heading 5\par
\pard\outlinelevel5 Heading 6\par
\pard\outlinelevel6 Also Heading 6\par
\pard Normal\par
}`;
const html4 = rtfToHtml(rtf4, { codePage: 'windows-1252' });
console.log('HTML (partial):', html4.substring(0, 200) + '...');
const h1Count = (html4.match(/<h1>/g) || []).length;
const h2Count = (html4.match(/<h2>/g) || []).length;
const h3Count = (html4.match(/<h3>/g) || []).length;
const h4Count = (html4.match(/<h4>/g) || []).length;
const h5Count = (html4.match(/<h5>/g) || []).length;
const h6Count = (html4.match(/<h6>/g) || []).length;

console.log(`Counts: h1=${h1Count}, h2=${h2Count}, h3=${h3Count}, h4=${h4Count}, h5=${h5Count}, h6=${h6Count}`);

if (h1Count === 1 && h2Count === 1 && h3Count === 1 && 
    h4Count === 1 && h5Count === 1 && h6Count === 2) {
  console.log('✅ PASS - All heading levels correct\n');
} else {
  console.log('❌ FAIL - Incorrect heading counts\n');
}

// Test 5: Heading with alignment
console.log('Test 5: Centered Heading');
const rtf5 = String.raw`{\rtf1\ansi\deff0
\pard\qc\outlinelevel0 Centered Heading 1\par
\pard Normal text\par
}`;
const html5 = rtfToHtml(rtf5, { codePage: 'windows-1252' });
console.log('HTML:', html5);
if (html5.includes('<h1') && html5.includes('text-align:center')) {
  console.log('✅ PASS - Centered heading\n');
} else {
  console.log('❌ FAIL\n');
}

console.log('========================================');
console.log('Heading Support Tests Complete!');
console.log('========================================');
