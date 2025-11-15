const { rtfToHtml } = require('./lib/rtf-converter');

console.log('Test 1: Simple list without pard between items');
const rtf1 = '{\\rtf1\\ansi \\bullet\\tab Item 1\\par \\bullet\\tab Item 2\\par}';
console.log('RTF:', rtf1);
console.log('HTML:', rtfToHtml(rtf1));
console.log();

console.log('Test 2: List WITH pard between items (from htmlToRtf)');
const rtf2 = '{\\rtf1\\ansi\\pard \\bullet\\tab Item 1\\par\\pard \\bullet\\tab Item 2\\par}';
console.log('RTF:', rtf2);
console.log('HTML:', rtfToHtml(rtf2));
console.log();

console.log('Test 3: What htmlToRtf generates');
const { htmlToRtf } = require('./lib/rtf-converter');
const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
console.log('HTML:', html);
const rtfGenerated = htmlToRtf(html);
console.log('Generated RTF:', rtfGenerated);
