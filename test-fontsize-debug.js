const {htmlToRtf} = require('./lib/rtf-converter');

const html1 = '<li><span style="font-size:12pt">Test</span></li>';
console.log('Test 1: li with span font-size');
console.log('HTML:', html1);
console.log('RTF:', htmlToRtf(html1));
console.log();

const html2 = '<ul><li><span style="font-size:12pt">Test</span></li></ul>';
console.log('Test 2: ul > li > span font-size');
console.log('HTML:', html2);
console.log('RTF:', htmlToRtf(html2));
console.log();

const html3 = '<p><span style="font-size:12pt">Test</span></p>';
console.log('Test 3: p > span font-size');
console.log('HTML:', html3);
console.log('RTF:', htmlToRtf(html3));
