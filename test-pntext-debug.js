/**
 * Detailed test to see exactly what's happening
 */

const { rtfToHtml } = require('./lib/rtf-converter');

const rtf = String.raw`{\rtf1\ansi{\pntext\f0\'B7\tab}Test}`;

console.log('Simple RTF:', rtf);
console.log('Output:', rtfToHtml(rtf));
console.log('');

const rtf2 = String.raw`{\rtf1\ansi\pard{\pntext \'B7\tab}{\*\pn}Item 1\par}`;

console.log('RTF with pntext and *pn:', rtf2);
console.log('Output:', rtfToHtml(rtf2));
