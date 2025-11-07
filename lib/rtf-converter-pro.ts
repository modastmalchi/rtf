/**
 * RTF to HTML Converter - Professional Edition
 * تبدیل کامل و حرفه‌ای RTF به HTML
 */

interface FontInfo {
  name: string;
  charset: number;
  family: string;
}

interface ColorInfo {
  red: number;
  green: number;
  blue: number;
}

interface FormattingState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  superscript: boolean;
  subscript: boolean;
  color: number | null;
  backgroundColor: number | null;
  font: number;
  fontSize: number;
  alignment: 'left' | 'right' | 'center' | 'justify';
  isRtl: boolean;
}

interface ParseResult {
  html: string;
  fonts: Map<number, FontInfo>;
  colors: ColorInfo[];
}

class RtfParser {
  private fonts: Map<number, FontInfo> = new Map();
  private colors: ColorInfo[] = [];
  private state: FormattingState;
  private stateStack: FormattingState[] = [];
  private openTags: string[] = [];
  private content: string = '';
  private position: number = 0;

  constructor() {
    this.state = this.createDefaultState();
  }

  private createDefaultState(): FormattingState {
    return {
      bold: false,
      italic: false,
      underline: false,
      strike: false,
      superscript: false,
      subscript: false,
      color: null,
      backgroundColor: null,
      font: 0,
      fontSize: 24,
      alignment: 'right',
      isRtl: true
    };
  }

  private cloneState(state: FormattingState): FormattingState {
    return { ...state };
  }

  public parse(rtf: string): string {
    // 1. پارس Font Table
    this.parseFontTable(rtf);
    
    // 2. پارس Color Table
    this.parseColorTable(rtf);
    
    // 3. استخراج محتوای اصلی
    this.content = this.extractMainContent(rtf);
    this.position = 0;
    
    // 4. پارس محتوا
    let html = '';
    
    while (this.position < this.content.length) {
      html += this.parseNext();
    }
    
    // 5. بستن تگ‌های باقیمانده
    html += this.closeAllTags();
    
    // 6. wrap در div
    return this.wrapInDiv(html);
  }

  private parseFontTable(rtf: string): void {
    const fontTableMatch = rtf.match(/\{\\fonttbl([\s\S]*?)\}\}/);
    if (!fontTableMatch) return;

    let fontTableContent = fontTableMatch[1];
    
    // حذف آکولاد‌های اضافی اگر وجود دارند
    fontTableContent = fontTableContent.replace(/^\{/, '').replace(/\}$/, '');
    
    // پارس هر فونت - با split بر اساس {\f
    const fontStrings = fontTableContent.split(/(?=\\f\d)/);
    
    for (const fontStr of fontStrings) {
      if (!fontStr.trim() || !fontStr.includes('\\f')) continue;
      
      // شماره فونت
      const numMatch = fontStr.match(/\\f(\d+)/);
      if (!numMatch) continue;
      const fontNum = parseInt(numMatch[1]);
      
      // charset
      const charsetMatch = fontStr.match(/\\fcharset(\d+)/);
      const charset = charsetMatch ? parseInt(charsetMatch[1]) : 0;
      
      // family
      const familyMatch = fontStr.match(/\\f(nil|roman|swiss|modern|script|decor)/);
      const family = familyMatch ? familyMatch[0] : 'fnil';
      
      // نام فونت - بعد از control words و قبل از ;
      const nameMatch = fontStr.match(/(?:fcharset\d+|f(?:nil|roman|swiss|modern|script|decor))\s+([^;{}\\\n]+)/);
      const fontName = nameMatch ? nameMatch[1].trim() : 'Arial';
      
      this.fonts.set(fontNum, { name: fontName, charset, family });
    }
  }

  private parseColorTable(rtf: string): void {
    const colorTableMatch = rtf.match(/\{\\colortbl\s*;([\s\S]*?)\}/);
    if (!colorTableMatch) return;

    const colorTableContent = colorTableMatch[1];
    const colorRegex = /\\red(\d+)\\green(\d+)\\blue(\d+);/g;
    let match;
    
    while ((match = colorRegex.exec(colorTableContent)) !== null) {
      this.colors.push({
        red: parseInt(match[1]),
        green: parseInt(match[2]),
        blue: parseInt(match[3])
      });
    }
  }

  private extractMainContent(rtf: string): string {
    let content = rtf;
    
    // حذف font table
    content = content.replace(/\{\\fonttbl[\s\S]*?\}\}/g, '');
    
    // حذف color table
    content = content.replace(/\{\\colortbl[\s\S]*?\}/g, '');
    
    // حذف stylesheet
    content = content.replace(/\{\\stylesheet[\s\S]*?\}/g, '');
    
    // حذف info
    content = content.replace(/\{\\info[\s\S]*?\}/g, '');
    
    // حذف header commands
    content = content.replace(/\\rtf\d+/g, '');
    content = content.replace(/\\ansi\w*/g, '');
    content = content.replace(/\\deff\d+/g, '');
    content = content.replace(/\\deflang\d+/g, '');
    content = content.replace(/\\fbidis/g, '');
    content = content.replace(/\\ansicpg\d+/g, '');
    
    return content.trim();
  }

  private parseNext(): string {
    const char = this.content[this.position];
    
    // Control Word or Symbol
    if (char === '\\') {
      return this.parseControlWord();
    }
    
    // Group Start
    if (char === '{') {
      this.position++;
      // Save state
      this.stateStack.push(this.cloneState(this.state));
      return '';
    }
    
    // Group End
    if (char === '}') {
      this.position++;
      // Restore state
      if (this.stateStack.length > 0) {
        const oldState = this.state;
        this.state = this.stateStack.pop()!;
        // Update HTML based on state changes
        return this.syncStateToHtml(oldState, this.state);
      }
      return '';
    }
    
    // Plain Text
    if (char !== '\n' && char !== '\r') {
      this.position++;
      return this.escapeHtml(char);
    }
    
    this.position++;
    return '';
  }

  private parseControlWord(): string {
    this.position++; // Skip '\'
    
    // Special characters
    if (this.position >= this.content.length) return '';
    
    const nextChar = this.content[this.position];
    
    // Escaped characters
    if (nextChar === '\\' || nextChar === '{' || nextChar === '}') {
      this.position++;
      return this.escapeHtml(nextChar);
    }
    
    // Hex character
    if (nextChar === "'") {
      return this.parseHexChar();
    }
    
    // Control symbol
    if (!this.isAlpha(nextChar)) {
      this.position++;
      return this.handleControlSymbol(nextChar);
    }
    
    // Control word
    let word = '';
    while (this.position < this.content.length && this.isAlpha(this.content[this.position])) {
      word += this.content[this.position];
      this.position++;
    }
    
    // Parameter
    let param: number | null = null;
    if (this.position < this.content.length && (this.content[this.position] === '-' || this.isDigit(this.content[this.position]))) {
      let paramStr = '';
      if (this.content[this.position] === '-') {
        paramStr += '-';
        this.position++;
      }
      while (this.position < this.content.length && this.isDigit(this.content[this.position])) {
        paramStr += this.content[this.position];
        this.position++;
      }
      param = parseInt(paramStr);
    }
    
    // Skip space after control word
    if (this.position < this.content.length && this.content[this.position] === ' ') {
      this.position++;
    }
    
    return this.handleControlWord(word, param);
  }

  private parseHexChar(): string {
    this.position++; // Skip "'"
    
    if (this.position + 1 >= this.content.length) return '';
    
    const hexCode = this.content.substring(this.position, this.position + 2);
    this.position += 2;
    
    try {
      const charCode = parseInt(hexCode, 16);
      
      // برای فارسی باید از windows-1256 استفاده کنیم
      const currentFont = this.fonts.get(this.state.font);
      
      // Debug
      if (process.env.DEBUG) {
        console.log(`Hex: ${hexCode}, Code: ${charCode}, Font: ${this.state.font}, Charset: ${currentFont?.charset}`);
      }
      
      if (currentFont && currentFont.charset === 178) {
        // Windows-1256 (Arabic/Persian)
        return this.decodeWindows1256(charCode);
      }
      
      return String.fromCharCode(charCode);
    } catch (e) {
      return '';
    }
  }

  private decodeWindows1256(code: number): string {
    // نقشه کامل Windows-1256 (CP1256)
    const cp1256Map: { [key: number]: string } = {
      // حروف فارسی/عربی اصلی
      0xC1: 'آ', 0xC2: 'أ', 0xC3: 'ؤ', 0xC4: 'إ', 0xC5: 'ئ', 0xC6: 'ا',
      0xC7: 'ا', 0xC8: 'ب', 0xC9: 'ة', 0xCA: 'ت', 0xCB: 'ث',
      0xCC: 'ج', 0xCD: 'ح', 0xCE: 'خ', 0xCF: 'د', 0xD0: 'ذ',
      0xD1: 'ر', 0xD2: 'ز', 0xD3: 'س', 0xD4: 'ش', 0xD5: 'ص',
      0xD6: 'ض', 0xD7: 'ط', 0xD8: 'ط', 0xD9: 'ظ', 0xDA: 'ع',
      0xDB: 'غ', 0xDC: 'ـ', 0xDD: 'ف', 0xDE: 'ق', 0xDF: 'ك',
      0xE0: 'ك', 0xE1: 'ل', 0xE2: 'م', 0xE3: 'م', 0xE4: 'ن',
      0xE5: 'ه', 0xE6: 'و', 0xE7: 'ى', 0xE8: 'ى', 0xE9: 'ى',
      0xEA: 'ى', 0xEB: 'ى', 0xEC: 'ى', 0xED: 'ي', 0xEE: 'ي',
      0xEF: 'ي', 0xF0: 'ً', 0xF1: 'ّ', 0xF2: 'ٔ', 0xF3: 'ٕ',
      0xF4: 'ٖ', 0xF5: 'ٗ', 0xF6: '٘', 0xF7: 'ٙ', 0xF8: 'ٚ',
      0xF9: 'ٛ', 0xFA: 'ٜ', 0xFB: 'ٝ', 0xFC: 'ٞ', 0xFD: 'ٟ',
      // حروف خاص
      0x8C: 'چ', 0x8D: 'پ', 0x8E: 'ژ', 0x8F: 'گ',
      // ارقام فارسی
      0xB0: '۰', 0xB1: '۱', 0xB2: '۲', 0xB3: '۳', 0xB4: '۴',
      0xB5: '۵', 0xB6: '۶', 0xB7: '۷', 0xB8: '۸', 0xB9: '۹',
      // علائم
      0xA0: '\u00A0', // NBSP
      0xA1: '،', 0xA2: '¢', 0xA3: '£', 0xA4: '¤', 0xA5: '¥',
      0xA6: '¦', 0xA7: '§', 0xA8: '¨', 0xA9: '©', 0xAA: 'ª',
      0xAB: '«', 0xAC: '¬', 0xAD: '\u00AD', 0xAE: '®', 0xAF: '¯',
      0xBB: '»', 0xBF: '؟',
      // فاصله و کاراکترهای کنترلی
      0x20: ' ', 0x09: '\t', 0x0A: '\n', 0x0D: '\r'
    };
    
    // اگر توی map بود برگردون، وگرنه خود کاراکتر
    if (cp1256Map[code]) {
      return cp1256Map[code];
    }
    
    // برای کاراکترهای ASCII معمولی (0x20-0x7E)
    if (code >= 0x20 && code <= 0x7E) {
      return String.fromCharCode(code);
    }
    
    // اگر هیچکدوم نبود، خام برگردون
    return String.fromCharCode(code);
  }

  private handleControlSymbol(symbol: string): string {
    switch (symbol) {
      case '~': return '&nbsp;'; // non-breaking space
      case '-': return '&shy;';  // optional hyphen
      case '_': return '‑';      // non-breaking hyphen
      default: return '';
    }
  }

  private handleControlWord(word: string, param: number | null): string {
    let html = '';
    
    // Unicode
    if (word === 'u' && param !== null) {
      const unicode = param < 0 ? param + 65536 : param;
      // Skip the fallback character (معمولاً ? هست)
      if (this.position < this.content.length && this.content[this.position] !== '\\' && this.content[this.position] !== ' ') {
        this.position++;
      }
      return String.fromCharCode(unicode);
    }
    
    // Paragraph
    if (word === 'par' || word === 'line') {
      html += this.closeInlineTags();
      html += '<br>';
      html += this.reopenInlineTags();
      return html;
    }
    
    // Bold
    if (word === 'b') {
      if (param === 0 || param === null && this.state.bold) {
        if (this.state.bold) {
          html += this.closeTag('b');
          this.state.bold = false;
        }
      } else {
        if (!this.state.bold) {
          html += '<b>';
          this.openTags.push('b');
          this.state.bold = true;
        }
      }
      return html;
    }
    
    // Italic
    if (word === 'i') {
      if (param === 0 || param === null && this.state.italic) {
        if (this.state.italic) {
          html += this.closeTag('i');
          this.state.italic = false;
        }
      } else {
        if (!this.state.italic) {
          html += '<i>';
          this.openTags.push('i');
          this.state.italic = true;
        }
      }
      return html;
    }
    
    // Underline
    if (word === 'ul') {
      if (param === 0) {
        if (this.state.underline) {
          html += this.closeTag('u');
          this.state.underline = false;
        }
      } else {
        if (!this.state.underline) {
          html += '<u>';
          this.openTags.push('u');
          this.state.underline = true;
        }
      }
      return html;
    }
    
    if (word === 'ulnone') {
      if (this.state.underline) {
        html += this.closeTag('u');
        this.state.underline = false;
      }
      return html;
    }
    
    // Strike
    if (word === 'strike') {
      if (param === 0) {
        if (this.state.strike) {
          html += this.closeTag('s');
          this.state.strike = false;
        }
      } else {
        if (!this.state.strike) {
          html += '<s>';
          this.openTags.push('s');
          this.state.strike = true;
        }
      }
      return html;
    }
    
    // Superscript
    if (word === 'super') {
      if (!this.state.superscript) {
        html += '<sup>';
        this.openTags.push('sup');
        this.state.superscript = true;
      }
      return html;
    }
    
    // Subscript
    if (word === 'sub') {
      if (!this.state.subscript) {
        html += '<sub>';
        this.openTags.push('sub');
        this.state.subscript = true;
      }
      return html;
    }
    
    if (word === 'nosupersub') {
      if (this.state.superscript) {
        html += this.closeTag('sup');
        this.state.superscript = false;
      }
      if (this.state.subscript) {
        html += this.closeTag('sub');
        this.state.subscript = false;
      }
      return html;
    }
    
    // Color
    if (word === 'cf' && param !== null) {
      if (this.state.color !== null) {
        html += this.closeTag('color');
      }
      
      if (param > 0 && param <= this.colors.length) {
        const color = this.colors[param - 1];
        const colorStr = `rgb(${color.red}, ${color.green}, ${color.blue})`;
        html += `<span style="color: ${colorStr};">`;
        this.openTags.push('color');
        this.state.color = param;
      } else {
        this.state.color = null;
      }
      return html;
    }
    
    // Background Color
    if (word === 'highlight' && param !== null) {
      if (this.state.backgroundColor !== null) {
        html += this.closeTag('bg');
      }
      
      if (param > 0 && param <= this.colors.length) {
        const color = this.colors[param - 1];
        const colorStr = `rgb(${color.red}, ${color.green}, ${color.blue})`;
        html += `<span style="background-color: ${colorStr};">`;
        this.openTags.push('bg');
        this.state.backgroundColor = param;
      } else {
        this.state.backgroundColor = null;
      }
      return html;
    }
    
    // Font
    if (word === 'f' && param !== null) {
      this.state.font = param;
      return html;
    }
    
    // Font Size
    if (word === 'fs' && param !== null) {
      this.state.fontSize = param;
      return html;
    }
    
    // Alignment
    if (word === 'qr') {
      this.state.alignment = 'right';
      return html;
    }
    if (word === 'ql') {
      this.state.alignment = 'left';
      return html;
    }
    if (word === 'qc') {
      this.state.alignment = 'center';
      return html;
    }
    if (word === 'qj') {
      this.state.alignment = 'justify';
      return html;
    }
    
    // RTL/LTR
    if (word === 'rtlpar' || word === 'rtlch') {
      this.state.isRtl = true;
      return html;
    }
    if (word === 'ltrpar' || word === 'ltrch') {
      this.state.isRtl = false;
      return html;
    }
    
    // Special characters
    if (word === 'bullet') return '•';
    if (word === 'tab') return '&nbsp;&nbsp;&nbsp;&nbsp;';
    if (word === 'emdash') return '—';
    if (word === 'endash') return '–';
    if (word === 'lquote') return '\u2018';
    if (word === 'rquote') return '\u2019';
    if (word === 'ldblquote') return '\u201C';
    if (word === 'rdblquote') return '\u201D';
    
    return html;
  }

  private closeTag(tagType: string): string {
    const index = this.openTags.lastIndexOf(tagType);
    if (index === -1) return '';
    
    this.openTags.splice(index, 1);
    
    if (tagType === 'b') return '</b>';
    if (tagType === 'i') return '</i>';
    if (tagType === 'u') return '</u>';
    if (tagType === 's') return '</s>';
    if (tagType === 'sup') return '</sup>';
    if (tagType === 'sub') return '</sub>';
    if (tagType === 'color' || tagType === 'bg') return '</span>';
    
    return '';
  }

  private closeInlineTags(): string {
    let html = '';
    for (let i = this.openTags.length - 1; i >= 0; i--) {
      const tag = this.openTags[i];
      if (tag === 'b') html += '</b>';
      else if (tag === 'i') html += '</i>';
      else if (tag === 'u') html += '</u>';
      else if (tag === 's') html += '</s>';
      else if (tag === 'sup') html += '</sup>';
      else if (tag === 'sub') html += '</sub>';
      else if (tag === 'color' || tag === 'bg') html += '</span>';
    }
    return html;
  }

  private reopenInlineTags(): string {
    let html = '';
    for (const tag of this.openTags) {
      if (tag === 'b' && this.state.bold) {
        html += '<b>';
      } else if (tag === 'i' && this.state.italic) {
        html += '<i>';
      } else if (tag === 'u' && this.state.underline) {
        html += '<u>';
      } else if (tag === 's' && this.state.strike) {
        html += '<s>';
      } else if (tag === 'sup' && this.state.superscript) {
        html += '<sup>';
      } else if (tag === 'sub' && this.state.subscript) {
        html += '<sub>';
      } else if (tag === 'color' && this.state.color !== null && this.state.color > 0 && this.state.color <= this.colors.length) {
        const color = this.colors[this.state.color - 1];
        html += `<span style="color: rgb(${color.red}, ${color.green}, ${color.blue});">`;
      } else if (tag === 'bg' && this.state.backgroundColor !== null && this.state.backgroundColor > 0 && this.state.backgroundColor <= this.colors.length) {
        const color = this.colors[this.state.backgroundColor - 1];
        html += `<span style="background-color: rgb(${color.red}, ${color.green}, ${color.blue});">`;
      }
    }
    return html;
  }

  private closeAllTags(): string {
    let html = '';
    for (let i = this.openTags.length - 1; i >= 0; i--) {
      const tag = this.openTags[i];
      if (tag === 'b') html += '</b>';
      else if (tag === 'i') html += '</i>';
      else if (tag === 'u') html += '</u>';
      else if (tag === 's') html += '</s>';
      else if (tag === 'sup') html += '</sup>';
      else if (tag === 'sub') html += '</sub>';
      else if (tag === 'color' || tag === 'bg') html += '</span>';
    }
    this.openTags = [];
    return html;
  }

  private syncStateToHtml(oldState: FormattingState, newState: FormattingState): string {
    // این تابع state تغییرات رو به HTML sync می‌کنه
    // وقتی از یه group خارج میشیم
    return '';
  }

  private wrapInDiv(html: string): string {
    const dir = this.state.isRtl ? 'rtl' : 'ltr';
    return `<div dir="${dir}" style="font-family: Tahoma, Arial; font-size: 12pt;">${html}</div>`;
  }

  private escapeHtml(char: string): string {
    switch (char) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return char;
    }
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /\d/.test(char);
  }
}

// Export function
export function rtfToHtml(rtf: string): string {
  const parser = new RtfParser();
  return parser.parse(rtf);
}
