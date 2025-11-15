// Quick debug version
const fs = require('fs');
let code = fs.readFileSync('lib/rtf-converter.ts', 'utf8');

// Add debug log
code = code.replace(
  `if (word === 'pntext' || word === 'bullet') {`,
  `if (word === 'pntext' || word === 'bullet') {
                  console.log('[DEBUG] Found', word, 'after pard - NOT ending list');`
);

code = code.replace(
  `if (isPardEndingList && inList) {`,
  `console.log('[DEBUG] pard: isPardEndingList=', isPardEndingList, 'inList=', inList);
            if (isPardEndingList && inList) {`
);

fs.writeFileSync('lib/rtf-converter-debug.ts', code);
console.log('Debug version created');
