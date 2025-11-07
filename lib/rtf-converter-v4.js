"use strict";
/**
 * RTF to HTML Converter v4 - با State Management کامل
 * پشتیبانی از ادامه فرمت‌ها بین پاراگراف‌ها
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rtfToHtml = rtfToHtml;
function rtfToHtml(rtf) {
    // پارس Font Table
    const fonts = parseFontTable(rtf);
    // پارس Color Table
    const colors = parseColorTable(rtf);
    // پیدا کردن محتوای اصلی
    const content = extractMainContent(rtf);
    // State اولیه
    const state = {
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
    let html = '';
    let openTags = []; // برای track کردن تگ‌های باز
    let i = 0;
    while (i < content.length) {
        const char = content[i];
        // Control Word
        if (char === '\\') {
            const controlResult = parseControlWord(content, i);
            i = controlResult.nextIndex;
            html += handleControlWord(controlResult.word, controlResult.param, state, openTags, fonts, colors);
            continue;
        }
        // Group Start
        if (char === '{') {
            i++;
            continue;
        }
        // Group End
        if (char === '}') {
            i++;
            continue;
        }
        // Plain Text
        if (char !== '\n' && char !== '\r') {
            html += char;
        }
        i++;
    }
    // بستن تگ‌های باقیمانده
    html += closeAllTags(openTags);
    return `<div dir="rtl" style="font-family: Tahoma, Arial; font-size: 12pt;">${html}</div>`;
}
function parseFontTable(rtf) {
    const fonts = new Map();
    const fontTableMatch = rtf.match(/\{\\fonttbl([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
    if (!fontTableMatch)
        return fonts;
    const fontTableContent = fontTableMatch[1];
    const fontRegex = /\{\\f(\d+)[^}]*?\\fcharset(\d+)\s+([^;}]+);?\}/g;
    let match;
    while ((match = fontRegex.exec(fontTableContent)) !== null) {
        const fontNum = parseInt(match[1]);
        const charset = parseInt(match[2]);
        const fontName = match[3].trim();
        fonts.set(fontNum, { name: fontName, charset });
    }
    return fonts;
}
function parseColorTable(rtf) {
    const colors = [];
    const colorTableMatch = rtf.match(/\{\\colortbl\s*;([^}]+)\}/);
    if (!colorTableMatch)
        return colors;
    const colorTableContent = colorTableMatch[1];
    const colorRegex = /\\red(\d+)\\green(\d+)\\blue(\d+);/g;
    let match;
    while ((match = colorRegex.exec(colorTableContent)) !== null) {
        colors.push({
            red: parseInt(match[1]),
            green: parseInt(match[2]),
            blue: parseInt(match[3])
        });
    }
    return colors;
}
function extractMainContent(rtf) {
    // پیدا کردن محتوای بعد از fonttbl و colortbl
    let content = rtf;
    // حذف font table
    content = content.replace(/\{\\fonttbl[\s\S]*?\}\}/g, '');
    // حذف color table  
    content = content.replace(/\{\\colortbl[\s\S]*?\}/g, '');
    // حذف header info قبل از محتوای اصلی
    content = content.replace(/\\rtf\d+/g, '');
    content = content.replace(/\\ansi\w*/g, '');
    content = content.replace(/\\deff\d+/g, '');
    content = content.replace(/\\deflang\d+/g, '');
    content = content.replace(/\\fbidis/g, '');
    content = content.replace(/\\ansicpg\d+/g, '');
    return content;
}
function parseControlWord(content, startIndex) {
    let i = startIndex + 1; // از بعد از \ شروع کن
    let word = '';
    let param = null;
    // خواندن نام control word
    while (i < content.length && /[a-zA-Z]/.test(content[i])) {
        word += content[i];
        i++;
    }
    // خواندن پارامتر عددی
    if (i < content.length && /[-\d]/.test(content[i])) {
        let paramStr = '';
        if (content[i] === '-') {
            paramStr += '-';
            i++;
        }
        while (i < content.length && /\d/.test(content[i])) {
            paramStr += content[i];
            i++;
        }
        param = parseInt(paramStr);
    }
    // Hex Encoding مثل \'e1
    if (word === "'" && i < content.length) {
        const hexCode = content.substring(i, i + 2);
        word = 'hex_' + hexCode;
        i += 2;
    }
    // Skip space after control word
    if (i < content.length && content[i] === ' ') {
        i++;
    }
    return { word, param, nextIndex: i };
}
function handleControlWord(word, param, state, openTags, fonts, colors) {
    let html = '';
    // Hex Encoding
    if (word.startsWith('hex_')) {
        const hexCode = word.substring(4);
        try {
            const charCode = parseInt(hexCode, 16);
            const decoded = String.fromCharCode(charCode);
            return decoded;
        }
        catch (e) {
            return '';
        }
    }
    // Unicode
    if (word === 'u' && param !== null) {
        const unicode = param < 0 ? param + 65536 : param;
        return String.fromCharCode(unicode);
    }
    // Paragraph
    if (word === 'par' || word === 'line') {
        // بستن تگ‌های inline فعلی
        html += closeInlineTags(openTags);
        html += '<br>';
        // بازکردن دوباره تگ‌های inline بر اساس state
        html += reopenInlineTags(state, openTags, fonts, colors);
        return html;
    }
    // Bold
    if (word === 'b') {
        if (param === 0) {
            if (state.bold) {
                html += closeBold(openTags);
                state.bold = false;
            }
        }
        else {
            if (!state.bold) {
                html += '<b>';
                openTags.push('b');
                state.bold = true;
            }
        }
        return html;
    }
    // Italic
    if (word === 'i') {
        if (param === 0) {
            if (state.italic) {
                html += closeItalic(openTags);
                state.italic = false;
            }
        }
        else {
            if (!state.italic) {
                html += '<i>';
                openTags.push('i');
                state.italic = true;
            }
        }
        return html;
    }
    // Underline
    if (word === 'ul') {
        if (!state.underline) {
            html += '<u>';
            openTags.push('u');
            state.underline = true;
        }
        return html;
    }
    if (word === 'ulnone' || (word === 'ul' && param === 0)) {
        if (state.underline) {
            html += closeUnderline(openTags);
            state.underline = false;
        }
        return html;
    }
    // Strike
    if (word === 'strike') {
        if (param === 0) {
            if (state.strike) {
                html += closeStrike(openTags);
                state.strike = false;
            }
        }
        else {
            if (!state.strike) {
                html += '<s>';
                openTags.push('s');
                state.strike = true;
            }
        }
        return html;
    }
    // Superscript
    if (word === 'super') {
        if (!state.superscript) {
            html += '<sup>';
            openTags.push('sup');
            state.superscript = true;
        }
        return html;
    }
    if (word === 'nosupersub') {
        if (state.superscript) {
            html += closeSuperscript(openTags);
            state.superscript = false;
        }
        if (state.subscript) {
            html += closeSubscript(openTags);
            state.subscript = false;
        }
        return html;
    }
    // Subscript
    if (word === 'sub') {
        if (!state.subscript) {
            html += '<sub>';
            openTags.push('sub');
            state.subscript = true;
        }
        return html;
    }
    // Color
    if (word === 'cf' && param !== null) {
        // بستن span قبلی اگر وجود داشت
        html += closeColorSpan(openTags);
        if (param > 0 && param <= colors.length) {
            const color = colors[param - 1];
            const colorStr = `rgb(${color.red}, ${color.green}, ${color.blue})`;
            html += `<span style="color: ${colorStr};">`;
            openTags.push('color');
            state.color = param;
        }
        else {
            state.color = null;
        }
        return html;
    }
    // Background Color
    if (word === 'highlight' && param !== null) {
        html += closeBackgroundSpan(openTags);
        if (param > 0 && param <= colors.length) {
            const color = colors[param - 1];
            const colorStr = `rgb(${color.red}, ${color.green}, ${color.blue})`;
            html += `<span style="background-color: ${colorStr};">`;
            openTags.push('background');
            state.backgroundColor = param;
        }
        else {
            state.backgroundColor = null;
        }
        return html;
    }
    // Font
    if (word === 'f' && param !== null) {
        state.font = param;
        // Font change نیاز به reopen کردن span ها داره
        return html;
    }
    // Font Size
    if (word === 'fs' && param !== null) {
        state.fontSize = param;
        return html;
    }
    // Alignment
    if (word === 'qr') {
        state.alignment = 'right';
        return html;
    }
    if (word === 'ql') {
        state.alignment = 'left';
        return html;
    }
    if (word === 'qc') {
        state.alignment = 'center';
        return html;
    }
    if (word === 'qj') {
        state.alignment = 'justify';
        return html;
    }
    // RTL/LTR
    if (word === 'rtlpar') {
        state.isRtl = true;
        return html;
    }
    if (word === 'ltrpar') {
        state.isRtl = false;
        return html;
    }
    // Bullet
    if (word === 'bullet') {
        return '•';
    }
    // Tab
    if (word === 'tab') {
        return '&nbsp;&nbsp;&nbsp;&nbsp;';
    }
    return html;
}
function closeInlineTags(openTags) {
    let html = '';
    // بستن تگ‌ها به ترتیب معکوس
    for (let i = openTags.length - 1; i >= 0; i--) {
        const tag = openTags[i];
        if (tag === 'b')
            html += '</b>';
        else if (tag === 'i')
            html += '</i>';
        else if (tag === 'u')
            html += '</u>';
        else if (tag === 's')
            html += '</s>';
        else if (tag === 'sup')
            html += '</sup>';
        else if (tag === 'sub')
            html += '</sub>';
        else if (tag === 'color')
            html += '</span>';
        else if (tag === 'background')
            html += '</span>';
    }
    return html;
}
function reopenInlineTags(state, openTags, fonts, colors) {
    let html = '';
    // بازکردن تگ‌ها به ترتیب اصلی
    for (const tag of openTags) {
        if (tag === 'b' && state.bold) {
            html += '<b>';
        }
        else if (tag === 'i' && state.italic) {
            html += '<i>';
        }
        else if (tag === 'u' && state.underline) {
            html += '<u>';
        }
        else if (tag === 's' && state.strike) {
            html += '<s>';
        }
        else if (tag === 'sup' && state.superscript) {
            html += '<sup>';
        }
        else if (tag === 'sub' && state.subscript) {
            html += '<sub>';
        }
        else if (tag === 'color' && state.color !== null && state.color > 0 && state.color <= colors.length) {
            const color = colors[state.color - 1];
            const colorStr = `rgb(${color.red}, ${color.green}, ${color.blue})`;
            html += `<span style="color: ${colorStr};">`;
        }
        else if (tag === 'background' && state.backgroundColor !== null && state.backgroundColor > 0 && state.backgroundColor <= colors.length) {
            const color = colors[state.backgroundColor - 1];
            const colorStr = `rgb(${color.red}, ${color.green}, ${color.blue})`;
            html += `<span style="background-color: ${colorStr};">`;
        }
    }
    return html;
}
function closeBold(openTags) {
    const index = openTags.lastIndexOf('b');
    if (index !== -1) {
        openTags.splice(index, 1);
        return '</b>';
    }
    return '';
}
function closeItalic(openTags) {
    const index = openTags.lastIndexOf('i');
    if (index !== -1) {
        openTags.splice(index, 1);
        return '</i>';
    }
    return '';
}
function closeUnderline(openTags) {
    const index = openTags.lastIndexOf('u');
    if (index !== -1) {
        openTags.splice(index, 1);
        return '</u>';
    }
    return '';
}
function closeStrike(openTags) {
    const index = openTags.lastIndexOf('s');
    if (index !== -1) {
        openTags.splice(index, 1);
        return '</s>';
    }
    return '';
}
function closeSuperscript(openTags) {
    const index = openTags.lastIndexOf('sup');
    if (index !== -1) {
        openTags.splice(index, 1);
        return '</sup>';
    }
    return '';
}
function closeSubscript(openTags) {
    const index = openTags.lastIndexOf('sub');
    if (index !== -1) {
        openTags.splice(index, 1);
        return '</sub>';
    }
    return '';
}
function closeColorSpan(openTags) {
    const index = openTags.lastIndexOf('color');
    if (index !== -1) {
        openTags.splice(index, 1);
        return '</span>';
    }
    return '';
}
function closeBackgroundSpan(openTags) {
    const index = openTags.lastIndexOf('background');
    if (index !== -1) {
        openTags.splice(index, 1);
        return '</span>';
    }
    return '';
}
function closeAllTags(openTags) {
    let html = '';
    for (let i = openTags.length - 1; i >= 0; i--) {
        const tag = openTags[i];
        if (tag === 'b')
            html += '</b>';
        else if (tag === 'i')
            html += '</i>';
        else if (tag === 'u')
            html += '</u>';
        else if (tag === 's')
            html += '</s>';
        else if (tag === 'sup')
            html += '</sup>';
        else if (tag === 'sub')
            html += '</sub>';
        else if (tag === 'color')
            html += '</span>';
        else if (tag === 'background')
            html += '</span>';
    }
    openTags.length = 0;
    return html;
}
