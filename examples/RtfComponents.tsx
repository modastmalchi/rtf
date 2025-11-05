import React, { useState } from 'react';
import { useRtfFromDatabase } from '../lib/useRtfConverter';

/**
 * Example: Display RTF content from database (stored as hex)
 */

interface RtfViewerProps {
  hexData: string;
  className?: string;
}

export const RtfViewer: React.FC<RtfViewerProps> = ({ hexData, className }) => {
  const { html, loading, error } = useRtfFromDatabase({
    hexData,
    autoConvert: true,
  });

  if (loading) {
    return <div className={className}>در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className={`${className} error`}>خطا: {error}</div>;
  }

  if (!html) {
    return <div className={className}>محتوایی وجود ندارد</div>;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ direction: 'rtl' }}
    />
  );
};

/**
 * Example: Editable RTF component with database integration
 */

interface EditableRtfProps {
  initialHexData?: string;
  onSave: (hexData: string) => Promise<void>;
  className?: string;
}

export const EditableRtf: React.FC<EditableRtfProps> = ({
  initialHexData,
  onSave,
  className,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  // Load initial data
  const { html: displayHtml, loading: loadingDisplay } = useRtfFromDatabase({
    hexData: initialHexData || null,
    autoConvert: true,
  });

  // For saving
  const { safeConvertHtmlToHex } = useRtfConverter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    if (displayHtml) {
      setHtmlContent(displayHtml);
    }
    setEditMode(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const result = safeConvertHtmlToHex(htmlContent);
      if (result.success && result.data) {
        await onSave(result.data);
        setEditMode(false);
      } else {
        setError(result.error || 'خطا در تبدیل');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setHtmlContent('');
    setError(null);
  };

  if (loadingDisplay) {
    return <div className={className}>در حال بارگذاری...</div>;
  }

  return (
    <div className={className}>
      {error && <div className="error">{error}</div>}

      {!editMode ? (
        <div>
          <div
            dangerouslySetInnerHTML={{ __html: displayHtml || '' }}
            style={{ direction: 'rtl', minHeight: '200px', padding: '10px' }}
          />
          <button onClick={handleEdit}>ویرایش</button>
        </div>
      ) : (
        <div>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '200px',
              direction: 'rtl',
              fontFamily: 'Arial',
            }}
          />
          <div>
            <button onClick={handleSave} disabled={saving}>
              {saving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
            <button onClick={handleCancel} disabled={saving}>
              انصراف
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Simple converter component
 */

import { useRtfConverter } from '../lib/useRtfConverter';
import { useHexListToHtml } from '../lib/useRtfConverter';

export const SimpleConverter: React.FC = () => {
  const { safeConvertHexToHtml, safeConvertHtmlToHex } = useRtfConverter();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'hexToHtml' | 'htmlToHex'>('hexToHtml');

  const handleConvert = () => {
    if (mode === 'hexToHtml') {
      const result = safeConvertHexToHtml(input);
      if (result.success && result.data) {
        setOutput(result.data);
      } else {
        alert('خطا: ' + result.error);
      }
    } else {
      const result = safeConvertHtmlToHex(input);
      if (result.success && result.data) {
        setOutput(result.data);
      } else {
        alert('خطا: ' + result.error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <h2>مبدل RTF</h2>

      <div>
        <label>
          <input
            type="radio"
            checked={mode === 'hexToHtml'}
            onChange={() => setMode('hexToHtml')}
          />
          Hex → HTML
        </label>
        <label>
          <input
            type="radio"
            checked={mode === 'htmlToHex'}
            onChange={() => setMode('htmlToHex')}
          />
          HTML → Hex
        </label>
      </div>

      <textarea
        placeholder={mode === 'hexToHtml' ? 'Hex از دیتابیس...' : 'HTML...'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', minHeight: '150px', marginTop: '10px' }}
      />

      <button onClick={handleConvert} style={{ marginTop: '10px' }}>
        تبدیل
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>خروجی:</h3>
        {mode === 'hexToHtml' ? (
          <div
            dangerouslySetInnerHTML={{ __html: output }}
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              minHeight: '100px',
            }}
          />
        ) : (
          <textarea
            value={output}
            readOnly
            style={{ width: '100%', minHeight: '150px' }}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Example: Render a list of hex records from database
 */
interface RtfListViewerProps {
  hexList: string[];
  itemClassName?: string;
  containerClassName?: string;
  separator?: React.ReactNode;
}

export const RtfListViewer: React.FC<RtfListViewerProps> = ({
  hexList,
  itemClassName,
  containerClassName,
  separator,
}) => {
  const { htmlList, loading, error } = useHexListToHtml({ hexList, autoConvert: true });

  if (loading) return <div className={containerClassName}>در حال بارگذاری...</div>;
  if (error) return <div className={containerClassName}>خطا: {error}</div>;
  if (!htmlList.length) return <div className={containerClassName}>موردی برای نمایش نیست</div>;

  return (
    <div className={containerClassName} style={{ direction: 'rtl' }}>
      {htmlList.map((html, idx) => (
        <React.Fragment key={idx}>
          <div
            className={itemClassName}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {idx < htmlList.length - 1 && (separator ?? <hr />)}
        </React.Fragment>
      ))}
    </div>
  );
};
