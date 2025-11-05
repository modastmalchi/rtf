import { useState, useCallback, useEffect } from 'react';
import {
  rtfToHtml,
  htmlToRtf,
  rtfToHex,
  hexToRtf,
  safeRtfToHtml,
  safeHexToHtml,
  safeHtmlToHex,
  safeHexListToHtml,
  ConversionResult,
} from './rtf-converter';

// ============================================
// React Hook: useRtfConverter
// ============================================

export interface UseRtfConverterReturn {
  // Conversion functions
  convertRtfToHtml: (rtf: string) => string;
  convertHtmlToRtf: (html: string) => string;
  convertRtfToHex: (rtf: string) => string;
  convertHexToRtf: (hex: string) => string;
  convertHtmlToHex: (html: string) => string;
  
  // Safe conversions (with error handling)
  safeConvertRtfToHtml: (rtf: string) => ConversionResult<string>;
  safeConvertHexToHtml: (hex: string) => ConversionResult<string>;
  safeConvertHtmlToHex: (html: string) => ConversionResult<string>;
  
  // State
  loading: boolean;
  error: string | null;
}

/**
 * React hook for RTF conversions
 * Provides all converter functions with state management
 */
export function useRtfConverter(): UseRtfConverterReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertRtfToHtml = useCallback((rtf: string): string => {
    setLoading(true);
    setError(null);
    try {
      const result = rtfToHtml(rtf);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Conversion failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const convertHtmlToRtf = useCallback((html: string): string => {
    setLoading(true);
    setError(null);
    try {
      const result = htmlToRtf(html);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Conversion failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const convertRtfToHex = useCallback((rtf: string): string => {
    return rtfToHex(rtf);
  }, []);

  const convertHexToRtf = useCallback((hex: string): string => {
    return hexToRtf(hex);
  }, []);

  const safeConvertRtfToHtml = useCallback((rtf: string): ConversionResult<string> => {
    return safeRtfToHtml(rtf);
  }, []);

  const safeConvertHexToHtml = useCallback((hex: string): ConversionResult<string> => {
    return safeHexToHtml(hex);
  }, []);

  const safeConvertHtmlToHex = useCallback((html: string): ConversionResult<string> => {
    return safeHtmlToHex(html);
  }, []);

  const convertHtmlToHex = useCallback((html: string): string => {
    const rtf = htmlToRtf(html);
    return rtfToHex(rtf);
  }, []);

  return {
    convertRtfToHtml,
    convertHtmlToRtf,
    convertRtfToHex,
    convertHexToRtf,
    convertHtmlToHex,
    safeConvertRtfToHtml,
    safeConvertHexToHtml,
    safeConvertHtmlToHex,
    loading,
    error,
  };
}

// ============================================
// React Hook: useRtfFromDatabase
// ============================================

export interface UseRtfFromDatabaseOptions {
  hexData: string | null;
  autoConvert?: boolean;
}

export interface UseRtfFromDatabaseReturn {
  html: string | null;
  rtf: string | null;
  loading: boolean;
  error: string | null;
  convert: () => void;
  reset: () => void;
}

/**
 * React hook specifically for converting hex data from database
 * @param options Hook options
 * @returns Conversion state and functions
 */
export function useRtfFromDatabase(
  options: UseRtfFromDatabaseOptions
): UseRtfFromDatabaseReturn {
  const { hexData, autoConvert = true } = options;
  const [html, setHtml] = useState<string | null>(null);
  const [rtf, setRtf] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(() => {
    if (!hexData) {
      setError('No hex data provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rtfResult = hexToRtf(hexData);
      setRtf(rtfResult);

      const htmlResult = rtfToHtml(rtfResult);
      setHtml(htmlResult);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Conversion failed';
      setError(errorMsg);
      setHtml(null);
      setRtf(null);
    } finally {
      setLoading(false);
    }
  }, [hexData]);

  const reset = useCallback(() => {
    setHtml(null);
    setRtf(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (autoConvert && hexData) {
      convert();
    }
  }, [hexData, autoConvert, convert]);

  return {
    html,
    rtf,
    loading,
    error,
    convert,
    reset,
  };
}

// ============================================
// React Hook: useHtmlToDatabase
// ============================================

export interface UseHtmlToDatabaseOptions {
  onSave?: (hexData: string) => void | Promise<void>;
}

export interface UseHtmlToDatabaseReturn {
  hexData: string | null;
  rtf: string | null;
  loading: boolean;
  error: string | null;
  convert: (html: string) => void;
  save: () => Promise<void>;
  reset: () => void;
}

/**
 * React hook for converting HTML to hex format for database storage
 * @param options Hook options with optional save callback
 * @returns Conversion state and functions
 */
export function useHtmlToDatabase(
  options?: UseHtmlToDatabaseOptions
): UseHtmlToDatabaseReturn {
  const { onSave } = options || {};
  const [hexData, setHexData] = useState<string | null>(null);
  const [rtf, setRtf] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback((html: string) => {
    setLoading(true);
    setError(null);

    try {
      const rtfResult = htmlToRtf(html);
      setRtf(rtfResult);

      const hexResult = rtfToHex(rtfResult);
      setHexData(hexResult);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Conversion failed';
      setError(errorMsg);
      setHexData(null);
      setRtf(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async () => {
    if (!hexData) {
      setError('No data to save');
      return;
    }

    if (!onSave) {
      setError('No save callback provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(hexData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Save failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [hexData, onSave]);

  const reset = useCallback(() => {
    setHexData(null);
    setRtf(null);
    setError(null);
  }, []);

  return {
    hexData,
    rtf,
    loading,
    error,
    convert,
    save,
    reset,
  };
}

// ============================================
// React Hook: useHexListToHtml
// ============================================

export interface UseHexListToHtmlOptions {
  hexList: string[] | null;
  autoConvert?: boolean;
}

export interface UseHexListToHtmlReturn {
  htmlList: string[];
  loading: boolean;
  error: string | null;
  convert: () => void;
  reset: () => void;
}

/**
 * React hook for converting a list of hex records from database into HTML list
 */
export function useHexListToHtml(
  options: UseHexListToHtmlOptions
): UseHexListToHtmlReturn {
  const { hexList, autoConvert = true } = options;
  const [htmlList, setHtmlList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(() => {
    if (!hexList || hexList.length === 0) {
      setHtmlList([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = safeHexListToHtml(hexList);
      if (result.success && result.data) {
        setHtmlList(result.data);
      } else {
        setHtmlList([]);
        setError(result.error || 'Conversion failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Conversion failed';
      setError(errorMsg);
      setHtmlList([]);
    } finally {
      setLoading(false);
    }
  }, [hexList]);

  const reset = useCallback(() => {
    setHtmlList([]);
    setError(null);
  }, []);

  useEffect(() => {
    if (autoConvert) {
      convert();
    }
  }, [autoConvert, convert]);

  return {
    htmlList,
    loading,
    error,
    convert,
    reset,
  };
}
