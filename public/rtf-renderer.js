// This file is auto-copied from src/rtf-renderer.js for browser demo
// If you edit the parser, re-copy or automate this step.
(function(){
// Lightweight RTF -> HTML renderer
// Supports: groups, bold/italic/underline, font sizes, color table, font table, \par, lists, unicode \uN, hex escapes \'hh, and basic pict images (png/jpg)
// Not a full RTF implementation but covers many real-world documents.

function hexToBytes(hex) {
	const bytes = [];
	for (let c = 0; c < hex.length; c += 2) {
		bytes.push(parseInt(hex.substr(c, 2), 16));
	}
	return new Uint8Array(bytes);
}

function bytesToBase64(bytes) {
	// Node/browser compatible base64 conversion
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(bytes).toString('base64');
	}
	let binary = '';
	const len = bytes.length;
	for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary);
}

function escapeHtml(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function emptyState() {
	return {
		bold: false,
		italic: false,
		underline: false,
		fontSize: null,
		font: null,
		color: null,
		listLevel: 0,
		align: null, // 'left', 'right', 'center', 'justify'
	};
}

function stateToStyle(s) {
	const styles = [];
	if (s.font) styles.push(`font-family:${s.font}`);
	if (s.fontSize) styles.push(`font-size:${s.fontSize}pt`);
	if (s.color) styles.push(`color:${s.color}`);
	return styles.length ? ` style="${styles.join(';')}"` : '';
}

function openInlineTags(state) {
	const tags = [];
	if (state.bold) tags.push('<strong>');
	if (state.italic) tags.push('<em>');
	if (state.underline) tags.push('<u>');
	return tags.join('');
}

function closeInlineTags(state) {
	const tags = [];
	if (state.underline) tags.push('</u>');
	if (state.italic) tags.push('</em>');
	if (state.bold) tags.push('</strong>');
	return tags.join('');
}

function rtfToHtml(rtf) {
	// Basic tokenizer-based parser
	const len = rtf.length;
	let i = 0;

	const stateStack = [emptyState()];
	const colorTable = [null]; // index 0 = default/auto, then colors as CSS rgb strings
	const fontTable = {}; // index -> name
	let inFontTable = false;
	let inColorTable = false;
	let tempColorR = 0, tempColorG = 0, tempColorB = 0;

	// Encoding and unicode-fallback handling
	let currentCodePage = 'windows-1252'; // default unless overridden by \ansicpgN
	let ucSkip = 1; // default number of chars to skip after \uN
	let skipFallback = 0; // countdown of pending fallback chars to skip

	// Cross-runtime byte decoder for single bytes according to code page (browser path)
	const textDecoders = new Map();
	function decodeByteWithEncoding(byte, encoding) {
		try {
			if (!textDecoders.has(encoding)) {
				textDecoders.set(encoding, new TextDecoder(encoding, { fatal: false }));
			}
			const dec = textDecoders.get(encoding);
			return dec.decode(new Uint8Array([byte]));
		} catch (_) {
			// Last resort: latin-1 style mapping
			return String.fromCharCode(byte);
		}
	}

	let out = '';
	let curText = '';
	let pendingParagraphTag = '';
	let paragraphHasContent = false;

	function appendText(txt) {
		curText += escapeHtml(txt);
	}

	function flushText() {
		if (!curText) return;
		if (pendingParagraphTag) {
			out += pendingParagraphTag;
			pendingParagraphTag = '';
			paragraphHasContent = true;
		}
		// Wrap according to current inline formatting
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

	function pushState() {
		const copy = Object.assign({}, stateStack[stateStack.length - 1]);
		stateStack.push(copy);
	}

	function popState() {
		stateStack.pop();
	}

	while (i < len) {
		const ch = rtf[i];
		if (ch === '{') {
			// start group
			flushText();
			pushState();
			i++;
			continue;
		}
		if (ch === '}') {
			flushText();
			// Check if we're closing font table or color table
			if (inFontTable) inFontTable = false;
			if (inColorTable) inColorTable = false;
			popState();
			i++;
			continue;
		}
		if (ch === ';') {
			// semicolon is a delimiter in color table and font table
			if (inColorTable) {
				// store accumulated color
				const colorStr = `rgb(${tempColorR},${tempColorG},${tempColorB})`;
				colorTable.push(colorStr);
				tempColorR = 0; tempColorG = 0; tempColorB = 0;
			}
			if (inFontTable) {
				// font table entries end with ;
				flushText();
				curText = '';
			}
			i++;
			continue;
		}
		if (ch === '\\') {
			// control word or escaped char
			i++;
			if (i >= len) break;
			const next = rtf[i];
			// escaped special characters: \\{ \\} \\\\ 
			if (next === '{' || next === '}' || next === '\\') {
				if (skipFallback > 0) {
					skipFallback--;
				} else {
					appendText(next);
				}
				i++;
				continue;
			}
			// hex escape: \\'hh
			if (next === "'") {
				i++;
				const hex = rtf.substr(i, 2);
				if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
					const byte = parseInt(hex, 16);
					if (skipFallback > 0) {
						// consume but don't emit
						skipFallback--;
					} else {
						const chDecoded = decodeByteWithEncoding(byte, currentCodePage);
						appendText(chDecoded);
					}
					i += 2;
					continue;
				}
			}

			// read control word (letters) optionally followed by a numeric parameter
			let cw = '';
			while (i < len) {
				const c = rtf[i];
				if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
					cw += c;
					i++;
				} else break;
			}
			// numeric parameter (optional, may be signed)
			let param = null;
			let negative = false;
			if (i < len && (rtf[i] === '-' || (rtf[i] >= '0' && rtf[i] <= '9'))) {
				if (rtf[i] === '-') { negative = true; i++; }
				let num = '';
				while (i < len && rtf[i] >= '0' && rtf[i] <= '9') { num += rtf[i++]; }
				param = parseInt(num || '0', 10) * (negative ? -1 : 1);
			}
			// a control word is delimited by space or any char other than letters/digits
			if (i < len && rtf[i] === ' ') { i++; }

			// handle common control words
			const cur = stateStack[stateStack.length - 1];
			switch (cw) {
				case 'ansi':
					// default Windows ANSI codepage unless overridden by ansicpg
					currentCodePage = 'windows-1252';
					break;
				case 'ansicpg':
					if (param !== null && !isNaN(param)) {
						currentCodePage = `windows-${param}`;
					}
					break;
				case 'b': // bold
					cur.bold = (param === 0) ? false : true;
					break;
				case 'i':
					cur.italic = (param === 0) ? false : true;
					break;
				case 'ul':
				case 'ulnone':
					cur.underline = (param === 0) ? false : true;
					break;
				case 'fs':
					if (param !== null) {
						// RTF fsN = font size in half-points
						cur.fontSize = Math.round(param / 2);
					}
					break;
				case 'f':
					if (param !== null) {
						if (inFontTable) {
							// We're defining a font in the font table
							// The font name will come as plain text after control words
							// We'll collect it until we hit ';'
							// Store font index for later
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
								else if (c === ';' && depth === 0) {
									// end of font entry
									break;
								}
								else if (c === '\\') {
									// skip control words within font definition
									j++;
									while (j < len && ((rtf[j] >= 'a' && rtf[j] <= 'z') || (rtf[j] >= 'A' && rtf[j] <= 'Z'))) j++;
									// skip parameter
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
							// Selecting a font
							const f = fontTable[param];
							if (f) cur.font = f;
						}
					}
					break;
				case 'cf':
					// color foreground
					if (param !== null && colorTable[param]) {
						cur.color = colorTable[param];
					}
					break;
				case 'qr':
					// right align
					cur.align = 'right';
					if (pendingParagraphTag) {
						pendingParagraphTag = '<p style="text-align:right">';
					}
					break;
				case 'qc':
					// center align
					cur.align = 'center';
					if (pendingParagraphTag) {
						pendingParagraphTag = '<p style="text-align:center">';
					}
					break;
				case 'ql':
					// left align
					cur.align = 'left';
					if (pendingParagraphTag) {
						pendingParagraphTag = '<p style="text-align:left">';
					}
					break;
				case 'qj':
					// justify
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
					// number of fallback chars for \uN
					if (param !== null && !isNaN(param)) ucSkip = param;
					break;
				case 'u':
					if (param !== null) {
						// unicode code point (signed 16-bit in RTF), handle negative
						let code = param;
						if (code < 0) code += 65536;
						appendText(String.fromCharCode(code));
						// In RTF a following character is often a fallback; many RTFs include it.
						skipFallback = ucSkip;
					}
					break;
				case 'colortbl':
					inColorTable = true;
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
					break;
				case 'pict':
					// graphics: collect picture hex until end of this group
					flushText();
					// detect picture type (jpeg/png) from subsequent control words (e.g., \pngblip, \jpegblip)
					let pictType = null;
					let pictHex = '';
					// scan forward within this group: we'll read until matching '}' at same group depth
					{
						let depth = 1; // we are inside the group that started before \pict
						while (i < len && depth > 0) {
							const c = rtf[i++];
							if (c === '{') { depth++; }
							else if (c === '}') { depth--; }
							else if (c === '\\') {
								// read control
								let j = i;
								let tag = '';
								while (j < len) {
									const cc = rtf[j];
									if ((cc >= 'a' && cc <= 'z') || (cc >= 'A' && cc <= 'Z')) { tag += cc; j++; }
									else break;
								}
								if (tag === 'pngblip') pictType = 'image/png';
								if (tag === 'jpegblip' || tag === 'jpgblip') pictType = 'image/jpeg';
								// advance i to j
								i = j;
							} else {
								// hex or whitespace
								if (/\s/.test(c)) continue;
								if (/[0-9A-Fa-f]/.test(c)) {
									// probably hex
									pictHex += c;
								}
							}
						}
					}
					// produce inline image if possible
					if (pictHex.length > 0 && pictType) {
						try {
							const bytes = hexToBytes(pictHex);
							const b64 = bytesToBase64(bytes);
							out += `<img src="data:${pictType};base64,${b64}" />`;
						} catch (e) {
							// fallback: output nothing
						}
					}
					break;
				case 'colortbl;':
					break;
				default:
					// Unhandled control word: skip
					break;
			}
			continue;
		}
		// normal character
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

	// ensure paragraph tags are closed properly
	// wrap output into a root container
	if (!/^\s*<p>/i.test(out)) {
		out = `<div>${out}</div>`;
	}
  
	// Clean up any stray font/color table text at the beginning
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

function htmlToRtf(html) {
  // Basic HTML to RTF converter
  // Handles: bold, italic, underline, paragraphs, alignment, colors, fonts
  
  const colorTable = ['\\red0\\green0\\blue0']; // Start with black as color 1
  const colorMap = new Map(); // Map CSS colors to RTF color indices
  colorMap.set('rgb(0,0,0)', 1);
  colorMap.set('#000000', 1);
  colorMap.set('black', 1);
  
  function getColorIndex(color) {
    if (!color || color === 'inherit' || color === 'initial') return null;
    
    // Normalize color
    let normalized = color.toLowerCase().trim();
    
    // Handle hex colors
    if (normalized.startsWith('#')) {
      const hex = normalized.substring(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      normalized = `rgb(${r},${g},${b})`;
    }
    
    // Check if we already have this color
    if (colorMap.has(normalized)) {
      return colorMap.get(normalized);
    }
    
    // Parse rgb(r,g,b)
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
  
  const fontTable = ['Arial']; // Default font
  const fontMap = new Map();
  fontMap.set('arial', 0);
  
  function getFontIndex(fontFamily) {
    if (!fontFamily || fontFamily === 'inherit' || fontFamily === 'initial') return null;
    
    // Get first font from font-family list
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
    const newState = { ...state };
    let content = '';
    
    if (node.nodeType === 3) { // Text node
      let text = node.textContent || '';
      // Escape RTF special characters
      text = text.replace(/\\/g, '\\\\')
                 .replace(/\{/g, '\\{')
                 .replace(/\}/g, '\\}');
      
      // Convert to RTF with current formatting
      let formatted = '';
      
      // Apply formatting codes
      if (newState.bold) formatted += '\\b ';
      if (newState.italic) formatted += '\\i ';
      if (newState.underline) formatted += '\\ul ';
      if (newState.fontSize) formatted += `\\fs${newState.fontSize * 2} `;
      if (newState.fontIndex !== undefined) formatted += `\\f${newState.fontIndex} `;
      if (newState.colorIndex !== undefined) formatted += `\\cf${newState.colorIndex} `;
      
      // Encode non-ASCII characters
      formatted += Array.from(text).map(char => {
        const code = char.charCodeAt(0);
        if (code > 127) {
          // Use Unicode escape
          return `\\u${code}?`;
        }
        return char;
      }).join('');
      
      // Reset formatting
      if (newState.bold) formatted += '\\b0 ';
      if (newState.italic) formatted += '\\i0 ';
      if (newState.underline) formatted += '\\ul0 ';
      
      return formatted;
    }
    
    if (node.nodeType === 1) { // Element node
      const tagName = node.tagName.toLowerCase();
      
      // Handle formatting tags
      if (tagName === 'strong' || tagName === 'b') {
        newState.bold = true;
      } else if (tagName === 'em' || tagName === 'i') {
        newState.italic = true;
      } else if (tagName === 'u') {
        newState.underline = true;
      } else if (tagName === 'span') {
        // Parse inline styles
        const style = node.getAttribute('style');
        if (style) {
          const styles = style.split(';').reduce((acc, s) => {
            const [key, value] = s.split(':').map(x => x.trim());
            if (key && value) acc[key] = value;
            return acc;
          }, {});
          
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
        // Handle paragraph alignment
        const style = node.getAttribute('style');
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
      
      // Process children
      for (const child of node.childNodes) {
        content += parseNode(child, newState);
      }
      
      // Add paragraph break for block elements
      if (tagName === 'p') {
        content += '\\par\n';
      } else if (tagName === 'div') {
        content += '\\par\n';
      }
      
      return content;
    }
    
    return content;
  }
  
  // Parse HTML string into DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Parse the body
  if (doc.body) {
    rtfBody = parseNode(doc.body);
  }
  
  // Build RTF document
  let rtf = '{\\rtf1\\ansi\\ansicpg1256\\deff0\n';
  
  // Font table
  rtf += '{\\fonttbl\n';
  fontTable.forEach((font, index) => {
    rtf += `{\\f${index}\\fnil\\fcharset178 ${font};}\n`;
  });
  rtf += '}\n';
  
  // Color table
  rtf += '{\\colortbl ;';
  colorTable.forEach(color => {
    rtf += color + ';';
  });
  rtf += '}\n';
  
  // Body
  rtf += rtfBody;
  rtf += '}';
  
  return rtf;
}

// ============================================
// Hex Converters
// ============================================

function rtfToHex(rtf) {
  // Convert RTF string to hexadecimal representation
  const bytes = new TextEncoder().encode(rtf);
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function hexToRtf(hex) {
  // Convert hexadecimal string to RTF
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
}

// ============================================
// Exports
// ============================================

window.rtfToHtml = rtfToHtml;
window.htmlToRtf = htmlToRtf;
window.rtfToHex = rtfToHex;
window.hexToRtf = hexToRtf;

