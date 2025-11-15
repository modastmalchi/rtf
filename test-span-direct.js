const {htmlToRtf} = require('./lib/rtf-converter');

// Direct test - simulate what parseNode should do
const html = '<span style="font-size:12pt">Test</span>';
console.log('HTML:', html);

// Use JSDOM to parse
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(html);
const span = dom.window.document.querySelector('span');

console.log('Span style:', span.getAttribute('style'));
console.log('Text content:', span.textContent);

// Now test the actual function
const rtf = htmlToRtf(html);
console.log('\nGenerated RTF:', rtf);
console.log('Has \\fs:', rtf.includes('\\fs'));
