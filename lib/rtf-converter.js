"use strict";
/**
 * RTF Converter Library v3.0
 * Professional-grade RTF to HTML converter
 * Optimized for React TypeScript projects
 * Supports Persian/Arabic (Windows-1256) and Latin (Windows-1252)
 *
 * @author Mostafa Dastmalchi
 * @version 3.0.0
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtfConverter = void 0;
exports.rtfToHtml = rtfToHtml;
exports.rtfToHex = rtfToHex;
exports.hexToRtf = hexToRtf;
exports.hexToHtml = hexToHtml;
exports.htmlToRtf = htmlToRtf;
// ============================================
// Constants
// ============================================
var DEFAULT_OPTIONS = {
    codePage: 'windows-1252',
    strictMode: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    dir: 'rtl', // Default to RTL for Persian/Arabic support
};
var RTF_HEADER_REGEX = /^{\\rtf1/;
// ============================================
// Helper Functions
// ============================================
/**
 * Convert hex string to byte array
 * @param hex - Hex string (e.g., "48656c6c6f")
 * @returns Byte array
 */
function hexToBytes(hex) {
    var bytes = [];
    for (var c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return new Uint8Array(bytes);
}
/**
 * Convert byte array to base64 string
 * @param bytes - Byte array
 * @returns Base64 encoded string
 */
function bytesToBase64(bytes) {
    var binary = '';
    var len = bytes.length;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
/**
 * Escape HTML special characters and convert spaces to entities
 * @param s - Input string
 * @returns HTML-safe string with character entities
 */
function escapeHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\u200C/g, '&zwnj;') // Zero-width non-joiner (نیم‌فاصله)
        .replace(/\u00AD/g, '&shy;') // Soft hyphen (optional hyphen)
        .replace(/\u2011/g, '&#8209;') // Non-breaking hyphen
        .replace(/\u00A0/g, '&nbsp;') // Non-breaking space
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;') // Tab to 8 non-breaking spaces
        .replace(/ /g, '&nbsp;');
}
/**
 * Validate RTF document structure
 * @param rtf - RTF string
 * @param options - Converter options
 * @returns Validation result
 */
function validateRtf(rtf, options) {
    var warnings = [];
    // Check size
    if (rtf.length > options.maxSize) {
        return {
            success: false,
            error: "Document size (".concat(rtf.length, " bytes) exceeds maximum (").concat(options.maxSize, " bytes)"),
        };
    }
    // Check RTF header
    if (!RTF_HEADER_REGEX.test(rtf)) {
        if (options.strictMode) {
            return {
                success: false,
                error: 'Invalid RTF document: Missing RTF header',
            };
        }
        warnings.push('Warning: Document does not start with RTF header');
    }
    // Check balanced braces
    var braceCount = 0;
    for (var _i = 0, rtf_1 = rtf; _i < rtf_1.length; _i++) {
        var ch = rtf_1[_i];
        if (ch === '{')
            braceCount++;
        if (ch === '}')
            braceCount--;
        if (braceCount < 0) {
            return {
                success: false,
                error: 'Invalid RTF document: Unbalanced closing brace',
            };
        }
    }
    if (braceCount !== 0) {
        if (options.strictMode) {
            return {
                success: false,
                error: "Invalid RTF document: ".concat(braceCount, " unclosed braces"),
            };
        }
        warnings.push("Warning: ".concat(braceCount, " unclosed braces"));
    }
    return { success: true, warnings: warnings };
}
/**
 * Create empty RTF state
 * @returns Empty state object
 */
function emptyState() {
    return {
        bold: false,
        italic: false,
        underline: false,
        fontSize: null,
        font: null,
        color: null,
        colorIndex: null,
        listLevel: 0,
        align: null,
        outlineLevel: null,
        inTable: false,
        marginLeft: 0,
        marginRight: 0,
        tableAlign: null,
    };
}
/**
 * Create default cell properties
 */
function createDefaultCellProps() {
    return {
        width: null,
        borders: { top: true, bottom: true, left: true, right: true },
        backgroundColor: null,
        verticalAlign: null,
        mergeFirst: false,
        merged: false,
    };
}
/**
 * Convert RTF state to inline CSS style string
 * @param s - RTF state
 * @param colorTable - Color table for resolving color indices
 * @returns CSS style attribute content
 */
function stateToStyle(s, colorTable) {
    var styles = [];
    if (s.font)
        styles.push("font-family:".concat(s.font));
    if (s.fontSize)
        styles.push("font-size:".concat(s.fontSize, "pt"));
    if (s.colorIndex !== null && s.colorIndex > 0 && s.colorIndex < colorTable.length) {
        var color = colorTable[s.colorIndex];
        if (color)
            styles.push("color:".concat(color));
    }
    else if (s.color) {
        styles.push("color:".concat(s.color));
    }
    // Note: margins (marginLeft, marginRight) are for paragraphs, not inline spans
    // They should be applied to paragraph tags, not span tags
    return styles.length ? " style=\"".concat(styles.join(';'), "\"") : '';
}
/**
 * Generate opening HTML tags for inline formatting
 * @param state - Current RTF state
 * @returns Opening tags string
 */
function openInlineTags(state) {
    var tags = [];
    if (state.bold)
        tags.push('<strong>');
    if (state.italic)
        tags.push('<em>');
    if (state.underline)
        tags.push('<u>');
    return tags.join('');
}
/**
 * Generate closing HTML tags for inline formatting
 * @param state - Current RTF state
 * @returns Closing tags string
 */
function closeInlineTags(state) {
    var tags = [];
    if (state.underline)
        tags.push('</u>');
    if (state.italic)
        tags.push('</em>');
    if (state.bold)
        tags.push('</strong>');
    return tags.join('');
}
/**
 * Decode byte using specified encoding
 * @param byte - Byte value (0-255)
 * @param encoding - Encoding name
 * @returns Decoded character
 */
function decodeByteWithEncoding(byte, encoding) {
    if (encoding === 'windows-1256') {
        // Windows-1256 (Arabic/Persian) mapping
        var win1256 = {
            0x80: 0x20AC, 0x81: 0x067E, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E,
            0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030,
            0x8A: 0x0679, 0x8B: 0x2039, 0x8C: 0x0152, 0x8D: 0x0686, 0x8E: 0x0698,
            0x8F: 0x0688, 0x90: 0x06AF, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C,
            0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014, 0x98: 0x06A9,
            0x99: 0x2122, 0x9A: 0x0691, 0x9B: 0x203A, 0x9C: 0x0153, 0x9D: 0x200C,
            0x9E: 0x200D, 0x9F: 0x06BA, 0xA0: 0x00A0, 0xA1: 0x060C, 0xA2: 0x00A2,
            0xA3: 0x00A3, 0xA4: 0x00A4, 0xA5: 0x00A5, 0xA6: 0x00A6, 0xA7: 0x00A7,
            0xA8: 0x00A8, 0xA9: 0x00A9, 0xAA: 0x06BE, 0xAB: 0x00AB, 0xAC: 0x00AC,
            0xAD: 0x00AD, 0xAE: 0x00AE, 0xAF: 0x00AF, 0xB0: 0x00B0, 0xB1: 0x00B1,
            0xB2: 0x00B2, 0xB3: 0x00B3, 0xB4: 0x00B4, 0xB5: 0x00B5, 0xB6: 0x00B6,
            0xB7: 0x00B7, 0xB8: 0x00B8, 0xB9: 0x00B9, 0xBA: 0x061B, 0xBB: 0x00BB,
            0xBC: 0x00BC, 0xBD: 0x00BD, 0xBE: 0x00BE, 0xBF: 0x061F, 0xC0: 0x06C1,
            0xC1: 0x0621, 0xC2: 0x0622, 0xC3: 0x0623, 0xC4: 0x0624, 0xC5: 0x0625,
            0xC6: 0x0626, 0xC7: 0x0627, 0xC8: 0x0628, 0xC9: 0x0629, 0xCA: 0x062A,
            0xCB: 0x062B, 0xCC: 0x062C, 0xCD: 0x062D, 0xCE: 0x062E, 0xCF: 0x062F,
            0xD0: 0x0630, 0xD1: 0x0631, 0xD2: 0x0632, 0xD3: 0x0633, 0xD4: 0x0634,
            0xD5: 0x0635, 0xD6: 0x0636, 0xD7: 0x00D7, 0xD8: 0x0637, 0xD9: 0x0638,
            0xDA: 0x0639, 0xDB: 0x063A, 0xDC: 0x0640, 0xDD: 0x0641, 0xDE: 0x0642,
            0xDF: 0x0643, 0xE0: 0x00E0, 0xE1: 0x0644, 0xE2: 0x00E2, 0xE3: 0x0645,
            0xE4: 0x0646, 0xE5: 0x0647, 0xE6: 0x0648, 0xE7: 0x00E7, 0xE8: 0x00E8,
            0xE9: 0x00E9, 0xEA: 0x00EA, 0xEB: 0x00EB, 0xEC: 0x0649, 0xED: 0x064A,
            0xEE: 0x00EE, 0xEF: 0x00EF, 0xF0: 0x064B, 0xF1: 0x064C, 0xF2: 0x064D,
            0xF3: 0x064E, 0xF4: 0x00F4, 0xF5: 0x064F, 0xF6: 0x0650, 0xF7: 0x00F7,
            0xF8: 0x0651, 0xF9: 0x00F9, 0xFA: 0x0652, 0xFB: 0x00FB, 0xFC: 0x00FC,
            0xFD: 0x200E, 0xFE: 0x200F, 0xFF: 0x06D2,
        };
        var mapped = win1256[byte];
        return mapped !== undefined ? String.fromCharCode(mapped) : String.fromCharCode(byte);
    }
    // Default: treat as Latin-1
    return String.fromCharCode(byte);
}
/**
 * Clean up empty HTML tags using optimized single-pass approach
 * @param html - Input HTML string
 * @returns Cleaned HTML string
 */
function cleanupEmptyTags(html) {
    // Single-pass cleanup with optimized regex
    var cleaned = html;
    var prevCleaned = '';
    // Iteratively remove empty inline tags until no more changes
    var iterations = 0;
    var maxIterations = 10; // Prevent infinite loops
    while (cleaned !== prevCleaned && iterations < maxIterations) {
        prevCleaned = cleaned;
        // Remove empty formatting tags
        cleaned = cleaned.replace(/<(strong|em|u|span[^>]*)>\s*<\/\1>/g, '');
        // Remove empty spans
        cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/g, '');
        iterations++;
    }
    // Convert empty paragraphs to <br/>
    cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/g, '<br/>');
    return cleaned;
}
// ============================================
// Main Converter Class
// ============================================
/**
 * RTF to HTML Converter
 * Professional-grade converter with error handling and validation
 */
var RtfConverter = /** @class */ (function () {
    function RtfConverter(options) {
        if (options === void 0) { options = {}; }
        this.options = __assign(__assign({}, DEFAULT_OPTIONS), options);
    }
    /**
     * Convert RTF string to HTML with error handling
     * @param rtf - RTF document string
     * @returns Conversion result with HTML or error
     */
    RtfConverter.prototype.convert = function (rtf) {
        try {
            // Validate input
            var validation = validateRtf(rtf, this.options);
            if (!validation.success) {
                return {
                    success: false,
                    error: validation.error,
                    warnings: validation.warnings,
                };
            }
            // Convert
            var html = this.rtfToHtml(rtf);
            return {
                success: true,
                data: html,
                warnings: validation.warnings,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during conversion',
            };
        }
    };
    /**
     * Main RTF to HTML conversion logic
     * @param rtf - RTF document string
     * @returns HTML string
     */
    RtfConverter.prototype.rtfToHtml = function (rtf) {
        var len = rtf.length;
        var i = 0;
        var stateStack = [emptyState()];
        var colorTable = [];
        var fontTable = {};
        var inFontTable = false;
        var inColorTable = false;
        var inStyleSheet = false;
        var inPnTextGroup = false; // Track if we're inside {\pntext...} group
        var pnTextDepth = 0;
        var colorTableDepth = 0;
        var fontTableDepth = 0;
        var styleSheetDepth = 0;
        var tempColorR = 0, tempColorG = 0, tempColorB = 0;
        var currentFontNumber = null;
        var fontNameBuffer = '';
        var currentCodePage = this.options.codePage;
        var ucSkip = 1;
        var skipFallback = 0;
        var outputBuffer = [];
        var curText = '';
        var pendingParagraphTag = '';
        var paragraphHasContent = false;
        var currentParagraphTag = 'p'; // Track current paragraph/heading tag type
        var paragraphTagOpen = false; // Track if a paragraph/heading tag is currently open
        // List state tracking
        var inList = false;
        var listLevel = 0;
        var listItems = [];
        // Table state tracking
        var tableCellOpen = false;
        var currentCellProps = createDefaultCellProps();
        var cellPropsArray = []; // For current row
        var appendText = function (txt) {
            curText += escapeHtml(txt);
        };
        var flushText = function () {
            if (!curText)
                return;
            // If we're in a table and no cell is open, open one
            var cur = getCurrentState();
            if (cur.inTable && !tableCellOpen) {
                outputBuffer.push('<td style="border:1px solid #000;padding:5px">');
                tableCellOpen = true;
            }
            // Don't add paragraph tags inside list items
            if (pendingParagraphTag && !inList) {
                outputBuffer.push(pendingParagraphTag);
                pendingParagraphTag = '';
                paragraphHasContent = true;
                paragraphTagOpen = true; // Mark that we opened a tag
            }
            var st = stateStack[stateStack.length - 1];
            var style = stateToStyle(st, colorTable);
            var openTags = openInlineTags(st);
            var closeTags = closeInlineTags(st);
            if (openTags || style) {
                outputBuffer.push("<span".concat(style, ">").concat(openTags).concat(curText).concat(closeTags, "</span>"));
            }
            else {
                outputBuffer.push(curText);
            }
            curText = '';
        };
        var pushState = function () {
            var copy = __assign({}, stateStack[stateStack.length - 1]);
            stateStack.push(copy);
        };
        var popState = function () {
            if (stateStack.length > 1) {
                stateStack.pop();
            }
        };
        var getCurrentState = function () {
            return stateStack[stateStack.length - 1];
        };
        var updatePendingParagraphTag = function () {
            var cur = getCurrentState();
            var tag = 'p';
            if (cur.outlineLevel !== null && cur.outlineLevel >= 0 && cur.outlineLevel <= 8) {
                var headingLevel = Math.min(cur.outlineLevel + 1, 6);
                tag = "h".concat(headingLevel);
            }
            currentParagraphTag = tag;
            // Build style string
            var styles = [];
            if (cur.align)
                styles.push("text-align:".concat(cur.align));
            if (cur.marginLeft > 0)
                styles.push("margin-left:".concat(cur.marginLeft, "pt"));
            if (cur.marginRight > 0)
                styles.push("margin-right:".concat(cur.marginRight, "pt"));
            var parStyle = styles.length > 0 ? " style=\"".concat(styles.join(';'), "\"") : '';
            pendingParagraphTag = "<".concat(tag).concat(parStyle, ">");
        };
        // Main parsing loop
        while (i < len) {
            var ch = rtf[i];
            if (ch === '{') {
                flushText();
                // Check if this is an ignorable destination {\*...}
                if (i + 1 < len && rtf[i + 1] === '\\' && i + 2 < len && rtf[i + 2] === '*') {
                    // Skip the entire ignorable destination group
                    i++; // Skip {
                    var depth = 1;
                    while (i < len && depth > 0) {
                        i++;
                        if (rtf[i] === '{')
                            depth++;
                        else if (rtf[i] === '}')
                            depth--;
                        else if (rtf[i] === '\\' && i + 1 < len) {
                            // Skip escaped characters
                            i++;
                        }
                    }
                    i++; // Skip the final }
                    continue;
                }
                pushState();
                i++;
                continue;
            }
            if (ch === '}') {
                flushText();
                var currentDepth = stateStack.length;
                if (inFontTable && currentDepth <= fontTableDepth) {
                    inFontTable = false;
                }
                if (inColorTable && currentDepth <= colorTableDepth) {
                    inColorTable = false;
                }
                if (inStyleSheet && currentDepth <= styleSheetDepth) {
                    inStyleSheet = false;
                }
                if (inPnTextGroup && currentDepth <= pnTextDepth) {
                    inPnTextGroup = false;
                    // Clear any text accumulated in pntext group
                    curText = '';
                }
                popState();
                i++;
                continue;
            }
            if (ch === ';') {
                if (inColorTable) {
                    var colorStr = "rgb(".concat(tempColorR, ",").concat(tempColorG, ",").concat(tempColorB, ")");
                    colorTable.push(colorStr);
                    tempColorR = 0;
                    tempColorG = 0;
                    tempColorB = 0;
                }
                if (inFontTable) {
                    // End of font definition - save font name
                    if (currentFontNumber !== null && fontNameBuffer.trim()) {
                        fontTable[currentFontNumber] = fontNameBuffer.trim();
                    }
                    currentFontNumber = null;
                    fontNameBuffer = '';
                }
                i++;
                continue;
            }
            if (ch === '\\') {
                i++;
                if (i >= len)
                    break;
                var next = rtf[i];
                // Escaped characters
                if (next === '{' || next === '}' || next === '\\') {
                    if (skipFallback > 0) {
                        skipFallback--;
                    }
                    else {
                        appendText(next);
                    }
                    i++;
                    continue;
                }
                // Non-breaking space
                if (next === '~') {
                    if (skipFallback > 0) {
                        skipFallback--;
                    }
                    else if (!inPnTextGroup) {
                        appendText('\u00A0'); // Non-breaking space
                    }
                    i++;
                    continue;
                }
                // Optional hyphen (soft hyphen)
                if (next === '-') {
                    if (skipFallback > 0) {
                        skipFallback--;
                    }
                    else if (!inPnTextGroup) {
                        appendText('\u00AD'); // Soft hyphen
                    }
                    i++;
                    continue;
                }
                // Non-breaking hyphen
                if (next === '_') {
                    if (skipFallback > 0) {
                        skipFallback--;
                    }
                    else if (!inPnTextGroup) {
                        appendText('\u2011'); // Non-breaking hyphen
                    }
                    i++;
                    continue;
                }
                // Ignorable destination marker (\*)
                if (next === '*') {
                    // Skip the entire ignorable destination group
                    i++; // Skip the *
                    // The group will be handled by the normal { } matching
                    continue;
                }
                // Hex escape
                if (next === "'") {
                    i++;
                    if (i + 1 < len) {
                        var hex = rtf.substr(i, 2);
                        var byte = parseInt(hex, 16);
                        if (!isNaN(byte)) {
                            if (skipFallback > 0) {
                                skipFallback--;
                            }
                            else if (!inPnTextGroup) {
                                // Ignore hex characters inside pntext group (bullet markers)
                                var decoded = decodeByteWithEncoding(byte, currentCodePage);
                                appendText(decoded);
                            }
                        }
                        i += 2;
                    }
                    continue;
                }
                // Control word
                var wordStart = i;
                while (i < len && /[a-z]/i.test(rtf[i])) {
                    i++;
                }
                var word = rtf.substring(wordStart, i);
                var param = null;
                // Parse parameter
                if (i < len && (rtf[i] === '-' || /\d/.test(rtf[i]))) {
                    var numStart = i;
                    if (rtf[i] === '-')
                        i++;
                    while (i < len && /\d/.test(rtf[i])) {
                        i++;
                    }
                    param = parseInt(rtf.substring(numStart, i), 10);
                }
                // Optional space after control word
                if (i < len && rtf[i] === ' ') {
                    i++;
                }
                var cur = getCurrentState();
                // Handle control words
                switch (word) {
                    case 'ansi':
                        currentCodePage = 'windows-1252';
                        break;
                    case 'ansicpg':
                        if (param === 1256)
                            currentCodePage = 'windows-1256';
                        else if (param === 1252)
                            currentCodePage = 'windows-1252';
                        break;
                    // Character formatting
                    case 'b':
                        var newBold = param === null || param !== 0;
                        if (cur.bold !== newBold)
                            flushText();
                        cur.bold = newBold;
                        break;
                    case 'i':
                        var newItalic = param === null || param !== 0;
                        if (cur.italic !== newItalic)
                            flushText();
                        cur.italic = newItalic;
                        break;
                    case 'ul':
                        var newUnderline = param === null || param !== 0;
                        if (cur.underline !== newUnderline)
                            flushText();
                        cur.underline = newUnderline;
                        break;
                    case 'ulnone':
                        if (cur.underline)
                            flushText();
                        cur.underline = false;
                        break;
                    // Font size
                    case 'fs':
                        if (param !== null) {
                            cur.fontSize = Math.round(param / 2);
                        }
                        break;
                    // Font
                    case 'f':
                        if (param !== null) {
                            if (inFontTable) {
                                // Inside font table: this is defining a font number
                                currentFontNumber = param;
                                fontNameBuffer = '';
                            }
                            else {
                                // Outside font table: selecting a font
                                var fontName = fontTable[param];
                                if (fontName) {
                                    cur.font = fontName;
                                }
                            }
                        }
                        break;
                    // Color
                    case 'cf':
                        if (param !== null) {
                            // Flush text with current color before changing
                            var currentColorIndex = cur.colorIndex;
                            if (param === 0) {
                                // \cf0 means reset to no color
                                if (currentColorIndex !== null)
                                    flushText();
                                cur.colorIndex = null;
                            }
                            else if (param <= colorTable.length) {
                                if (currentColorIndex !== param)
                                    flushText();
                                cur.colorIndex = param;
                            }
                        }
                        break;
                    // Paragraph alignment
                    case 'qc':
                        cur.align = 'center';
                        if (pendingParagraphTag && !paragraphHasContent) {
                            updatePendingParagraphTag();
                        }
                        break;
                    case 'qr':
                        cur.align = 'right';
                        if (pendingParagraphTag && !paragraphHasContent) {
                            updatePendingParagraphTag();
                        }
                        break;
                    case 'ql':
                        cur.align = 'left';
                        if (pendingParagraphTag && !paragraphHasContent) {
                            updatePendingParagraphTag();
                        }
                        break;
                    case 'qj':
                        cur.align = 'justify';
                        if (pendingParagraphTag && !paragraphHasContent) {
                            updatePendingParagraphTag();
                        }
                        break;
                    // Outline level (for headings)
                    case 'outlinelevel':
                        if (param !== null) {
                            cur.outlineLevel = param;
                            // Update pending tag if we haven't output content yet
                            if (!paragraphHasContent) {
                                updatePendingParagraphTag();
                            }
                        }
                        break;
                    // Paragraph reset
                    case 'pard':
                        flushText();
                        // Check if we're exiting a table
                        if (cur.inTable) {
                            // Look ahead to see if table continues
                            var tableCheckI = i;
                            var isTableEnd = true;
                            while (tableCheckI < len && tableCheckI < i + 100) {
                                if (rtf[tableCheckI] === '\\') {
                                    var wordStart_1 = tableCheckI + 1;
                                    var wordEnd = wordStart_1;
                                    while (wordEnd < len && /[a-z]/.test(rtf[wordEnd])) {
                                        wordEnd++;
                                    }
                                    var word_1 = rtf.substring(wordStart_1, wordEnd);
                                    if (word_1 === 'trowd' || word_1 === 'cell' || word_1 === 'row' || word_1 === 'intbl') {
                                        isTableEnd = false;
                                        break;
                                    }
                                }
                                tableCheckI++;
                            }
                            if (isTableEnd) {
                                outputBuffer.push('</table>');
                                cur.inTable = false;
                            }
                        }
                        // Check if this pard is ending a list (if followed by text, not by pntext)
                        // We'll check if the next non-whitespace is NOT pntext
                        // Note: i is already positioned after the command word and parameter
                        var tempI = i - 1; // Will be incremented in the while loop
                        var isPardEndingList = inList;
                        // Look ahead to see if there's a pntext or bullet coming
                        while (tempI < len && isPardEndingList) {
                            tempI++;
                            var ch_1 = rtf[tempI];
                            if (ch_1 === '\\') {
                                var wordStart_2 = tempI + 1;
                                var wordEnd = wordStart_2;
                                while (wordEnd < len && /[a-z]/.test(rtf[wordEnd])) {
                                    wordEnd++;
                                }
                                var word_2 = rtf.substring(wordStart_2, wordEnd);
                                if (word_2 === 'pntext' || word_2 === 'bullet') {
                                    // This pard is part of list continuation
                                    isPardEndingList = false;
                                    break;
                                }
                                // If we hit other commands, stop looking
                                if (word_2 && word_2 !== 'rtlpar' && word_2 !== 'ltrpar' && word_2 !== 'fi' && word_2 !== 'ri' && word_2 !== 'qr' && word_2 !== 'ql' && word_2 !== 'qc') {
                                    break;
                                }
                                tempI = wordEnd;
                            }
                            else if (ch_1 === '{' || ch_1 === '}') {
                                break;
                            }
                            else if (ch_1 !== ' ' && ch_1 !== '\n' && ch_1 !== '\r' && ch_1 !== '\t') {
                                // Hit actual text - this pard ends the list
                                break;
                            }
                        }
                        // Close list if this pard is ending it
                        if (isPardEndingList && inList) {
                            if (listItems.length > 0) {
                                outputBuffer.push('</li>');
                            }
                            outputBuffer.push('</ul>');
                            inList = false;
                            listItems = [];
                        }
                        if (pendingParagraphTag) {
                            outputBuffer.push(pendingParagraphTag);
                            paragraphTagOpen = true;
                        }
                        cur.align = null;
                        cur.outlineLevel = null; // Reset heading level
                        paragraphHasContent = false;
                        currentParagraphTag = 'p';
                        // Don't set pendingParagraphTag if we're in a list
                        if (!inList) {
                            pendingParagraphTag = '<p>';
                        }
                        break;
                    // Paragraph break
                    case 'par':
                        flushText();
                        // If in list, just close the current list item (don't add </li> yet, bullet will do it)
                        if (inList) {
                            // List item content continues until next bullet or end of list
                            break;
                        }
                        if (!paragraphHasContent && !pendingParagraphTag) {
                            outputBuffer.push('<br/>');
                        }
                        else {
                            if (pendingParagraphTag) {
                                outputBuffer.push(pendingParagraphTag);
                                pendingParagraphTag = '';
                                paragraphTagOpen = true;
                            }
                            // Close current paragraph/heading
                            outputBuffer.push("</".concat(currentParagraphTag, ">"));
                            paragraphHasContent = false;
                            paragraphTagOpen = false; // Tag is now closed
                        }
                        // DON'T reset formatting - RTF preserves state across paragraphs!
                        // cur.bold, cur.italic, cur.underline should remain unchanged
                        break;
                    // Line break
                    case 'line':
                        flushText();
                        outputBuffer.push('<br/>');
                        break;
                    // Tab
                    case 'tab':
                        if (!inPnTextGroup) {
                            appendText('        '); // 8 regular spaces
                        }
                        break;
                    // Bullet point
                    case 'bullet':
                        if (inPnTextGroup) {
                            // Ignore bullets inside pntext group
                            break;
                        }
                        // Start list if not already in one
                        if (!inList) {
                            flushText();
                            if (paragraphTagOpen) {
                                outputBuffer.push("</".concat(currentParagraphTag, ">"));
                                paragraphTagOpen = false;
                            }
                            // Clear any pending paragraph tag when starting list
                            pendingParagraphTag = '';
                            outputBuffer.push('<ul>');
                            inList = true;
                        }
                        // Close previous list item if any
                        if (listItems.length > 0) {
                            outputBuffer.push('</li>');
                        }
                        // Start new list item
                        outputBuffer.push('<li>');
                        listItems.push('');
                        break;
                    // Unicode
                    case 'uc':
                        if (param !== null && !isNaN(param))
                            ucSkip = param;
                        break;
                    case 'u':
                        if (param !== null) {
                            var code = param;
                            if (code < 0)
                                code += 65536;
                            appendText(String.fromCharCode(code));
                            skipFallback = ucSkip;
                        }
                        break;
                    // Color table
                    case 'colortbl':
                        inColorTable = true;
                        colorTableDepth = stateStack.length;
                        tempColorR = 0;
                        tempColorG = 0;
                        tempColorB = 0;
                        break;
                    case 'red':
                        if (inColorTable && param !== null)
                            tempColorR = param;
                        break;
                    case 'green':
                        if (inColorTable && param !== null)
                            tempColorG = param;
                        break;
                    case 'blue':
                        if (inColorTable && param !== null)
                            tempColorB = param;
                        break;
                    // Font table
                    case 'fonttbl':
                        inFontTable = true;
                        fontTableDepth = stateStack.length;
                        break;
                    // Stylesheet
                    case 'stylesheet':
                        inStyleSheet = true;
                        styleSheetDepth = stateStack.length;
                        break;
                    // List support (basic)
                    case 'pntext':
                        // This marks the start of a list item's bullet/number text
                        // Clear any accumulated text first (bullet markers before this command)
                        curText = '';
                        flushText();
                        // Mark that we're inside pntext group
                        inPnTextGroup = true;
                        pnTextDepth = stateStack.length;
                        // Start list if not already in one
                        if (!inList) {
                            if (paragraphTagOpen) {
                                outputBuffer.push("</".concat(currentParagraphTag, ">"));
                                paragraphTagOpen = false;
                            }
                            outputBuffer.push('<ul>');
                            inList = true;
                        }
                        // Close previous list item if any
                        if (listItems.length > 0) {
                            outputBuffer.push('</li>');
                        }
                        // Start new list item
                        outputBuffer.push('<li>');
                        listItems.push('');
                        break;
                    case 'pn':
                    case 'pnlvlblt':
                        // Start of list definition - mark that we're in a list
                        if (!inList) {
                            flushText();
                            if (pendingParagraphTag) {
                                outputBuffer.push(pendingParagraphTag);
                                pendingParagraphTag = '';
                            }
                            outputBuffer.push('<ul>');
                            inList = true;
                        }
                        break;
                    // Images
                    case 'pict':
                        flushText();
                        var pictType = null;
                        var picWidth = 0;
                        var picHeight = 0;
                        // Parse picture parameters
                        while (i < len) {
                            if (rtf[i] === ' ') {
                                i++;
                                break;
                            }
                            if (rtf[i] === '\\') {
                                i++;
                                var pictWordStart = i;
                                while (i < len && /[a-z]/i.test(rtf[i]))
                                    i++;
                                var pictWord = rtf.substring(pictWordStart, i);
                                var pictParam = null;
                                if (i < len && /[\d-]/.test(rtf[i])) {
                                    var pictNumStart = i;
                                    if (rtf[i] === '-')
                                        i++;
                                    while (i < len && /\d/.test(rtf[i]))
                                        i++;
                                    pictParam = parseInt(rtf.substring(pictNumStart, i), 10);
                                }
                                if (pictWord === 'pngblip')
                                    pictType = 'image/png';
                                else if (pictWord === 'jpegblip')
                                    pictType = 'image/jpeg';
                                else if (pictWord === 'picw' && pictParam)
                                    picWidth = pictParam;
                                else if (pictWord === 'pich' && pictParam)
                                    picHeight = pictParam;
                                if (i < len && rtf[i] === ' ')
                                    i++;
                            }
                            else {
                                i++;
                            }
                        }
                        // Read hex data
                        var hexData = '';
                        while (i < len && rtf[i] !== '}') {
                            var c = rtf[i];
                            if (/[0-9a-fA-F]/.test(c)) {
                                hexData += c;
                            }
                            i++;
                        }
                        if (hexData.length > 0 && pictType) {
                            var bytes = hexToBytes(hexData);
                            var base64 = bytesToBase64(bytes);
                            var imgTag = "<img src=\"data:".concat(pictType, ";base64,").concat(base64, "\" alt=\"Embedded image\"");
                            if (picWidth && picHeight) {
                                outputBuffer.push("".concat(imgTag, " style=\"width:").concat(picWidth, "px;height:").concat(picHeight, "px\" />"));
                            }
                            else {
                                outputBuffer.push("".concat(imgTag, " />"));
                            }
                        }
                        continue;
                    // Ignore common control words
                    case 'rtf':
                    case 'deff':
                    case 'deflang':
                    case 'fontemb':
                    case 'fontfile':
                    case 'fcharset':
                    case 'fprq':
                    case 'panose':
                    case 'fname':
                    case 'fbias':
                    case 'flominor':
                    case 'fhimajor':
                    case 'fdbmajor':
                    case 'fbimajor':
                    case 'flomajor':
                    case 'fnil':
                    case 'froman':
                    case 'fswiss':
                    case 'fmodern':
                    case 'fscript':
                    case 'fdecor':
                    case 'ftech':
                    case 'fbidi':
                    case 'viewkind':
                    case 'uc':
                    case 'lang':
                    case 'langfe':
                    case 'langnp':
                    case 'insrsid':
                    case 'charrsid':
                    case 'pararsid':
                    case 'sectrsid':
                    case 'rsid':
                    case 'generator':
                    case 'info':
                    case 'title':
                    case 'subject':
                    case 'author':
                    case 'manager':
                    case 'company':
                    case 'operator':
                    case 'category':
                    case 'keywords':
                    case 'comment':
                    case 'version':
                    case 'doccomm':
                    case 's':
                    case 'cs':
                    case 'ds':
                    case 'ts':
                    case 'tsrowd':
                    case 'ilfomacatclnup':
                    case 'ltrpar':
                    case 'rtlpar':
                    case 'ltrrow':
                    case 'rtlrow':
                    case 'ltrsect':
                    case 'rtlsect':
                    case 'ltrdoc':
                    case 'rtldoc':
                    case 'ltrch':
                    case 'rtlch':
                    case 'loch':
                    case 'hich':
                    case 'dbch':
                    case 'cs':
                    case 'kerning':
                    case 'expnd':
                    case 'expndtw':
                    case 'cchs':
                    case 'super':
                    case 'sub':
                    case 'nosupersub':
                    case 'strike':
                    case 'striked':
                    case 'v':
                    case 'up':
                    case 'dn':
                    case 'caps':
                    case 'scaps':
                    case 'outl':
                    case 'shad':
                    case 'embo':
                    case 'impr':
                    // Margins
                    case 'li':
                        if (param !== null) {
                            cur.marginLeft = Math.round(param / 20); // Convert twips to points
                            if (pendingParagraphTag && !paragraphHasContent) {
                                updatePendingParagraphTag();
                            }
                        }
                        break;
                    case 'ri':
                        if (param !== null) {
                            cur.marginRight = Math.round(param / 20); // Convert twips to points
                            if (pendingParagraphTag && !paragraphHasContent) {
                                updatePendingParagraphTag();
                            }
                        }
                        break;
                    // Page break
                    case 'page':
                        flushText();
                        outputBuffer.push('<div style="page-break-after:always"></div>');
                        break;
                    // Tab stops (basic support - treat as spaces for now)
                    case 'tqc':
                    case 'tqr':
                    case 'tql':
                    case 'tx':
                        // Tab positions - we'll handle tabs as simple spacing
                        break;
                    // Table support
                    case 'trowd':
                        // Start of table row definition - reset cell properties
                        flushText();
                        cellPropsArray = [];
                        currentCellProps = createDefaultCellProps();
                        if (!cur.inTable) {
                            if (paragraphTagOpen) {
                                outputBuffer.push("</".concat(currentParagraphTag, ">"));
                                paragraphTagOpen = false;
                            }
                            // Apply table alignment based on cur.tableAlign
                            var tableStyle = 'border-collapse:collapse;';
                            if (cur.tableAlign === 'center') {
                                tableStyle += 'margin-left:auto;margin-right:auto';
                            }
                            else if (cur.tableAlign === 'right') {
                                tableStyle += 'margin-left:auto;margin-right:0';
                            }
                            else {
                                // Default: left align
                                tableStyle += 'margin-left:0;margin-right:auto';
                            }
                            outputBuffer.push("<table style=\"".concat(tableStyle, "\">"));
                            cur.inTable = true;
                        }
                        outputBuffer.push('<tr>');
                        tableCellOpen = false;
                        break;
                    case 'trql':
                        // Table row align left
                        cur.tableAlign = 'left';
                        break;
                    case 'trqc':
                        // Table row align center
                        cur.tableAlign = 'center';
                        break;
                    case 'trqr':
                        // Table row align right
                        cur.tableAlign = 'right';
                        break;
                    case 'trleft':
                        // Table left position - we'll treat this as left alignment
                        cur.tableAlign = 'left';
                        break;
                    // Cell border definitions
                    case 'clbrdrt':
                        // Cell border top
                        currentCellProps.borders.top = true;
                        break;
                    case 'clbrdrb':
                        // Cell border bottom
                        currentCellProps.borders.bottom = true;
                        break;
                    case 'clbrdrl':
                        // Cell border left
                        currentCellProps.borders.left = true;
                        break;
                    case 'clbrdrr':
                        // Cell border right
                        currentCellProps.borders.right = true;
                        break;
                    // Cell merging
                    case 'clmgf':
                        // First cell in merged range
                        currentCellProps.mergeFirst = true;
                        break;
                    case 'clmrg':
                        // Merged with previous cell
                        currentCellProps.merged = true;
                        break;
                    // Cell vertical alignment
                    case 'clvertalt':
                        // Align top
                        currentCellProps.verticalAlign = 'top';
                        break;
                    case 'clvertalc':
                        // Align center
                        currentCellProps.verticalAlign = 'middle';
                        break;
                    case 'clvertalb':
                        // Align bottom
                        currentCellProps.verticalAlign = 'bottom';
                        break;
                    // Cell background color
                    case 'clcbpat':
                        // Cell background color index
                        if (param !== null && param > 0 && param <= colorTable.length) {
                            currentCellProps.backgroundColor = colorTable[param - 1];
                        }
                        break;
                    case 'cellx':
                        // Cell width definition (right edge position in twips)
                        if (param !== null) {
                            var prevWidth = cellPropsArray.length > 0 ?
                                (cellPropsArray[cellPropsArray.length - 1].width || 0) : 0;
                            currentCellProps.width = param - prevWidth;
                        }
                        // Store current cell properties and create new for next cell
                        cellPropsArray.push(__assign({}, currentCellProps));
                        currentCellProps = createDefaultCellProps();
                        break;
                    case 'intbl':
                        // We're inside a table - open a cell if needed
                        if (!tableCellOpen) {
                            flushText();
                            // Get cell properties for current cell
                            var cellIndex = cellPropsArray.length > 0 ?
                                outputBuffer.filter(function (s) { return s.includes('<td'); }).length % cellPropsArray.length : 0;
                            var cellProps = cellPropsArray[cellIndex] || createDefaultCellProps();
                            // Skip if this is a merged cell (not the first in merge)
                            if (cellProps.merged && !cellProps.mergeFirst) {
                                tableCellOpen = false;
                                break;
                            }
                            // Build cell style
                            var cellStyle = 'padding:5px;';
                            // Borders
                            if (cellProps.borders.top)
                                cellStyle += 'border-top:1px solid #000;';
                            if (cellProps.borders.bottom)
                                cellStyle += 'border-bottom:1px solid #000;';
                            if (cellProps.borders.left)
                                cellStyle += 'border-left:1px solid #000;';
                            if (cellProps.borders.right)
                                cellStyle += 'border-right:1px solid #000;';
                            // Width (convert twips to pixels: 1 twip = 1/1440 inch, assume 96 DPI)
                            if (cellProps.width) {
                                var widthPx = Math.round(cellProps.width * 96 / 1440);
                                cellStyle += "width:".concat(widthPx, "px;");
                            }
                            // Background color
                            if (cellProps.backgroundColor) {
                                cellStyle += "background-color:".concat(cellProps.backgroundColor, ";");
                            }
                            // Vertical alignment
                            if (cellProps.verticalAlign) {
                                cellStyle += "vertical-align:".concat(cellProps.verticalAlign, ";");
                            }
                            // Colspan for merged cells
                            var colspan = '';
                            if (cellProps.mergeFirst) {
                                var mergeCount = 1;
                                for (var i_1 = cellIndex + 1; i_1 < cellPropsArray.length; i_1++) {
                                    if (cellPropsArray[i_1].merged && !cellPropsArray[i_1].mergeFirst) {
                                        mergeCount++;
                                    }
                                    else {
                                        break;
                                    }
                                }
                                if (mergeCount > 1)
                                    colspan = " colspan=\"".concat(mergeCount, "\"");
                            }
                            outputBuffer.push("<td".concat(colspan, " style=\"").concat(cellStyle, "\">"));
                            tableCellOpen = true;
                        }
                        break;
                    case 'cell':
                        // End of table cell
                        flushText();
                        // Close any open paragraph inside the cell
                        if (paragraphTagOpen) {
                            outputBuffer.push("</".concat(currentParagraphTag, ">"));
                            paragraphTagOpen = false;
                        }
                        if (tableCellOpen) {
                            outputBuffer.push('</td>');
                        }
                        // Prepare for next cell - it will open automatically when text comes
                        tableCellOpen = false;
                        break;
                    case 'row':
                        // End of table row
                        flushText();
                        if (tableCellOpen) {
                            outputBuffer.push('</td>');
                            tableCellOpen = false;
                        }
                        outputBuffer.push('</tr>');
                        // Reset cell properties for next row
                        cellPropsArray = [];
                        currentCellProps = createDefaultCellProps();
                        break;
                    case 'fi':
                    case 'sb':
                    case 'sa':
                    case 'sl':
                    case 'slmult':
                    case 'keep':
                    case 'keepn':
                    case 'widctlpar':
                    case 'nowidctlpar':
                    case 'noline':
                    case 'pagebb':
                    case 'hyphpar':
                    case 'intbl':
                    case 'itap':
                    case 'pnlvl':
                    case 'pnf':
                    case 'pnfs':
                    case 'pnindent':
                    case 'pnstart':
                    case 'pndec':
                    case 'pnucltr':
                    case 'pnucrm':
                    case 'pnlcltr':
                    case 'pnlcrm':
                    case 'pncard':
                    case 'pnord':
                    case 'pntxta':
                    case 'pntxtb':
                    case 'pnhang':
                    case 'pnrestart':
                    case 'pnprev':
                        // Ignore these control words
                        break;
                    default:
                        // Unknown control word - ignore in non-strict mode
                        if (this.options.strictMode) {
                            throw new Error("Unknown RTF control word: \\".concat(word));
                        }
                        break;
                }
                continue;
            }
            // Regular text
            if (ch === '\r' || ch === '\n') {
                i++;
                continue;
            }
            // Handle special RTF characters in text
            if (ch === '~') {
                // Non-breaking space
                if (skipFallback > 0) {
                    skipFallback--;
                }
                else if (!inFontTable && !inStyleSheet && !inPnTextGroup) {
                    appendText('\u00A0'); // Non-breaking space
                }
                i++;
                continue;
            }
            if (inFontTable && currentFontNumber !== null) {
                // Collect font name text
                fontNameBuffer += ch;
            }
            else if (inStyleSheet) {
                // Ignore text inside stylesheet
                // (e.g., "Normal", "heading 1", etc.)
            }
            else if (inPnTextGroup) {
                // Ignore text inside pntext group
                // (bullet markers, tabs, etc.)
            }
            else {
                if (skipFallback > 0) {
                    skipFallback--;
                }
                else {
                    appendText(ch);
                }
            }
            i++;
        }
        // Flush remaining text
        flushText();
        // Close any pending paragraph
        if (pendingParagraphTag) {
            outputBuffer.push(pendingParagraphTag);
            paragraphTagOpen = true;
        }
        // Close current paragraph/heading tag if it's open
        if (paragraphTagOpen) {
            outputBuffer.push("</".concat(currentParagraphTag, ">"));
        }
        // Close list if still open
        if (inList) {
            if (listItems.length > 0) {
                outputBuffer.push('</li>');
            }
            outputBuffer.push('</ul>');
        }
        // Build final HTML with text direction and text-align
        var dirAttr = this.options.dir ? " dir=\"".concat(this.options.dir, "\"") : '';
        var textAlign = this.options.dir === 'rtl' ? 'right' : 'left';
        var html = "<div".concat(dirAttr, " style=\"text-align:").concat(textAlign, "\">").concat(outputBuffer.join(''), "</div>");
        // Cleanup empty tags
        html = cleanupEmptyTags(html);
        return html;
    };
    return RtfConverter;
}());
exports.RtfConverter = RtfConverter;
// ============================================
// Convenience Function
// ============================================
/**
 * Convert RTF to HTML (convenience function)
 * @param rtf - RTF document string
 * @param options - Converter options
 * @returns HTML string
 * @throws Error if conversion fails
 */
function rtfToHtml(rtf, options) {
    var converter = new RtfConverter(options);
    var result = converter.convert(rtf);
    if (!result.success) {
        throw new Error(result.error || 'Conversion failed');
    }
    return result.data || '';
}
// ============================================
// Hex Conversion Utilities
// ============================================
/**
 * Convert RTF to Hexadecimal string
 * Useful for storing RTF in database as hex
 * @param rtf - RTF document string
 * @returns Hexadecimal string
 * @example
 * const rtf = '{\\rtf1\\ansi Test}';
 * const hex = rtfToHex(rtf);
 * console.log(hex); // "7b5c727466315c616e736920546573747d"
 */
function rtfToHex(rtf) {
    var bytes = new TextEncoder().encode(rtf);
    return Array.from(bytes)
        .map(function (byte) {
        var hex = byte.toString(16);
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
    var bytes = [];
    for (var i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
}
/**
 * Convert Hex to HTML directly
 * Convenience function that combines hexToRtf and rtfToHtml
 * @param hex - Hexadecimal string from database
 * @param options - Converter options
 * @returns Conversion result with HTML or error
 * @example
 * const result = hexToHtml(hexFromDb);
 * if (result.success) {
 *   console.log(result.data); // HTML output
 * }
 */
function hexToHtml(hex, options) {
    try {
        var rtf = hexToRtf(hex);
        var converter = new RtfConverter(options);
        return converter.convert(rtf);
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Hex to HTML conversion failed',
        };
    }
}
// ============================================
// HTML to RTF Conversion
// ============================================
/**
 * Convert HTML to RTF
 * @param html - HTML string
 * @returns RTF document string
 * @example
 * const html = '<p><strong>Hello</strong></p>';
 * const rtf = htmlToRtf(html);
 */
function htmlToRtf(html) {
    var colorTable = ['\\red0\\green0\\blue0'];
    var colorMap = new Map();
    colorMap.set('rgb(0,0,0)', 1);
    colorMap.set('#000000', 1);
    colorMap.set('black', 1);
    function getColorIndex(color) {
        if (!color || color === 'inherit' || color === 'initial')
            return null;
        var normalized = color.toLowerCase().trim();
        // Named colors to RGB mapping
        var namedColors = {
            'red': 'rgb(255,0,0)',
            'green': 'rgb(0,128,0)',
            'blue': 'rgb(0,0,255)',
            'yellow': 'rgb(255,255,0)',
            'cyan': 'rgb(0,255,255)',
            'magenta': 'rgb(255,0,255)',
            'white': 'rgb(255,255,255)',
            'black': 'rgb(0,0,0)',
            'gray': 'rgb(128,128,128)',
            'grey': 'rgb(128,128,128)',
            'orange': 'rgb(255,165,0)',
            'purple': 'rgb(128,0,128)',
            'brown': 'rgb(165,42,42)',
            'pink': 'rgb(255,192,203)'
        };
        if (namedColors[normalized]) {
            normalized = namedColors[normalized];
        }
        if (normalized.startsWith('#')) {
            var hex = normalized.substring(1);
            var r = parseInt(hex.substring(0, 2), 16);
            var g = parseInt(hex.substring(2, 4), 16);
            var b = parseInt(hex.substring(4, 6), 16);
            normalized = "rgb(".concat(r, ",").concat(g, ",").concat(b, ")");
        }
        if (colorMap.has(normalized)) {
            return colorMap.get(normalized);
        }
        var rgbMatch = normalized.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            var r = rgbMatch[1], g = rgbMatch[2], b = rgbMatch[3];
            var rtfColor = "\\red".concat(r, "\\green").concat(g, "\\blue").concat(b);
            var index = colorTable.length + 1;
            colorTable.push(rtfColor);
            colorMap.set(normalized, index);
            return index;
        }
        return null;
    }
    var fontTable = ['B Nazanin'];
    var fontMap = new Map();
    fontMap.set('b nazanin', 0);
    function getFontIndex(fontFamily) {
        if (!fontFamily || fontFamily === 'inherit' || fontFamily === 'initial')
            return null;
        var fonts = fontFamily.split(',').map(function (f) { return f.trim().replace(/['"]/g, '').toLowerCase(); });
        var firstFont = fonts[0];
        if (fontMap.has(firstFont)) {
            return fontMap.get(firstFont);
        }
        var index = fontTable.length;
        fontTable.push(fontFamily.split(',')[0].trim().replace(/['"]/g, ''));
        fontMap.set(firstFont, index);
        return index;
    }
    var rtfBody = '';
    function parseNode(node, state) {
        if (state === void 0) { state = {}; }
        var newState = __assign({}, state);
        var content = '';
        // Text node
        if (node.nodeType === 3) {
            var text = node.textContent || '';
            // Convert tab placeholder to 8 spaces
            text = text.replace(/\{\{TAB\}\}/g, '        ');
            text = text
                .replace(/\\/g, '\\\\')
                .replace(/\{/g, '\\{')
                .replace(/\}/g, '\\}');
            var formatted = '';
            if (newState.bold)
                formatted += '\\b ';
            if (newState.italic)
                formatted += '\\i ';
            if (newState.underline)
                formatted += '\\ul ';
            if (newState.fontSize)
                formatted += "\\fs".concat(newState.fontSize * 2, " ");
            if (newState.fontIndex !== undefined)
                formatted += "\\f".concat(newState.fontIndex, " ");
            if (newState.colorIndex !== undefined)
                formatted += "\\cf".concat(newState.colorIndex, " ");
            formatted += Array.from(text).map(function (char) {
                var code = char.charCodeAt(0);
                // Non-breaking space → ~ in RTF
                if (code === 160 || code === 0xA0) {
                    return '~';
                }
                // Soft hyphen (optional hyphen) → \- in RTF
                if (code === 0xAD) {
                    return '\\-';
                }
                // Non-breaking hyphen → \_ in RTF
                if (code === 0x2011) {
                    return '\\_';
                }
                if (code > 127) {
                    return "\\u".concat(code, "?");
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
            var element = node;
            var tagName = element.tagName.toLowerCase();
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
                var style = element.getAttribute('style');
                if (style) {
                    var styles = style.split(';').reduce(function (acc, s) {
                        var _a = s.split(':').map(function (x) { return x.trim(); }), key = _a[0], value = _a[1];
                        if (key && value)
                            acc[key] = value;
                        return acc;
                    }, {});
                    if (styles.color) {
                        var colorIndex = getColorIndex(styles.color);
                        if (colorIndex)
                            newState.colorIndex = colorIndex;
                    }
                    if (styles['font-family']) {
                        var fontIndex = getFontIndex(styles['font-family']);
                        if (fontIndex !== null)
                            newState.fontIndex = fontIndex;
                    }
                    if (styles['font-size']) {
                        var size = parseInt(styles['font-size']);
                        if (!isNaN(size))
                            newState.fontSize = size;
                    }
                }
            }
            else if (tagName === 'p') {
                var style = element.getAttribute('style');
                var align = '';
                var margins = '';
                if (style) {
                    var alignMatch = style.match(/text-align:\s*(\w+)/);
                    if (alignMatch) {
                        var alignment = alignMatch[1];
                        if (alignment === 'right')
                            align = '\\qr ';
                        else if (alignment === 'center')
                            align = '\\qc ';
                        else if (alignment === 'justify')
                            align = '\\qj ';
                        else if (alignment === 'left')
                            align = '\\ql ';
                    }
                    // Parse margins (convert px to twips: 1px ≈ 15 twips at 96 DPI)
                    // Also support pt: 1pt = 20 twips
                    var marginLeftMatch = style.match(/margin-left:\s*(\d+)(px|pt)/);
                    if (marginLeftMatch) {
                        var marginValue = parseInt(marginLeftMatch[1]);
                        var unit = marginLeftMatch[2];
                        var marginTwips = unit === 'pt' ? marginValue * 20 : Math.round(marginValue * 15);
                        margins += "\\li".concat(marginTwips, " ");
                    }
                    var marginRightMatch = style.match(/margin-right:\s*(\d+)(px|pt)/);
                    if (marginRightMatch) {
                        var marginValue = parseInt(marginRightMatch[1]);
                        var unit = marginRightMatch[2];
                        var marginTwips = unit === 'pt' ? marginValue * 20 : Math.round(marginValue * 15);
                        margins += "\\ri".concat(marginTwips, " ");
                    }
                }
                content += '\\pard\\rtlpar' + align + margins;
            }
            else if (tagName === 'div') {
                // Check for page break
                var style = element.getAttribute('style');
                if (style && style.includes('page-break-after:always')) {
                    return '\\page\n';
                }
                // Div is just a container - don't add paragraph markers
                // Just process children
                for (var _i = 0, _a = Array.from(node.childNodes); _i < _a.length; _i++) {
                    var child = _a[_i];
                    content += parseNode(child, newState);
                }
                return content;
            }
            else if (tagName === 'ul' || tagName === 'ol') {
                // Lists - just process children (li elements)
                for (var _b = 0, _c = Array.from(node.childNodes); _b < _c.length; _b++) {
                    var child = _c[_b];
                    content += parseNode(child, newState);
                }
                return content;
            }
            else if (tagName === 'li') {
                // List item - add bullet/number and paragraph
                var isOrdered = node.parentNode && node.parentNode.tagName && node.parentNode.tagName.toLowerCase() === 'ol';
                if (isOrdered) {
                    // For ordered lists, we'll add numbers manually
                    content += '\\pard\\rtlpar ';
                }
                else {
                    // For unordered lists, add bullet and spaces
                    content += '\\pard\\rtlpar \\bullet        ';
                }
            }
            else if (tagName === 'br') {
                return '\\line ';
            }
            else if (tagName === 'table') {
                // Handle tables
                return parseTable(node);
            }
            else if (tagName === 'tr' || tagName === 'td' || tagName === 'th') {
                // These are handled inside parseTable, skip if encountered alone
                return '';
            }
            for (var _d = 0, _e = Array.from(node.childNodes); _d < _e.length; _d++) {
                var child = _e[_d];
                content += parseNode(child, newState);
            }
            if (tagName === 'p' || tagName === 'li') {
                content += '\\par\n';
            }
            return content;
        }
        return content;
    }
    // Parse HTML table to RTF table
    function parseTable(tableNode) {
        var tableRtf = '';
        var rows = Array.from(tableNode.querySelectorAll('tr'));
        if (rows.length === 0)
            return '';
        var _loop_1 = function (row) {
            var cells = Array.from(row.querySelectorAll('td, th'));
            if (cells.length === 0)
                return "continue";
            // Start row definition
            tableRtf += '\\trowd\\trleft0';
            // Calculate cell positions (in twips, 1440 twips = 1 inch)
            var cellX = 0;
            var cellWidths = [];
            // Extract cell widths and borders
            cells.forEach(function (cell, index) {
                var style = cell.getAttribute('style') || '';
                // Parse width
                var width = 1440; // Default 1 inch
                var widthMatch = style.match(/width:\s*(\d+)px/);
                if (widthMatch) {
                    var widthPx = parseInt(widthMatch[1]);
                    width = Math.round(widthPx * 1440 / 96); // Convert px to twips (96 DPI)
                }
                cellWidths.push(width);
                // Parse borders
                var hasBorderTop = style.includes('border-top');
                var hasBorderBottom = style.includes('border-bottom');
                var hasBorderLeft = style.includes('border-left');
                var hasBorderRight = style.includes('border-right');
                // Add cell border definitions
                if (hasBorderTop)
                    tableRtf += '\\clbrdrt\\brdrs\\brdrw15 ';
                if (hasBorderBottom)
                    tableRtf += '\\clbrdrb\\brdrs\\brdrw15 ';
                if (hasBorderLeft)
                    tableRtf += '\\clbrdrl\\brdrs\\brdrw15 ';
                if (hasBorderRight)
                    tableRtf += '\\clbrdrr\\brdrs\\brdrw15 ';
                // Define cell X position
                cellX += width;
                tableRtf += "\\cellx".concat(cellX);
            });
            // Add cell contents
            cells.forEach(function (cell) {
                tableRtf += '\\pard\\intbl\\rtlpar ';
                // Parse cell content
                for (var _i = 0, _a = Array.from(cell.childNodes); _i < _a.length; _i++) {
                    var child = _a[_i];
                    tableRtf += parseNode(child);
                }
                tableRtf += '\\cell ';
            });
            // End row
            tableRtf += '\\row\n';
        };
        for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
            var row = rows_1[_i];
            _loop_1(row);
        }
        return tableRtf;
    }
    // Browser environment with DOMParser
    if (typeof DOMParser !== 'undefined' || (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined')) {
        try {
            // Decode HTML entities and replace patterns before parsing
            html = html
                .replace(/(&nbsp;){8}/g, '{{TAB}}') // 8 consecutive &nbsp; to tab placeholder
                .replace(/&shy;|&#173;|&#xAD;/gi, '\u00AD') // Soft hyphen
                .replace(/&#8209;|&#x2011;/g, '\u2011'); // Non-breaking hyphen
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, 'text/html');
            if (doc.body) {
                rtfBody = parseNode(doc.body);
            }
        }
        catch (e) {
            // Fall through to regex fallback
        }
    }
    if (!rtfBody) {
        // Decode HTML entities first
        html = html
            .replace(/\{\{TAB\}\}/g, '\t') // Convert {{TAB}} placeholder to tab character
            .replace(/(&nbsp;){8}/g, '\t') // 8 consecutive non-breaking spaces to tab
            .replace(/&nbsp;/g, '\u00A0') // Convert &nbsp; to non-breaking space character
            .replace(/&shy;|&#173;|&#xAD;/gi, '\u00AD') // Convert soft hyphen entities to character
            .replace(/&#8209;|&#x2011;/g, '\u2011') // Convert non-breaking hyphen entities to character
            .replace(/&zwnj;|&#8204;|&#x200C;/g, '\u200C') // Convert ZWNJ entities to character
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
        // Fallback for Node.js (simple regex-based parsing)
        rtfBody = html
            .replace(/\t/g, '        ') // Convert tab characters to 8 spaces
            .replace(/<br\s*\/?>/gi, '\\line ')
            // Handle lists
            .replace(/<ul[^>]*>/gi, '')
            .replace(/<\/ul>/gi, '')
            .replace(/<ol[^>]*>/gi, '')
            .replace(/<\/ol>/gi, '')
            .replace(/<li[^>]*>/gi, '\\pard\\rtlpar \\bullet        ')
            .replace(/<\/li>/gi, '\\par\n')
            // Handle tables (basic support)
            .replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, function (match, tableContent) {
            var tableRtf = '';
            // Match each row
            var rowMatches = tableContent.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
            rowMatches.forEach(function (rowMatch) {
                // Start row
                tableRtf += '\\trowd\\trleft0';
                // Match cells in this row
                var cellMatches = rowMatch.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
                var cellX = 0;
                // First pass: define cell structure
                cellMatches.forEach(function (cellMatch) {
                    var styleMatch = cellMatch.match(/style=["']([^"']*)["']/);
                    var style = styleMatch ? styleMatch[1] : '';
                    // Parse width
                    var width = 1440; // Default 1 inch
                    var widthMatch = style.match(/width:\s*(\d+)px/);
                    if (widthMatch) {
                        var widthPx = parseInt(widthMatch[1]);
                        width = Math.round(widthPx * 1440 / 96);
                    }
                    // Add borders
                    if (style.includes('border-top'))
                        tableRtf += '\\clbrdrt\\brdrs\\brdrw15 ';
                    if (style.includes('border-bottom'))
                        tableRtf += '\\clbrdrb\\brdrs\\brdrw15 ';
                    if (style.includes('border-left'))
                        tableRtf += '\\clbrdrl\\brdrs\\brdrw15 ';
                    if (style.includes('border-right'))
                        tableRtf += '\\clbrdrr\\brdrs\\brdrw15 ';
                    cellX += width;
                    tableRtf += "\\cellx".concat(cellX);
                });
                // Second pass: add cell content
                cellMatches.forEach(function (cellMatch) {
                    // Extract content between tags
                    var contentMatch = cellMatch.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/i);
                    var content = contentMatch ? contentMatch[1] : '';
                    tableRtf += '\\pard\\intbl\\rtlpar ' + content + '\\cell ';
                });
                tableRtf += '\\row\n';
            });
            return tableRtf;
        })
            // Handle page breaks
            .replace(/<div[^>]*style=["']([^"']*page-break-after:\s*always[^"']*)["'][^>]*><\/div>/gi, '\\page\n')
            // Handle paragraphs with alignment and margins
            .replace(/<p([^>]*)>/gi, function (match, attrs) {
            var styleMatch = attrs.match(/style=["']([^"']*)["']/);
            if (!styleMatch)
                return '\\pard\\rtlpar ';
            var style = styleMatch[1];
            var rtf = '\\pard\\rtlpar';
            // Alignment
            if (style.includes('text-align:center'))
                rtf += '\\qc ';
            else if (style.includes('text-align:right'))
                rtf += '\\qr ';
            else if (style.includes('text-align:left'))
                rtf += '\\ql ';
            else if (style.includes('text-align:justify'))
                rtf += '\\qj ';
            else
                rtf += ' ';
            // Margins (convert px to twips: 1px ≈ 15 twips, or pt: 1pt = 20 twips)
            var marginLeftMatch = style.match(/margin-left:\s*(\d+)(px|pt)/);
            if (marginLeftMatch) {
                var marginValue = parseInt(marginLeftMatch[1]);
                var unit = marginLeftMatch[2];
                var marginTwips = unit === 'pt' ? marginValue * 20 : Math.round(marginValue * 15);
                rtf += "\\li".concat(marginTwips, " ");
            }
            var marginRightMatch = style.match(/margin-right:\s*(\d+)(px|pt)/);
            if (marginRightMatch) {
                var marginValue = parseInt(marginRightMatch[1]);
                var unit = marginRightMatch[2];
                var marginTwips = unit === 'pt' ? marginValue * 20 : Math.round(marginValue * 15);
                rtf += "\\ri".concat(marginTwips, " ");
            }
            return rtf;
        })
            .replace(/<\/p>/gi, '\\par\n')
            // Remove div tags - they're just containers (but page breaks handled above)
            .replace(/<\/?div[^>]*>/gi, '')
            .replace(/<strong[^>]*>|<b[^>]*>/gi, '\\b ')
            .replace(/<\/strong>|<\/b>/gi, '\\b0 ')
            .replace(/<em[^>]*>|<i[^>]*>/gi, '\\i ')
            .replace(/<\/em>|<\/i>/gi, '\\i0 ')
            .replace(/<u[^>]*>/gi, '\\ul ')
            .replace(/<\/u>/gi, '\\ul0 ')
            // Handle span with font-size
            .replace(/<span[^>]*style=["']([^"']*)["'][^>]*>/gi, function (match, style) {
            var rtf = '';
            var fontSizeMatch = style.match(/font-size:\s*(\d+)pt/);
            if (fontSizeMatch) {
                var size = parseInt(fontSizeMatch[1]);
                rtf += "\\fs".concat(size * 2, " ");
            }
            var fontFamilyMatch = style.match(/font-family:\s*([^;]+)/);
            if (fontFamilyMatch) {
                var fontIndex = getFontIndex(fontFamilyMatch[1]);
                if (fontIndex !== null)
                    rtf += "\\f".concat(fontIndex, " ");
            }
            var colorMatch = style.match(/color:\s*([^;]+)/);
            if (colorMatch) {
                var colorIndex = getColorIndex(colorMatch[1]);
                if (colorIndex)
                    rtf += "\\cf".concat(colorIndex, " ");
            }
            return rtf;
        })
            .replace(/<\/span>/gi, '\\cf0 ') // Reset color to default (black)
            .replace(/<[^>]+>/g, '');
        rtfBody = Array.from(rtfBody).map(function (char) {
            var code = char.charCodeAt(0);
            // Non-breaking space → ~ in RTF
            if (code === 160 || code === 0xA0) {
                return '~';
            }
            // Soft hyphen (optional hyphen) → \- in RTF
            if (code === 0xAD) {
                return '\\-';
            }
            // Non-breaking hyphen → \_ in RTF
            if (code === 0x2011) {
                return '\\_';
            }
            // Zero-width non-joiner → \u8204? in RTF
            if (code === 0x200C) {
                return '\\u8204?';
            }
            if (code > 127) {
                return "\\u".concat(code, "?");
            }
            return char;
        }).join('');
    }
    var rtf = '{\\rtf1\\ansi\\ansicpg1256\\deff0\n';
    rtf += '{\\fonttbl\n';
    fontTable.forEach(function (font, index) {
        rtf += "{\\f".concat(index, "\\fnil\\fcharset178 ").concat(font, ";}\n");
    });
    rtf += '}\n';
    rtf += '{\\colortbl ;';
    colorTable.forEach(function (color) {
        rtf += color + ';';
    });
    rtf += '}\n';
    rtf += rtfBody;
    rtf += '}';
    return rtf;
}
// Export for backward compatibility
exports.default = rtfToHtml;
