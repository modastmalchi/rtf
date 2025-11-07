// Test font parsing
const fontTableContent = '{\\f0\\fcharset178 Tahoma;';
const fontRegex = /\{\\f(\d+)(?:\\([a-z]+))?(?:\\fcharset(\d+))?\s+([^;}]+);?\}/g;

let match = fontRegex.exec(fontTableContent);
console.log('Match result:', match);

// بیاید یه regex ساده‌تر امتحان کنیم
const simpleRegex = /\\f(\d+).*?\\fcharset(\d+)\s+([^;}]+)/;
match = fontTableContent.match(simpleRegex);
console.log('Simple match:', match);
