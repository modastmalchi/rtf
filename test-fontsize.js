const {htmlToRtf} = require('./lib/rtf-converter');

const html = '<ul><li><span style="font-family:B Nazanin;font-size:12pt">1</span></li></ul>';
console.log('HTML:', html);
const rtf = htmlToRtf(html);
console.log('RTF:', rtf);
console.log('\nHas \\fs:', rtf.includes('\\fs'));
