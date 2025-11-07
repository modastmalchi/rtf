// Debug: ببینیم font table چی parse میشه
const rtf = `{\\rtf1\\ansi\\ansicpg1256\\deff0
{\\fonttbl{\\f0\\fcharset178 Tahoma;}}
\\f0 \\'d3\\'e1\\'c7\\'e3
}`;

// Manual parse
const fontTableMatch = rtf.match(/\{\\fonttbl([\s\S]*?)\}\}/);
console.log('Font Table Match:', fontTableMatch);

if (fontTableMatch) {
  const content = fontTableMatch[1];
  console.log('Font Table Content:', content);
  
  const fontRegex = /\{\\f(\d+)\\([a-z]+)(?:\\fcharset(\d+))?\s+([^;}]+);?\}/g;
  let match;
  
  while ((match = fontRegex.exec(content)) !== null) {
    console.log('Font:', {
      num: match[1],
      family: match[2],
      charset: match[3],
      name: match[4]
    });
  }
}
