const { rtfToHtml } = require('./lib/rtf-converter.js');

// Test: Bold starts in first paragraph and continues across \par to second paragraph
const rtf = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Times New Roman;}}
\\f0\\fs24
This is normal text in the first paragraph. \\b Now the bold starts here and continues...
\\par
...and the bold continues in this second paragraph until here.\\b0 Now it's normal again.
\\par
This is the third paragraph with normal text.
}`;

console.log('========================================');
console.log('Test: Bold across \\par boundary');
console.log('========================================\n');

console.log('RTF Input:');
console.log(rtf);
console.log('\n');

const html = rtfToHtml(rtf, { codePage: 'windows-1252' });

console.log('HTML Output:');
console.log(html);
console.log('\n');

// Expected behavior:
// Paragraph 1: "This is normal text in the first paragraph. " + <strong>"Now the bold starts here and continues..."</strong>
// Paragraph 2: <strong>"...and the bold continues in this second paragraph until here."</strong> + "Now it's normal again."
// Paragraph 3: "This is the third paragraph with normal text."

console.log('Expected:');
console.log('- Paragraph 1 ends with bold text');
console.log('- Paragraph 2 starts with bold, then becomes normal');
console.log('- Paragraph 3 is all normal text');
console.log('\nChecking...');

if (html.includes('<strong>Now the bold starts here and continues...</strong>')) {
  console.log('✅ First paragraph ends with bold');
} else {
  console.log('❌ First paragraph bold not working');
}

if (html.includes('<strong>...and the bold continues in this second paragraph until here.</strong>')) {
  console.log('✅ Second paragraph starts with bold and ends correctly');
} else {
  console.log('❌ Second paragraph bold not working');
}

if (html.includes('Now it\'s normal again.') && !html.includes('<strong>Now it\'s normal again.</strong>')) {
  console.log('✅ Bold correctly ends in paragraph 2');
} else {
  console.log('❌ Bold did not end correctly');
}

if (html.includes('This is the third paragraph with normal text.') && 
    !html.includes('<strong>This is the third paragraph with normal text.</strong>')) {
  console.log('✅ Paragraph 3 is normal text');
} else {
  console.log('❌ Paragraph 3 should be normal');
}

console.log('\n========================================');
console.log('Test Complete');
console.log('========================================');
