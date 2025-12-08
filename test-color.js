const {htmlToRtf, rtfToHtml} = require('./lib/rtf-converter');

console.log('Test 1: Red color');
const html1 = '<p><span style="color:red">Red text</span></p>';
console.log('HTML:', html1);
const rtf1 = htmlToRtf(html1);
console.log('RTF:', rtf1);
const back1 = rtfToHtml(rtf1);
console.log('Back:', back1);
console.log();

console.log('Test 2: RGB color');
const html2 = '<p><span style="color:rgb(255,0,0)">Red RGB</span></p>';
console.log('HTML:', html2);
const rtf2 = htmlToRtf(html2);
console.log('RTF:', rtf2);
console.log();

console.log('Test 3: Hex color');
const html3 = '<p><span style="color:#ff0000">Red Hex</span></p>';
console.log('HTML:', html3);
const rtf3 = htmlToRtf(html3);
console.log('RTF:', rtf3);
