"use strict";
/**
 * RTF to HTML Converter - Final Professional Edition
 * نسخه نهایی با handling کامل تمام edge cases
 *
 * @author RTF Converter Team
 * @version 5.0.0
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rtfToHtml = rtfToHtml;
exports.rtfToHex = rtfToHex;
exports.hexToRtf = hexToRtf;
exports.htmlToRtf = htmlToRtf;
/**
 * Main RTF Parser Class
 * Parser پیشرفته با state management کامل
 */
class RtfParser {
    constructor() {
        this.fonts = new Map();
        this.colors = [];
        this.stateStack = [];
        this.content = '';
        this.position = 0;
        this.html = '';
        this.state = this.createDefaultState();
    }
    /**
     * ایجاد state پیش‌فرض
     */
    createDefaultState() {
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
    /**
     * کپی کردن state برای state stack
     */
    cloneState(state) {
        return JSON.parse(JSON.stringify(state));
    }
    /**
     * Parse اصلی RTF به HTML
     */
    parse(rtf) {
        // 1. پارس Font Table
        this.parseFontTable(rtf);
        // 2. پارس Color Table
        this.parseColorTable(rtf);
        // 3. استخراج محتوای اصلی
        this.content = this.extractMainContent(rtf);
        this.position = 0;
        this.html = '';
        // 4. پارس محتوا
        while (this.position < this.content.length) {
            this.parseNext();
        }
        // 5. بستن تگ‌های باقیمانده
        this.closeAllOpenTags();
        // 6. Wrap در div
        return this.wrapInDiv(this.html);
    }
    /**
     * پارس Font Table با regex های مختلف برای handling همه فرمت‌ها
     */
    parseFontTable(rtf) {
        const fontTableMatch = rtf.match(/\{\\fonttbl([\s\S]*?)\}\}/);
        if (!fontTableMatch)
            return;
        let fontTableContent = fontTableMatch[1];
        // حذف آکولاد‌های اضافی
        fontTableContent = fontTableContent.replace(/^\{/, '').replace(/\}$/, '');
        // Split بر اساس \\f و parse هر فونت
        const fontStrings = fontTableContent.split(/(?=\\f\d)/);
        for (const fontStr of fontStrings) {
            if (!fontStr.trim() || !fontStr.includes('\\f'))
                continue;
            // شماره فونت
            const numMatch = fontStr.match(/\\f(\d+)/);
            if (!numMatch)
                continue;
            const fontNum = parseInt(numMatch[1]);
            // charset
            const charsetMatch = fontStr.match(/\\fcharset(\d+)/);
            const charset = charsetMatch ? parseInt(charsetMatch[1]) : 0;
            // family
            const familyMatch = fontStr.match(/\\f(nil|roman|swiss|modern|script|decor)/);
            const family = familyMatch ? familyMatch[0] : 'fnil';
            // نام فونت
            const nameMatch = fontStr.match(/(?:fcharset\d+|f(?:nil|roman|swiss|modern|script|decor))\s+([^;{}\\\n]+)/);
            const fontName = nameMatch ? nameMatch[1].trim() : 'Arial';
            this.fonts.set(fontNum, { name: fontName, charset, family });
        }
    }
    /**
     * پارس Color Table
     */
    parseColorTable(rtf) {
        const colorTableMatch = rtf.match(/\{\\colortbl\s*;([\s\S]*?)\}/);
        if (!colorTableMatch)
            return;
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
    /**
     * استخراج محتوای اصلی RTF
     */
    extractMainContent(rtf) {
        let content = rtf;
        // حذف font table
        content = content.replace(/\{\\fonttbl[\s\S]*?\}\}/g, '');
        // حذف color table
        content = content.replace(/\{\\colortbl[\s\S]*?\}/g, '');
        // حذف stylesheet
        content = content.replace(/\{\\stylesheet[\s\S]*?\}/g, '');
        // حذف info
        content = content.replace(/\{\\info[\s\S]*?\}/g, '');
        // حذف generator
        content = content.replace(/\{\\*\\generator[\s\S]*?\}/g, '');
        // حذف header commands
        content = content.replace(/\\rtf\d+/g, '');
        content = content.replace(/\\ansi\w*/g, '');
        content = content.replace(/\\deff\d+/g, '');
        content = content.replace(/\\deflang\d+/g, '');
        content = content.replace(/\\fbidis/g, '');
        content = content.replace(/\\ansicpg\d+/g, '');
        return content.trim();
    }
    /**
     * Parse کردن element بعدی
     */
    parseNext() {
        const char = this.content[this.position];
        // Control Word or Symbol
        if (char === '\\') {
            this.parseControlWord();
            return;
        }
        // Group Start
        if (char === '{') {
            this.position++;
            // Save current state
            this.stateStack.push(this.cloneState(this.state));
            return;
        }
        // Group End
        if (char === '}') {
            this.position++;
            // Restore state
            if (this.stateStack.length > 0) {
                const oldState = this.state;
                this.state = this.stateStack.pop();
                // Sync HTML with state changes
                this.syncHtmlWithStateChange(oldState, this.state);
            }
            return;
        }
        // Plain Text
        if (char !== '\n' && char !== '\r') {
            this.html += this.escapeHtml(char);
        }
        this.position++;
    }
    /**
     * Parse کردن Control Word
     */
    parseControlWord() {
        this.position++; // Skip '\'
        if (this.position >= this.content.length)
            return;
        const nextChar = this.content[this.position];
        // Escaped characters
        if (nextChar === '\\' || nextChar === '{' || nextChar === '}') {
            this.position++;
            this.html += this.escapeHtml(nextChar);
            return;
        }
        // Hex character
        if (nextChar === "'") {
            this.parseHexChar();
            return;
        }
        // Control symbol
        if (!this.isAlpha(nextChar)) {
            this.position++;
            this.handleControlSymbol(nextChar);
            return;
        }
        // Control word
        let word = '';
        while (this.position < this.content.length && this.isAlpha(this.content[this.position])) {
            word += this.content[this.position];
            this.position++;
        }
        // Parameter
        let param = null;
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
        this.handleControlWord(word, param);
    }
    /**
     * Parse کردن Hex Character
     */
    parseHexChar() {
        this.position++; // Skip "'"
        if (this.position + 1 >= this.content.length)
            return;
        const hexCode = this.content.substring(this.position, this.position + 2);
        this.position += 2;
        try {
            const charCode = parseInt(hexCode, 16);
            // برای فارسی از Windows-1256 استفاده می‌کنیم
            const currentFont = this.fonts.get(this.state.font);
            if (currentFont && currentFont.charset === 178) {
                this.html += this.decodeWindows1256(charCode);
            }
            else {
                this.html += String.fromCharCode(charCode);
            }
        }
        catch (e) {
            // Ignore invalid hex
        }
    }
    /**
     * Decode کردن Windows-1256 (CP1256) - نقشه کامل
     */
    decodeWindows1256(code) {
        const cp1256Map = {
            // حروف فارسی/عربی
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
            // حروف خاص فارسی
            0x8C: 'چ', 0x8D: 'پ', 0x8E: 'ژ', 0x8F: 'گ',
            // ارقام فارسی
            0xB0: '۰', 0xB1: '۱', 0xB2: '۲', 0xB3: '۳', 0xB4: '۴',
            0xB5: '۵', 0xB6: '۶', 0xB7: '۷', 0xB8: '۸', 0xB9: '۹',
            // علائم
            0xA0: '\u00A0', 0xA1: '،', 0xAB: '«', 0xBB: '»', 0xBF: '؟'
        };
        if (cp1256Map[code])
            return cp1256Map[code];
        if (code >= 0x20 && code <= 0x7E)
            return String.fromCharCode(code);
        return String.fromCharCode(code);
    }
    /**
     * Handle کردن Control Symbol
     */
    handleControlSymbol(symbol) {
        switch (symbol) {
            case '~':
                this.html += '&nbsp;';
                break;
            case '-':
                this.html += '&shy;';
                break;
            case '_':
                this.html += '‑';
                break;
        }
    }
    /**
     * Handle کردن Control Word - قسمت اصلی پردازش
     */
    handleControlWord(word, param) {
        // Unicode
        if (word === 'u' && param !== null) {
            const unicode = param < 0 ? param + 65536 : param;
            // Skip fallback character
            if (this.position < this.content.length &&
                this.content[this.position] !== '\\' &&
                this.content[this.position] !== ' ') {
                this.position++;
            }
            this.html += String.fromCharCode(unicode);
            return;
        }
        // Paragraph
        if (word === 'par' || word === 'line') {
            this.html += '<br>';
            return;
        }
        // Bold
        if (word === 'b') {
            const shouldBeBold = param === null || param !== 0;
            if (shouldBeBold && !this.state.bold) {
                this.html += '<b>';
                this.state.bold = true;
            }
            else if (!shouldBeBold && this.state.bold) {
                this.html += '</b>';
                this.state.bold = false;
            }
            return;
        }
        // Italic
        if (word === 'i') {
            const shouldBeItalic = param === null || param !== 0;
            if (shouldBeItalic && !this.state.italic) {
                this.html += '<i>';
                this.state.italic = true;
            }
            else if (!shouldBeItalic && this.state.italic) {
                this.html += '</i>';
                this.state.italic = false;
            }
            return;
        }
        // Underline
        if (word === 'ul') {
            const shouldBeUnderline = param === null || param !== 0;
            if (shouldBeUnderline && !this.state.underline) {
                this.html += '<u>';
                this.state.underline = true;
            }
            else if (!shouldBeUnderline && this.state.underline) {
                this.html += '</u>';
                this.state.underline = false;
            }
            return;
        }
        if (word === 'ulnone') {
            if (this.state.underline) {
                this.html += '</u>';
                this.state.underline = false;
            }
            return;
        }
        // Strike
        if (word === 'strike') {
            const shouldBeStrike = param === null || param !== 0;
            if (shouldBeStrike && !this.state.strike) {
                this.html += '<s>';
                this.state.strike = true;
            }
            else if (!shouldBeStrike && this.state.strike) {
                this.html += '</s>';
                this.state.strike = false;
            }
            return;
        }
        // Superscript
        if (word === 'super') {
            if (!this.state.superscript) {
                this.html += '<sup>';
                this.state.superscript = true;
            }
            // اگر پارامتر داره (مثل \super2) اون رو هم اضافه کن
            if (param !== null) {
                this.html += param.toString();
            }
            return;
        }
        // Subscript
        if (word === 'sub') {
            if (!this.state.subscript) {
                this.html += '<sub>';
                this.state.subscript = true;
            }
            // اگر پارامتر داره (مثل \sub2) اون رو هم اضافه کن
            if (param !== null) {
                this.html += param.toString();
            }
            return;
        }
        if (word === 'nosupersub') {
            if (this.state.superscript) {
                this.html += '</sup>';
                this.state.superscript = false;
            }
            if (this.state.subscript) {
                this.html += '</sub>';
                this.state.subscript = false;
            }
            return;
        }
        // Color
        if (word === 'cf' && param !== null) {
            if (this.state.color !== null) {
                this.html += '</span>';
            }
            if (param > 0 && param <= this.colors.length) {
                const color = this.colors[param - 1];
                this.html += `<span style="color: rgb(${color.red}, ${color.green}, ${color.blue});">`;
                this.state.color = param;
            }
            else {
                this.state.color = null;
            }
            return;
        }
        // Background Color
        if (word === 'highlight' && param !== null) {
            if (this.state.backgroundColor !== null) {
                this.html += '</span>';
            }
            if (param > 0 && param <= this.colors.length) {
                const color = this.colors[param - 1];
                this.html += `<span style="background-color: rgb(${color.red}, ${color.green}, ${color.blue});">`;
                this.state.backgroundColor = param;
            }
            else {
                this.state.backgroundColor = null;
            }
            return;
        }
        // Font
        if (word === 'f' && param !== null) {
            this.state.font = param;
            return;
        }
        // Font Size
        if (word === 'fs' && param !== null) {
            this.state.fontSize = param;
            return;
        }
        // Alignment
        if (word === 'qr') {
            this.state.alignment = 'right';
            return;
        }
        if (word === 'ql') {
            this.state.alignment = 'left';
            return;
        }
        if (word === 'qc') {
            this.state.alignment = 'center';
            return;
        }
        if (word === 'qj') {
            this.state.alignment = 'justify';
            return;
        }
        // RTL/LTR
        if (word === 'rtlpar' || word === 'rtlch') {
            this.state.isRtl = true;
            return;
        }
        if (word === 'ltrpar' || word === 'ltrch') {
            this.state.isRtl = false;
            return;
        }
        // Special characters
        if (word === 'bullet') {
            this.html += '•';
            return;
        }
        if (word === 'tab') {
            this.html += '&nbsp;&nbsp;&nbsp;&nbsp;';
            return;
        }
        if (word === 'emdash') {
            this.html += '—';
            return;
        }
        if (word === 'endash') {
            this.html += '–';
            return;
        }
        if (word === 'lquote') {
            this.html += '\u2018';
            return;
        }
        if (word === 'rquote') {
            this.html += '\u2019';
            return;
        }
        if (word === 'ldblquote') {
            this.html += '\u201C';
            return;
        }
        if (word === 'rdblquote') {
            this.html += '\u201D';
            return;
        }
    }
    /**
     * Sync کردن HTML با تغییرات state (وقتی از group خارج میشیم)
     */
    syncHtmlWithStateChange(oldState, newState) {
        // Bold
        if (oldState.bold && !newState.bold) {
            this.html += '</b>';
        }
        else if (!oldState.bold && newState.bold) {
            this.html += '<b>';
        }
        // Italic
        if (oldState.italic && !newState.italic) {
            this.html += '</i>';
        }
        else if (!oldState.italic && newState.italic) {
            this.html += '<i>';
        }
        // Underline
        if (oldState.underline && !newState.underline) {
            this.html += '</u>';
        }
        else if (!oldState.underline && newState.underline) {
            this.html += '<u>';
        }
        // Strike
        if (oldState.strike && !newState.strike) {
            this.html += '</s>';
        }
        else if (!oldState.strike && newState.strike) {
            this.html += '<s>';
        }
        // Superscript
        if (oldState.superscript && !newState.superscript) {
            this.html += '</sup>';
        }
        else if (!oldState.superscript && newState.superscript) {
            this.html += '<sup>';
        }
        // Subscript
        if (oldState.subscript && !newState.subscript) {
            this.html += '</sub>';
        }
        else if (!oldState.subscript && newState.subscript) {
            this.html += '<sub>';
        }
        // Color
        if (oldState.color !== newState.color) {
            if (oldState.color !== null) {
                this.html += '</span>';
            }
            if (newState.color !== null && newState.color > 0 && newState.color <= this.colors.length) {
                const color = this.colors[newState.color - 1];
                this.html += `<span style="color: rgb(${color.red}, ${color.green}, ${color.blue});">`;
            }
        }
        // Background Color
        if (oldState.backgroundColor !== newState.backgroundColor) {
            if (oldState.backgroundColor !== null) {
                this.html += '</span>';
            }
            if (newState.backgroundColor !== null && newState.backgroundColor > 0 && newState.backgroundColor <= this.colors.length) {
                const color = this.colors[newState.backgroundColor - 1];
                this.html += `<span style="background-color: rgb(${color.red}, ${color.green}, ${color.blue});">`;
            }
        }
    }
    /**
     * بستن تمام تگ‌های باز
     */
    closeAllOpenTags() {
        if (this.state.backgroundColor !== null)
            this.html += '</span>';
        if (this.state.color !== null)
            this.html += '</span>';
        if (this.state.subscript)
            this.html += '</sub>';
        if (this.state.superscript)
            this.html += '</sup>';
        if (this.state.strike)
            this.html += '</s>';
        if (this.state.underline)
            this.html += '</u>';
        if (this.state.italic)
            this.html += '</i>';
        if (this.state.bold)
            this.html += '</b>';
    }
    /**
     * Wrap کردن در div
     */
    wrapInDiv(html) {
        const dir = this.state.isRtl ? 'rtl' : 'ltr';
        return `<div dir="${dir}" style="font-family: Tahoma, Arial; font-size: 12pt;">${html}</div>`;
    }
    /**
     * Escape کردن HTML characters
     */
    escapeHtml(char) {
        switch (char) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return char;
        }
    }
    /**
     * بررسی alphabetic بودن
     */
    isAlpha(char) {
        return /[a-zA-Z]/.test(char);
    }
    /**
     * بررسی digit بودن
     */
    isDigit(char) {
        return /\d/.test(char);
    }
}
/**
 * تابع اصلی export شده برای استفاده
 * @param rtf - رشته RTF
 * @returns HTML معادل
 */
function rtfToHtml(rtf) {
    const parser = new RtfParser();
    return parser.parse(rtf);
}
/**
 * Convert RTF to Hexadecimal string
 * Useful for storing RTF in databases as hex format
 * @param rtf - RTF document string
 * @returns Hexadecimal string
 * @example
 * const rtf = "{\\rtf1\\ansi Test}";
 * const hex = rtfToHex(rtf);
 * console.log(hex); // "7b5c727466315c616e736920546573747d"
 */
function rtfToHex(rtf) {
    const bytes = new TextEncoder().encode(rtf);
    return Array.from(bytes)
        .map(byte => {
        const hex = byte.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    })
        .join('');
}
/**
 * Convert Hexadecimal string to RTF
 * Used to retrieve RTF from database hex format
 * @param hex - Hexadecimal string
 * @returns RTF document string
 * @example
 * const hex = "7b5c727466315c616e736920546573747d";
 * const rtf = hexToRtf(hex);
 * console.log(rtf); // "{\rtf1\ansi Test}"
 */
function hexToRtf(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
}
/**
 * Convert HTML to RTF
 * Supports basic formatting: bold, italic, underline, colors, fonts
 * @param html - HTML string
 * @returns RTF document string
 * @example
 * const html = '<p><strong>Hello</strong></p>';
 * const rtf = htmlToRtf(html);
 */
function htmlToRtf(html) {
    var _a;
    const colorTable = ['\\red0\\green0\\blue0'];
    const colorMap = new Map();
    colorMap.set('rgb(0,0,0)', 1);
    colorMap.set('#000000', 1);
    colorMap.set('black', 1);
    function getColorIndex(color) {
        if (!color || color === 'inherit' || color === 'initial')
            return null;
        let normalized = color.toLowerCase().trim();
        if (normalized.startsWith('#')) {
            const hex = normalized.substring(1);
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            normalized = `rgb(${r},${g},${b})`;
        }
        if (colorMap.has(normalized)) {
            return colorMap.get(normalized);
        }
        const rgbMatch = normalized.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const [, r, g, b] = rgbMatch;
            const rtfColor = `\\red${r}\\green${g}\\blue${b}`;
            const index = colorTable.length + 1;
            colorTable.push(rtfColor);
            colorMap.set(normalized, index);
            return index;
        }
        return null;
    }
    const fontTable = ['Arial'];
    const fontMap = new Map();
    fontMap.set('arial', 0);
    function getFontIndex(fontFamily) {
        if (!fontFamily || fontFamily === 'inherit' || fontFamily === 'initial')
            return null;
        const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, '').toLowerCase());
        const firstFont = fonts[0];
        if (fontMap.has(firstFont)) {
            return fontMap.get(firstFont);
        }
        const index = fontTable.length;
        fontTable.push(fontFamily.split(',')[0].trim().replace(/['"]/g, ''));
        fontMap.set(firstFont, index);
        return index;
    }
    let rtfBody = '';
    function parseNode(node, state = {}) {
        const newState = Object.assign({}, state);
        let content = '';
        // Text node
        if (node.nodeType === 3) {
            let text = node.textContent || '';
            text = text
                .replace(/\\/g, '\\\\')
                .replace(/\{/g, '\\{')
                .replace(/\}/g, '\\}');
            let formatted = '';
            if (newState.bold)
                formatted += '\\b ';
            if (newState.italic)
                formatted += '\\i ';
            if (newState.underline)
                formatted += '\\ul ';
            if (newState.fontSize)
                formatted += `\\fs${newState.fontSize * 2} `;
            if (newState.fontIndex !== undefined)
                formatted += `\\f${newState.fontIndex} `;
            if (newState.colorIndex !== undefined)
                formatted += `\\cf${newState.colorIndex} `;
            formatted += Array.from(text).map((char) => {
                const code = char.charCodeAt(0);
                if (code > 127) {
                    return `\\u${code}?`;
                }
                return char;
            }).join('');
            if (newState.bold)
                formatted += '\\b0 ';
            if (newState.italic)
                formatted += '\\i0 ';
            if (newState.underline)
                formatted += '\\ul0 ';
            return formatted;
        }
        // Element node
        if (node.nodeType === 1) {
            const element = node;
            const tagName = element.tagName.toLowerCase();
            if (tagName === 'strong' || tagName === 'b') {
                newState.bold = true;
            }
            else if (tagName === 'em' || tagName === 'i') {
                newState.italic = true;
            }
            else if (tagName === 'u') {
                newState.underline = true;
            }
            else if (tagName === 'span') {
                const style = element.getAttribute('style');
                if (style) {
                    const styles = style.split(';').reduce((acc, s) => {
                        const [key, value] = s.split(':').map(x => x.trim());
                        if (key && value)
                            acc[key] = value;
                        return acc;
                    }, {});
                    if (styles.color) {
                        const colorIndex = getColorIndex(styles.color);
                        if (colorIndex)
                            newState.colorIndex = colorIndex;
                    }
                    if (styles['font-family']) {
                        const fontIndex = getFontIndex(styles['font-family']);
                        if (fontIndex !== null)
                            newState.fontIndex = fontIndex;
                    }
                    if (styles['font-size']) {
                        const size = parseInt(styles['font-size']);
                        if (!isNaN(size))
                            newState.fontSize = size;
                    }
                }
            }
            else if (tagName === 'p' || tagName === 'div') {
                const style = element.getAttribute('style');
                let align = '';
                if (style) {
                    const alignMatch = style.match(/text-align:\s*(\w+)/);
                    if (alignMatch) {
                        const alignment = alignMatch[1];
                        if (alignment === 'right')
                            align = '\\qr ';
                        else if (alignment === 'center')
                            align = '\\qc ';
                        else if (alignment === 'justify')
                            align = '\\qj ';
                        else if (alignment === 'left')
                            align = '\\ql ';
                    }
                }
                content += '\\pard' + align;
            }
            else if (tagName === 'br') {
                return '\\line ';
            }
            for (const child of Array.from(node.childNodes)) {
                content += parseNode(child, newState);
            }
            if (tagName === 'p' || tagName === 'div') {
                content += '\\par\n';
            }
            return content;
        }
        return content;
    }
    // Browser environment with DOMParser
    if (typeof global.DOMParser !== 'undefined' || typeof global.window !== 'undefined') {
        try {
            const DOMParserClass = global.DOMParser || ((_a = global.window) === null || _a === void 0 ? void 0 : _a.DOMParser);
            const parser = new DOMParserClass();
            const doc = parser.parseFromString(html, 'text/html');
            if (doc.body) {
                rtfBody = parseNode(doc.body);
            }
        }
        catch (e) {
            // Fall through to regex fallback
        }
    }
    if (!rtfBody) {
        // Fallback for Node.js (simple regex-based parsing)
        rtfBody = html
            .replace(/<br\s*\/?>/gi, '\\line ')
            .replace(/<p[^>]*>/gi, '\\pard ')
            .replace(/<\/p>/gi, '\\par\n')
            .replace(/<div[^>]*>/gi, '\\pard ')
            .replace(/<\/div>/gi, '\\par\n')
            .replace(/<strong[^>]*>|<b[^>]*>/gi, '\\b ')
            .replace(/<\/strong>|<\/b>/gi, '\\b0 ')
            .replace(/<em[^>]*>|<i[^>]*>/gi, '\\i ')
            .replace(/<\/em>|<\/i>/gi, '\\i0 ')
            .replace(/<u[^>]*>/gi, '\\ul ')
            .replace(/<\/u>/gi, '\\ul0 ')
            .replace(/<[^>]+>/g, '');
        rtfBody = Array.from(rtfBody).map((char) => {
            const code = char.charCodeAt(0);
            if (code > 127) {
                return `\\u${code}?`;
            }
            return char;
        }).join('');
    }
    let rtf = '{\\rtf1\\ansi\\ansicpg1256\\deff0\n';
    rtf += '{\\fonttbl\n';
    fontTable.forEach((font, index) => {
        rtf += `{\\f${index}\\fnil\\fcharset178 ${font};}\n`;
    });
    rtf += '}\n';
    rtf += '{\\colortbl ;';
    colorTable.forEach(color => {
        rtf += color + ';';
    });
    rtf += '}\n';
    rtf += rtfBody;
    rtf += '}';
    return rtf;
}
