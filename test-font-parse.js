// Direct test
const RtfParser = require('./lib/rtf-converter-pro.js').RtfParser;

// نمی‌تونیم مستقیم دسترسی داشته باشیم، پس خودمون parse میکنیم
const rtf = `{\\rtf1\\ansi\\ansicpg1256\\deff0
{\\fonttbl{\\f0\\fcharset178 Tahoma;}}
\\f0 \\'d3\\'e1\\'c7\\'e3
}`;

// Font Table Parsing
const fontTableMatch = rtf.match(/\{\\fonttbl([\s\S]*?)\}\}/);
console.log('Font Table Match:', fontTableMatch);

if (fontTableMatch) {
  const fontTableContent = fontTableMatch[1];
  console.log('Font Table Content:', fontTableContent);
  
  const fonts = fontTableContent.match(/\{[^}]+\}/g);
  console.log('Fonts array:', fonts);
  
  if (fonts) {
    for (const fontStr of fonts) {
      console.log('\nProcessing font:', fontStr);
      
      const numMatch = fontStr.match(/\\f(\d+)/);
      console.log('Num match:', numMatch);
      
      const charsetMatch = fontStr.match(/\\fcharset(\d+)/);
      console.log('Charset match:', charsetMatch);
      
      const nameMatch = fontStr.match(/\s+([^;\\]+);?/);
      console.log('Name match:', nameMatch);
    }
  }
}
