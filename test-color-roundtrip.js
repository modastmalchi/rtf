const {htmlToRtf, rtfToHtml} = require('./lib/rtf-converter');

console.log('=== Round-trip color test ===\n');

const html = '<p><span style="color:red">Red</span> and <span style="color:blue">Blue</span></p>';
console.log('Original HTML:', html);

const rtf = htmlToRtf(html);
console.log('\nGenerated RTF:');
console.log(rtf);

const back = rtfToHtml(rtf);
console.log('\nBack to HTML:', back);

console.log('\n=== Check color preservation ===');
console.log('Has red span:', back.includes('style="color:rgb(255,0,0)"') || back.includes('color:red'));
console.log('Has blue span:', back.includes('style="color:rgb(0,0,255)"') || back.includes('color:blue'));
