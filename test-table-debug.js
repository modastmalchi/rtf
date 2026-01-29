const { rtfToHtml } = require('./lib/rtf-converter');

// یک جدول ساده برای دیباگ
const simpleTableRtf = String.raw`{\rtf1\ansi
\trowd\cellx2000\cellx4000
\intbl Cell 1\cell Cell 2\cell\row
\trowd\cellx2000\cellx4000
\intbl Cell 3\cell Cell 4\cell\row
\pard
}`;

console.log('🧪 Testing Simple Table Structure...\n');
console.log('RTF Input:');
console.log(simpleTableRtf);
console.log('\n');

const html = rtfToHtml(simpleTableRtf);
console.log('HTML:');
console.log(html);
console.log('\n');

// Pretty print for readability
const formatted = html
  .replace(/<table/g, '\n<table')
  .replace(/<tr>/g, '\n  <tr>')
  .replace(/<\/tr>/g, '\n  </tr>')
  .replace(/<td/g, '\n    <td')
  .replace(/<\/td>/g, '</td>')
  .replace(/<\/table>/g, '\n</table>');

console.log('Formatted HTML:');
console.log(formatted);
