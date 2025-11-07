/**
 * RTF Converter Library v3.0
 * Professional-grade RTF to HTML converter
 * Optimized for React TypeScript projects
 * Supports Persian/Arabic (Windows-1256) and Latin (Windows-1252)
 * 
 * @author Your Name
 * @version 3.0.0
 */

// ============================================
// Type Definitions
// ============================================

export interface RtfConverterOptions {
  /** Code page for character encoding (e.g., 'windows-1256', 'windows-1252') */
  codePage?: string;
  /** Enable strict validation of RTF syntax */
  strictMode?: boolean;
  /** Maximum document size in bytes (default: 10MB) */
  maxSize?: number;
}

export interface ConversionResult<T = string> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

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

interface ListState {
  active: boolean;
  level: number;
  items: string[];
}

// ============================================
// Constants
// ============================================

const DEFAULT_OPTIONS: Required<RtfConverterOptions> = {
  codePage: 'windows-1252',
  strictMode: false,
  maxSize: 10 * 1024 * 1024, // 10MB
};

const RTF_HEADER_REGEX = /^{\\rtf1/;

// ============================================
// Helper Functions
// ============================================

/**
 * Convert hex string to byte array
 * @param hex - Hex string (e.g., "48656c6c6f")
 * @returns Byte array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes: number[] = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return new Uint8Array(bytes);
}

/**
 * Convert byte array to base64 string
 * @param bytes - Byte array
 * @returns Base64 encoded string
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Escape HTML special characters
 * @param s - Input string
 * @returns HTML-safe string
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Validate RTF document structure
 * @param rtf - RTF string
 * @param options - Converter options
 * @returns Validation result
 */
function validateRtf(rtf: string, options: Required<RtfConverterOptions>): ConversionResult<void> {
  const warnings: string[] = [];

  // Check size
  if (rtf.length > options.maxSize) {
    return {
      success: false,
      error: `Document size (${rtf.length} bytes) exceeds maximum (${options.maxSize} bytes)`,
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
  let braceCount = 0;
  for (const ch of rtf) {
    if (ch === '{') braceCount++;
    if (ch === '}') braceCount--;
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
        error: `Invalid RTF document: ${braceCount} unclosed braces`,
      };
    }
    warnings.push(`Warning: ${braceCount} unclosed braces`);
  }

  return { success: true, warnings };
}

/**
 * Create empty RTF state
 * @returns Empty state object
 */
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

/**
 * Convert RTF state to inline CSS style string
 * @param s - RTF state
 * @returns CSS style attribute content
 */
function stateToStyle(s: RtfState): string {
  const styles: string[] = [];
  if (s.font) styles.push(`font-family:${s.font}`);
  if (s.fontSize) styles.push(`font-size:${s.fontSize}pt`);
  if (s.color) styles.push(`color:${s.color}`);
  return styles.length ? ` style="${styles.join(';')}"` : '';
}

/**
 * Generate opening HTML tags for inline formatting
 * @param state - Current RTF state
 * @returns Opening tags string
 */
function openInlineTags(state: RtfState): string {
  const tags: string[] = [];
  if (state.bold) tags.push('<strong>');
  if (state.italic) tags.push('<em>');
  if (state.underline) tags.push('<u>');
  return tags.join('');
}

/**
 * Generate closing HTML tags for inline formatting
 * @param state - Current RTF state
 * @returns Closing tags string
 */
function closeInlineTags(state: RtfState): string {
  const tags: string[] = [];
  if (state.underline) tags.push('</u>');
  if (state.italic) tags.push('</em>');
  if (state.bold) tags.push('</strong>');
  return tags.join('');
}

/**
 * Decode byte using specified encoding
 * @param byte - Byte value (0-255)
 * @param encoding - Encoding name
 * @returns Decoded character
 */
function decodeByteWithEncoding(byte: number, encoding: string): string {
  if (encoding === 'windows-1256') {
    // Windows-1256 (Arabic/Persian) mapping
    const win1256: Record<number, number> = {
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
    const mapped = win1256[byte];
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
function cleanupEmptyTags(html: string): string {
  // Single-pass cleanup with optimized regex
  let cleaned = html;
  let prevCleaned = '';
  
  // Iteratively remove empty inline tags until no more changes
  let iterations = 0;
  const maxIterations = 10; // Prevent infinite loops
  
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
export class RtfConverter {
  private options: Required<RtfConverterOptions>;

  constructor(options: RtfConverterOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Convert RTF string to HTML with error handling
   * @param rtf - RTF document string
   * @returns Conversion result with HTML or error
   */
  public convert(rtf: string): ConversionResult<string> {
    try {
      // Validate input
      const validation = validateRtf(rtf, this.options);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
          warnings: validation.warnings,
        };
      }

      // Convert
      const html = this.rtfToHtml(rtf);
      
      return {
        success: true,
        data: html,
        warnings: validation.warnings,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during conversion',
      };
    }
  }

  /**
   * Main RTF to HTML conversion logic
   * @param rtf - RTF document string
   * @returns HTML string
   */
  private rtfToHtml(rtf: string): string {
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
    let currentFontNumber: number | null = null;
    let fontNameBuffer = '';

    let currentCodePage = this.options.codePage;
    let ucSkip = 1;
    let skipFallback = 0;

    const outputBuffer: string[] = [];
    let curText = '';
    let pendingParagraphTag = '';
    let paragraphHasContent = false;
    
    // List state tracking
    let inList = false;
    let listLevel = 0;
    let listItems: string[] = [];

    const appendText = (txt: string): void => {
      curText += escapeHtml(txt);
    };

    const flushText = (): void => {
      if (!curText) return;
      
      if (pendingParagraphTag) {
        outputBuffer.push(pendingParagraphTag);
        pendingParagraphTag = '';
        paragraphHasContent = true;
      }
      
      const st = stateStack[stateStack.length - 1];
      const style = stateToStyle(st);
      const openTags = openInlineTags(st);
      const closeTags = closeInlineTags(st);
      
      if (openTags || style) {
        outputBuffer.push(`<span${style}>${openTags}${curText}${closeTags}</span>`);
      } else {
        outputBuffer.push(curText);
      }
      
      curText = '';
    };

    const pushState = (): void => {
      const copy = { ...stateStack[stateStack.length - 1] };
      stateStack.push(copy);
    };

    const popState = (): void => {
      if (stateStack.length > 1) {
        stateStack.pop();
      }
    };

    const getCurrentState = (): RtfState => {
      return stateStack[stateStack.length - 1];
    };

    // Main parsing loop
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
        if (i >= len) break;
        
        const next = rtf[i];
        
        // Escaped characters
        if (next === '{' || next === '}' || next === '\\') {
          if (skipFallback > 0) {
            skipFallback--;
          } else {
            appendText(next);
          }
          i++;
          continue;
        }
        
        // Hex escape
        if (next === "'") {
          i++;
          if (i + 1 < len) {
            const hex = rtf.substr(i, 2);
            const byte = parseInt(hex, 16);
            if (!isNaN(byte)) {
              if (skipFallback > 0) {
                skipFallback--;
              } else {
                const decoded = decodeByteWithEncoding(byte, currentCodePage);
                appendText(decoded);
              }
            }
            i += 2;
          }
          continue;
        }
        
        // Control word
        let wordStart = i;
        while (i < len && /[a-z]/i.test(rtf[i])) {
          i++;
        }
        
        const word = rtf.substring(wordStart, i);
        let param: number | null = null;
        
        // Parse parameter
        if (i < len && (rtf[i] === '-' || /\d/.test(rtf[i]))) {
          const numStart = i;
          if (rtf[i] === '-') i++;
          while (i < len && /\d/.test(rtf[i])) {
            i++;
          }
          param = parseInt(rtf.substring(numStart, i), 10);
        }
        
        // Optional space after control word
        if (i < len && rtf[i] === ' ') {
          i++;
        }
        
        const cur = getCurrentState();
        
        // Handle control words
        switch (word) {
          case 'ansi':
            currentCodePage = 'windows-1252';
            break;
          case 'ansicpg':
            if (param === 1256) currentCodePage = 'windows-1256';
            else if (param === 1252) currentCodePage = 'windows-1252';
            break;
            
          // Character formatting
          case 'b':
            const newBold = param === null || param !== 0;
            if (cur.bold !== newBold) flushText();
            cur.bold = newBold;
            break;
          case 'i':
            const newItalic = param === null || param !== 0;
            if (cur.italic !== newItalic) flushText();
            cur.italic = newItalic;
            break;
          case 'ul':
            const newUnderline = param === null || param !== 0;
            if (cur.underline !== newUnderline) flushText();
            cur.underline = newUnderline;
            break;
          case 'ulnone':
            if (cur.underline) flushText();
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
              } else {
                // Outside font table: selecting a font
                const fontName = fontTable[param];
                if (fontName) {
                  cur.font = fontName;
                }
              }
            }
            break;
            
          // Color
          case 'cf':
            if (param !== null && param < colorTable.length) {
              cur.color = colorTable[param];
            }
            break;
            
          // Paragraph alignment
          case 'qc':
            cur.align = 'center';
            if (pendingParagraphTag) {
              pendingParagraphTag = '<p style="text-align:center">';
            }
            break;
          case 'qr':
            cur.align = 'right';
            if (pendingParagraphTag) {
              pendingParagraphTag = '<p style="text-align:right">';
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
            
          // Paragraph reset
          case 'pard':
            flushText();
            if (pendingParagraphTag) {
              outputBuffer.push(pendingParagraphTag);
            }
            cur.align = null;
            paragraphHasContent = false;
            pendingParagraphTag = '<p>';
            break;
            
          // Paragraph break
          case 'par':
            flushText();
            if (!paragraphHasContent && !pendingParagraphTag) {
              outputBuffer.push('<br/>');
            } else {
              if (pendingParagraphTag) {
                outputBuffer.push(pendingParagraphTag);
                pendingParagraphTag = '';
              }
              const parAlign = cur.align;
              const parStyle = parAlign ? ` style="text-align:${parAlign}"` : '';
              outputBuffer.push(`</p><p${parStyle}>`);
              paragraphHasContent = false;
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
            appendText('\t');
            break;
            
          // Unicode
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
            
          // Color table
          case 'colortbl':
            inColorTable = true;
            colorTableDepth = stateStack.length;
            tempColorR = 0;
            tempColorG = 0;
            tempColorB = 0;
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
            
          // Font table
          case 'fonttbl':
            inFontTable = true;
            fontTableDepth = stateStack.length;
            break;
            
          // List support (basic)
          case 'pntext':
            // Bullet text - ignore for now, we'll use HTML bullets
            flushText();
            // Skip until we hit a tab or space
            while (i < len && rtf[i] !== '\t' && rtf[i] !== ' ' && rtf[i] !== '}') {
              i++;
            }
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
            let pictType: string | null = null;
            let picWidth = 0;
            let picHeight = 0;
            
            // Parse picture parameters
            while (i < len) {
              if (rtf[i] === ' ') {
                i++;
                break;
              }
              if (rtf[i] === '\\') {
                i++;
                const pictWordStart = i;
                while (i < len && /[a-z]/i.test(rtf[i])) i++;
                const pictWord = rtf.substring(pictWordStart, i);
                
                let pictParam: number | null = null;
                if (i < len && /[\d-]/.test(rtf[i])) {
                  const pictNumStart = i;
                  if (rtf[i] === '-') i++;
                  while (i < len && /\d/.test(rtf[i])) i++;
                  pictParam = parseInt(rtf.substring(pictNumStart, i), 10);
                }
                
                if (pictWord === 'pngblip') pictType = 'image/png';
                else if (pictWord === 'jpegblip') pictType = 'image/jpeg';
                else if (pictWord === 'picw' && pictParam) picWidth = pictParam;
                else if (pictWord === 'pich' && pictParam) picHeight = pictParam;
                
                if (i < len && rtf[i] === ' ') i++;
              } else {
                i++;
              }
            }
            
            // Read hex data
            let hexData = '';
            while (i < len && rtf[i] !== '}') {
              const c = rtf[i];
              if (/[0-9a-fA-F]/.test(c)) {
                hexData += c;
              }
              i++;
            }
            
            if (hexData.length > 0 && pictType) {
              const bytes = hexToBytes(hexData);
              const base64 = bytesToBase64(bytes);
              const imgTag = `<img src="data:${pictType};base64,${base64}" alt="Embedded image"`;
              if (picWidth && picHeight) {
                outputBuffer.push(`${imgTag} style="width:${picWidth}px;height:${picHeight}px" />`);
              } else {
                outputBuffer.push(`${imgTag} />`);
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
          case 'stylesheet':
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
          case 'fi':
          case 'li':
          case 'ri':
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
              throw new Error(`Unknown RTF control word: \\${word}`);
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
      
      if (inFontTable && currentFontNumber !== null) {
        // Collect font name text
        fontNameBuffer += ch;
      } else {
        if (skipFallback > 0) {
          skipFallback--;
        } else {
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
    }
    
    // Close list if still open
    if (inList) {
      outputBuffer.push('</ul>');
    }

    // Build final HTML
    let html = `<div>${outputBuffer.join('')}</div>`;
    
    // Cleanup empty tags
    html = cleanupEmptyTags(html);
    
    return html;
  }
}

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
export function rtfToHtml(rtf: string, options?: RtfConverterOptions): string {
  const converter = new RtfConverter(options);
  const result = converter.convert(rtf);
  
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
export function rtfToHex(rtf: string): string {
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
export function hexToRtf(hex: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
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
export function hexToHtml(hex: string, options?: RtfConverterOptions): ConversionResult<string> {
  try {
    const rtf = hexToRtf(hex);
    const converter = new RtfConverter(options);
    return converter.convert(rtf);
  } catch (error) {
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

  function parseNode(node: any, state: HtmlState = {}): string {
    const newState = { ...state };
    let content = '';

    // Text node
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

      formatted += Array.from(text as string).map((char) => {
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

    // Element node
    if (node.nodeType === 1) {
      const element = node;
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
          const styles = style.split(';').reduce((acc: any, s: string) => {
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
  if (typeof (global as any).DOMParser !== 'undefined' || typeof (global as any).window !== 'undefined') {
    try {
      const DOMParserClass = (global as any).DOMParser || (global as any).window?.DOMParser;
      const parser = new DOMParserClass();
      const doc = parser.parseFromString(html, 'text/html');
      if (doc.body) {
        rtfBody = parseNode(doc.body);
      }
    } catch (e) {
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

    rtfBody = Array.from(rtfBody as string).map((char) => {
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

// Export for backward compatibility
export default rtfToHtml;
