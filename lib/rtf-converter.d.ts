/**
 * RTF Converter Library v3.0
 * Professional-grade RTF to HTML converter
 * Optimized for React TypeScript projects
 * Supports Persian/Arabic (Windows-1256) and Latin (Windows-1252)
 *
 * @author Mostafa Dastmalchi
 * @version 3.0.0
 */
export interface RtfConverterOptions {
    /** Code page for character encoding (e.g., 'windows-1256', 'windows-1252') */
    codePage?: string;
    /** Enable strict validation of RTF syntax */
    strictMode?: boolean;
    /** Maximum document size in bytes (default: 10MB) */
    maxSize?: number;
    /** Text direction: 'rtl' (right-to-left) or 'ltr' (left-to-right). Default: 'rtl' for Persian/Arabic */
    dir?: 'rtl' | 'ltr';
}
export interface ConversionResult<T = string> {
    success: boolean;
    data?: T;
    error?: string;
    warnings?: string[];
}
/**
 * RTF to HTML Converter
 * Professional-grade converter with error handling and validation
 */
export declare class RtfConverter {
    private options;
    constructor(options?: RtfConverterOptions);
    /**
     * Convert RTF string to HTML with error handling
     * @param rtf - RTF document string
     * @returns Conversion result with HTML or error
     */
    convert(rtf: string): ConversionResult<string>;
    /**
     * Main RTF to HTML conversion logic
     * @param rtf - RTF document string
     * @returns HTML string
     */
    private rtfToHtml;
}
/**
 * Convert RTF to HTML (convenience function)
 * @param rtf - RTF document string
 * @param options - Converter options
 * @returns HTML string
 * @throws Error if conversion fails
 */
export declare function rtfToHtml(rtf: string, options?: RtfConverterOptions): string;
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
export declare function rtfToHex(rtf: string): string;
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
export declare function hexToRtf(hex: string): string;
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
export declare function hexToHtml(hex: string, options?: RtfConverterOptions): ConversionResult<string>;
/**
 * Convert HTML to RTF
 * @param html - HTML string
 * @returns RTF document string
 * @example
 * const html = '<p><strong>Hello</strong></p>';
 * const rtf = htmlToRtf(html);
 */
export declare function htmlToRtf(html: string): string;
export default rtfToHtml;
