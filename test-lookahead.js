// Simulate look ahead logic
const rtf = '{\\rtf1\\ansi\\pard \\bullet\\tab Item 1\\par\\pard \\bullet\\tab Item 2\\par}';

// Position after second \pard
const firstPard = rtf.indexOf('\\pard');
let i = rtf.indexOf('\\pard', firstPard + 1); // Find second pard
console.log('Second \\pard at position:', i);
console.log('String from there:', rtf.substring(i, i + 20));

let tempI = i + 4; // After 'pard'
let isPardEndingList = true;
const len = rtf.length;

console.log('\n--- Starting look ahead from position', tempI, '---');

while (tempI < len && isPardEndingList) {
  tempI++;
  const ch = rtf[tempI];
  console.log(`Position ${tempI}: char='${ch}' (code ${ch.charCodeAt(0)})`);
  
  if (ch === '\\') {
    const wordStart = tempI + 1;
    let wordEnd = wordStart;
    while (wordEnd < len && /[a-z]/.test(rtf[wordEnd])) {
      wordEnd++;
    }
    const word = rtf.substring(wordStart, wordEnd);
    console.log(`  Found command: \\${word}`);
    
    if (word === 'pntext' || word === 'bullet') {
      console.log(`  ✅ Found ${word} - NOT ending list!`);
      isPardEndingList = false;
      break;
    }
    
    if (word && word !== 'rtlpar' && word !== 'ltrpar' && word !== 'fi' && word !== 'ri' && word !== 'qr' && word !== 'ql' && word !== 'qc') {
      console.log(`  ⚠️ Hit other command '${word}' - stopping`);
      break;
    }
    tempI = wordEnd;
  } else if (ch === '{' || ch === '}') {
    console.log(`  ⚠️ Hit group delimiter '${ch}' - stopping`);
    break;
  } else if (ch !== ' ' && ch !== '\n' && ch !== '\r' && ch !== '\t') {
    console.log(`  ⚠️ Hit text '${ch}' - list ends`);
    break;
  }
}

console.log('\n--- Final result ---');
console.log('isPardEndingList:', isPardEndingList);
