/**
 * RTF Converter Library
 * Optimized for React TypeScript projects
 * Supports Persian/Arabic (Windows-1256) and Latin (Windows-1252)
 */

// ============================================
// Type Definitions
// ============================================

export interface RtfConverterOptions {
  codePage?: string; // e.g., 'windows-1256', 'windows-1252'
}

export interface ConversionResult<T = string> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// Helper Functions
// ============================================

function hexToBytes(hex: string): Uint8Array {
  const bytes: number[] = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return new Uint8Array(bytes);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============================================
// RTF to HTML Converter
// ============================================

interface RtfState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number | null;
  font: string | null;
  color: string | null;
  listLevel: number;
  align: string | null;
}

function emptyState(): RtfState {
  return {
    bold: false,
    italic: false,
    underline: false,
    fontSize: null,
    font: null,
    color: null,
    listLevel: 0,
    align: null,
  };
}

function stateToStyle(s: RtfState): string {
  const styles: string[] = [];
  if (s.font) styles.push(`font-family:${s.font}`);
  if (s.fontSize) styles.push(`font-size:${s.fontSize}pt`);
  if (s.color) styles.push(`color:${s.color}`);
  return styles.length ? ` style="${styles.join(';')}"` : '';
}

function openInlineTags(state: RtfState): string {
  const tags: string[] = [];
  if (state.bold) tags.push('<strong>');
  if (state.italic) tags.push('<em>');
  if (state.underline) tags.push('<u>');
  return tags.join('');
}

function closeInlineTags(state: RtfState): string {
  const tags: string[] = [];
  if (state.underline) tags.push('</u>');
  if (state.italic) tags.push('</em>');
  if (state.bold) tags.push('</strong>');
  return tags.join('');
}

function decodeByteWithEncoding(byte: number, encoding: string): string {
  try {
    const decoder = new TextDecoder(encoding, { fatal: false });
    return decoder.decode(new Uint8Array([byte]));
  } catch {
    return String.fromCharCode(byte);
  }
}

/**
 * Convert RTF to HTML
 * @param rtf RTF string
 * @returns HTML string
 */
export function rtfToHtml(rtf: string): string {
  const len = rtf.length;
  let i = 0;

  const stateStack: RtfState[] = [emptyState()];
  const colorTable: (string | null)[] = [];
  const fontTable: Record<number, string> = {};
  let inFontTable = false;
  let inColorTable = false;
  let colorTableDepth = 0;
  let fontTableDepth = 0;
  let tempColorR = 0, tempColorG = 0, tempColorB = 0;

  let currentCodePage = 'windows-1252';
  let ucSkip = 1;
  let skipFallback = 0;

  let out = '';
  let curText = '';
  let pendingParagraphTag = '';
  let paragraphHasContent = false;

  function appendText(txt: string): void {
    curText += escapeHtml(txt);
  }

  function flushText(): void {
    if (!curText) return;
    if (pendingParagraphTag) {
      out += pendingParagraphTag;
      pendingParagraphTag = '';
      paragraphHasContent = true;
    }
    const st = stateStack[stateStack.length - 1];
    const style = stateToStyle(st);
    const openTags = openInlineTags(st);
    const closeTags = closeInlineTags(st);
    if (openTags || style) {
      out += `<span${style}>${openTags}${curText}${closeTags}</span>`;
    } else {
      out += curText;
    }
    curText = '';
  }

  function pushState(): void {
    const copy = { ...stateStack[stateStack.length - 1] };
    stateStack.push(copy);
  }

  function popState(): void {
    stateStack.pop();
  }

  while (i < len) {
    const ch = rtf[i];
    
    if (ch === '{') {
      flushText();
      pushState();
      i++;
      continue;
    }
    
    if (ch === '}') {
      flushText();
      // Check if we're closing the font/color table groups
      const currentDepth = stateStack.length;
      if (inFontTable && currentDepth <= fontTableDepth) {
        inFontTable = false;
      }
      if (inColorTable && currentDepth <= colorTableDepth) {
        inColorTable = false;
      }
      popState();
      i++;
      continue;
    }
    
    if (ch === ';') {
      if (inColorTable) {
        const colorStr = `rgb(${tempColorR},${tempColorG},${tempColorB})`;
        colorTable.push(colorStr);
        // console.log(`DEBUG: Added color at index ${colorTable.length - 1}: ${colorStr}`);
        tempColorR = 0; tempColorG = 0; tempColorB = 0;
      }
      if (inFontTable) {
        flushText();
        curText = '';
      }
      i++;
      continue;
    }
    
    if (ch === '\\') {
      i++;
      if (i >= len) break;
      const next = rtf[i];
      
      if (next === '{' || next === '}' || next === '\\') {
        if (skipFallback > 0) {
          skipFallback--;
        } else {
          appendText(next);
        }
        i++;
        continue;
      }
      
      if (next === "'") {
        i++;
        const hex = rtf.substr(i, 2);
        if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
          const byte = parseInt(hex, 16);
          if (skipFallback > 0) {
            skipFallback--;
          } else {
            const chDecoded = decodeByteWithEncoding(byte, currentCodePage);
            appendText(chDecoded);
          }
          i += 2;
          continue;
        }
      }

      let cw = '';
      while (i < len) {
        const c = rtf[i];
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
          cw += c;
          i++;
        } else break;
      }
      
      let param: number | null = null;
      let negative = false;
      if (i < len && (rtf[i] === '-' || (rtf[i] >= '0' && rtf[i] <= '9'))) {
        if (rtf[i] === '-') { negative = true; i++; }
        let num = '';
        while (i < len && rtf[i] >= '0' && rtf[i] <= '9') { num += rtf[i++]; }
        param = parseInt(num || '0', 10) * (negative ? -1 : 1);
      }
      
      if (i < len && rtf[i] === ' ') { i++; }

      const cur = stateStack[stateStack.length - 1];
      
      switch (cw) {
        case 'ansi':
          currentCodePage = 'windows-1252';
          break;
        case 'ansicpg':
          if (param !== null && !isNaN(param)) {
            currentCodePage = `windows-${param}`;
          }
          break;
        case 'b':
          cur.bold = (param === 0) ? false : true;
          break;
        case 'i':
          cur.italic = (param === 0) ? false : true;
          break;
        case 'ul':
          // \ul N  -> underline on (N != 0) or off (N == 0)
          cur.underline = (param === 0) ? false : true;
          break;
        case 'ulnone':
          // \ulnone explicitly turns underline off (often appears without a numeric parameter)
          cur.underline = false;
          break;
        case 'fs':
          if (param !== null) {
            cur.fontSize = Math.round(param / 2);
          }
          break;
        case 'f':
          if (param !== null) {
            if (inFontTable) {
              let fontName = '';
              let j = i;
              let depth = 0;
              while (j < len) {
                const c = rtf[j];
                if (c === '{') depth++;
                else if (c === '}') {
                  if (depth === 0) break;
                  depth--;
                }
                else if (c === ';' && depth === 0) break;
                else if (c === '\\') {
                  j++;
                  while (j < len && ((rtf[j] >= 'a' && rtf[j] <= 'z') || (rtf[j] >= 'A' && rtf[j] <= 'Z'))) j++;
                  if (j < len && rtf[j] === '-') j++;
                  while (j < len && rtf[j] >= '0' && rtf[j] <= '9') j++;
                  if (j < len && rtf[j] === ' ') j++;
                  continue;
                }
                else if (depth === 0 && c !== ' ' && c !== '\r' && c !== '\n' && c !== '\t') {
                  fontName += c;
                }
                j++;
              }
              fontName = fontName.trim();
              if (fontName) {
                fontTable[param] = fontName;
              }
            } else {
              const f = fontTable[param];
              if (f) cur.font = f;
            }
          }
          break;
        case 'cf':
          if (param !== null && colorTable[param]) {
            cur.color = colorTable[param];
          }
          break;
        case 'qr':
          cur.align = 'right';
          if (pendingParagraphTag) {
            pendingParagraphTag = '<p style="text-align:right">';
          }
          break;
        case 'qc':
          cur.align = 'center';
          if (pendingParagraphTag) {
            pendingParagraphTag = '<p style="text-align:center">';
          }
          break;
        case 'ql':
          cur.align = 'left';
          if (pendingParagraphTag) {
            pendingParagraphTag = '<p style="text-align:left">';
          }
          break;
        case 'qj':
          cur.align = 'justify';
          if (pendingParagraphTag) {
            pendingParagraphTag = '<p style="text-align:justify">';
          }
          break;
        case 'pard':
          flushText();
          if (pendingParagraphTag) {
            out += pendingParagraphTag;
          }
          // Reset paragraph formatting (pard resets to defaults)
          cur.align = null;
          paragraphHasContent = false;
          // Don't create the tag yet - wait for alignment commands like \qc, \qr
          pendingParagraphTag = '<p>'; // Will be updated if alignment is specified
          break;
        case 'par':
          flushText();
          // If paragraph is empty, just add <br> instead of new paragraph
          if (!paragraphHasContent && !pendingParagraphTag) {
            out += '<br/>';
          } else {
            if (pendingParagraphTag) {
              out += pendingParagraphTag;
              pendingParagraphTag = '';
            }
            const parAlign = cur.align;
            const parStyle = parAlign ? ` style="text-align:${parAlign}"` : '';
            out += `</p><p${parStyle}>`;
            paragraphHasContent = false;
          }
          // Reset character formatting at paragraph boundaries (non-standard but practical)
          cur.bold = false;
          cur.italic = false;
          cur.underline = false;
          break;
        case 'line':
          flushText();
          out += '<br/>';
          break;
        case 'tab':
          appendText('\t');
          break;
        case 'uc':
          if (param !== null && !isNaN(param)) ucSkip = param;
          break;
        case 'u':
          if (param !== null) {
            let code = param;
            if (code < 0) code += 65536;
            appendText(String.fromCharCode(code));
            skipFallback = ucSkip;
          }
          break;
        case 'colortbl':
          inColorTable = true;
          colorTableDepth = stateStack.length;
          tempColorR = 0; tempColorG = 0; tempColorB = 0;
          break;
        case 'red':
          if (inColorTable && param !== null) tempColorR = param;
          break;
        case 'green':
          if (inColorTable && param !== null) tempColorG = param;
          break;
        case 'blue':
          if (inColorTable && param !== null) tempColorB = param;
          break;
        case 'fonttbl':
          inFontTable = true;
          fontTableDepth = stateStack.length;
          break;
        case 'pict':
          flushText();
          let pictType: string | null = null;
          let pictHex = '';
          {
            let depth = 1;
            while (i < len && depth > 0) {
              const c = rtf[i++];
              if (c === '{') { depth++; }
              else if (c === '}') { depth--; }
              else if (c === '\\') {
                let j = i;
                let tag = '';
                while (j < len) {
                  const cc = rtf[j];
                  if ((cc >= 'a' && cc <= 'z') || (cc >= 'A' && cc <= 'Z')) { tag += cc; j++; }
                  else break;
                }
                if (tag === 'pngblip') pictType = 'image/png';
                if (tag === 'jpegblip' || tag === 'jpgblip') pictType = 'image/jpeg';
                i = j;
              } else {
                if (/\s/.test(c)) continue;
                if (/[0-9A-Fa-f]/.test(c)) {
                  pictHex += c;
                }
              }
            }
          }
          if (pictHex.length > 0 && pictType) {
            try {
              const bytes = hexToBytes(pictHex);
              const b64 = bytesToBase64(bytes);
              out += `<img src="data:${pictType};base64,${b64}" />`;
            } catch (e) {
              // ignore
            }
          }
          break;
      }
      continue;
    }
    
    if (!inFontTable && !inColorTable) {
      if (skipFallback > 0) {
        skipFallback--;
      } else {
        appendText(ch);
      }
    }
    i++;
  }

  flushText();

  if (!/^\s*<p>/i.test(out)) {
    out = `<div>${out}</div>`;
  }
  
  out = out.replace(/^<div>[^<]*?(?=<p>)/, '<div>');
  
  // Clean up empty tags iteratively until no more empty tags exist
  let prevOut = '';
  while (prevOut !== out) {
    prevOut = out;
    // Remove empty inline tags (strong, em, u)
    out = out.replace(/<(strong|em|u)>\s*<\/\1>/g, '');
    // Remove empty spans
    out = out.replace(/<span[^>]*>\s*<\/span>/g, '');
  }
  // Finally, replace empty paragraphs with <br/>
  out = out.replace(/<p[^>]*>\s*<\/p>/g, '<br/>');

  return out;
}

// ============================================
// HTML to RTF Converter
// ============================================

/**
 * Convert HTML to RTF
 * @param html HTML string
 * @returns RTF string
 */
export function htmlToRtf(html: string): string {
  const colorTable: string[] = ['\\red0\\green0\\blue0'];
  const colorMap = new Map<string, number>();
  colorMap.set('rgb(0,0,0)', 1);
  colorMap.set('#000000', 1);
  colorMap.set('black', 1);

  function getColorIndex(color: string): number | null {
    if (!color || color === 'inherit' || color === 'initial') return null;

    let normalized = color.toLowerCase().trim();

    if (normalized.startsWith('#')) {
      const hex = normalized.substring(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      normalized = `rgb(${r},${g},${b})`;
    }

    if (colorMap.has(normalized)) {
      return colorMap.get(normalized)!;
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

  const fontTable: string[] = ['Arial'];
  const fontMap = new Map<string, number>();
  fontMap.set('arial', 0);

  function getFontIndex(fontFamily: string): number | null {
    if (!fontFamily || fontFamily === 'inherit' || fontFamily === 'initial') return null;

    const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, '').toLowerCase());
    const firstFont = fonts[0];

    if (fontMap.has(firstFont)) {
      return fontMap.get(firstFont)!;
    }

    const index = fontTable.length;
    fontTable.push(fontFamily.split(',')[0].trim().replace(/['"]/g, ''));
    fontMap.set(firstFont, index);
    return index;
  }

  let rtfBody = '';

  interface HtmlState {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: number;
    fontIndex?: number;
    colorIndex?: number;
  }

  function parseNode(node: Node, state: HtmlState = {}): string {
    const newState = { ...state };
    let content = '';

    if (node.nodeType === 3) {
      let text = node.textContent || '';
      text = text
        .replace(/\\/g, '\\\\')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}');

      let formatted = '';

      if (newState.bold) formatted += '\\b ';
      if (newState.italic) formatted += '\\i ';
      if (newState.underline) formatted += '\\ul ';
      if (newState.fontSize) formatted += `\\fs${newState.fontSize * 2} `;
      if (newState.fontIndex !== undefined) formatted += `\\f${newState.fontIndex} `;
      if (newState.colorIndex !== undefined) formatted += `\\cf${newState.colorIndex} `;

      formatted += Array.from(text).map(char => {
        const code = char.charCodeAt(0);
        if (code > 127) {
          return `\\u${code}?`;
        }
        return char;
      }).join('');

      if (newState.bold) formatted += '\\b0 ';
      if (newState.italic) formatted += '\\i0 ';
      if (newState.underline) formatted += '\\ul0 ';

      return formatted;
    }

    if (node.nodeType === 1) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      if (tagName === 'strong' || tagName === 'b') {
        newState.bold = true;
      } else if (tagName === 'em' || tagName === 'i') {
        newState.italic = true;
      } else if (tagName === 'u') {
        newState.underline = true;
      } else if (tagName === 'span') {
        const style = element.getAttribute('style');
        if (style) {
          const styles = style.split(';').reduce((acc, s) => {
            const [key, value] = s.split(':').map(x => x.trim());
            if (key && value) acc[key] = value;
            return acc;
          }, {} as Record<string, string>);

          if (styles.color) {
            const colorIndex = getColorIndex(styles.color);
            if (colorIndex) newState.colorIndex = colorIndex;
          }

          if (styles['font-family']) {
            const fontIndex = getFontIndex(styles['font-family']);
            if (fontIndex !== null) newState.fontIndex = fontIndex;
          }

          if (styles['font-size']) {
            const size = parseInt(styles['font-size']);
            if (!isNaN(size)) newState.fontSize = size;
          }
        }
      } else if (tagName === 'p' || tagName === 'div') {
        const style = element.getAttribute('style');
        let align = '';
        if (style) {
          const alignMatch = style.match(/text-align:\s*(\w+)/);
          if (alignMatch) {
            const alignment = alignMatch[1];
            if (alignment === 'right') align = '\\qr ';
            else if (alignment === 'center') align = '\\qc ';
            else if (alignment === 'justify') align = '\\qj ';
            else if (alignment === 'left') align = '\\ql ';
          }
        }
        content += '\\pard' + align;
      } else if (tagName === 'br') {
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
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    if (doc.body) {
      rtfBody = parseNode(doc.body);
    }
  } else {
    // Fallback for Node.js (simple parsing)
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

    rtfBody = Array.from(rtfBody).map(char => {
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

// ============================================
// Hex Converters
// ============================================

/**
 * Convert RTF to Hexadecimal string
 * Useful for storing RTF in database as hex
 * @param rtf RTF string
 * @returns Hexadecimal string
 */
export function rtfToHex(rtf: string): string {
  const bytes = new TextEncoder().encode(rtf);
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert Hexadecimal string to RTF
 * Used to retrieve RTF from database hex format
 * @param hex Hexadecimal string
 * @returns RTF string
 */
export function hexToRtf(hex: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
}

// ============================================
// Safe Conversion Functions (with error handling)
// ============================================

/**
 * Safe RTF to HTML conversion with error handling
 * @param rtf RTF string or hex string
 * @param options Conversion options
 * @returns Conversion result with success status
 */
export function safeRtfToHtml(
  rtf: string,
  options?: RtfConverterOptions
): ConversionResult<string> {
  try {
    const html = rtfToHtml(rtf);
    return { success: true, data: html };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Safe Hex to HTML conversion (hex from database -> HTML)
 * @param hex Hexadecimal string from database
 * @returns Conversion result with success status
 */
export function safeHexToHtml(hex: string): ConversionResult<string> {
  try {
    const rtf = hexToRtf(hex);
    const html = rtfToHtml(rtf);
    return { success: true, data: html };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Safe HTML to Hex conversion (HTML -> RTF -> hex for database)
 * @param html HTML string
 * @returns Conversion result with success status
 */
export function safeHtmlToHex(html: string): ConversionResult<string> {
  try {
    const rtf = htmlToRtf(html);
    const hex = rtfToHex(rtf);
    return { success: true, data: hex };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// Batch/List Converters
// ============================================

/**
 * Convert a list of Hex strings (from database) to an array of HTML strings
 * @param hexes Array of hexadecimal strings
 * @returns Array of HTML strings (same order)
 */
export function hexListToHtml(hexes: string[]): string[] {
  if (!Array.isArray(hexes)) return [];
  return hexes.map((hex) => rtfToHtml(hexToRtf(hex)));
}

/**
 * Convert a list of Hex strings to a single combined HTML string
 * Each item is wrapped in a <div> and joined with the provided separator
 * @param hexes Array of hexadecimal strings
 * @param separator HTML string used between items (default: <hr/>)
 * @returns Combined HTML string
 */
export function hexListToCombinedHtml(hexes: string[], separator = '<hr/>'): string {
  const items = hexListToHtml(hexes).map((html) => `<div>${html}</div>`);
  return items.join(separator);
}

/**
 * Safe conversion for list of hex strings to array of HTML strings
 * @param hexes Array of hexadecimal strings
 * @returns ConversionResult with HTML array on success
 */
export function safeHexListToHtml(hexes: string[]): ConversionResult<string[]> {
  try {
    const htmlList = hexListToHtml(hexes);
    return { success: true, data: htmlList };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
