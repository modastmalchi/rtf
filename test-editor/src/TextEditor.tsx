import { FormInstance } from "antd/es/form";
import FormItem, { FormItemProps } from './FormItem';
import JoditEditor from "jodit-react";
import { useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { useSelector } from "react-redux";

interface RootState {
    theme: { mode: string }
}

interface TextEditorProps extends FormItemProps {
    form: FormInstance;
    readonly?: boolean;
}

export interface TextEditorRef {
    insertText: (text: string) => void;
    setHTML: (html: string) => void;
    getHTML: () => string;
    clear: () => void;
}

const TextEditor = forwardRef<TextEditorRef, TextEditorProps>((props, ref) => {
    const { name, label, readonly = false, form, ...restProps } = props;
    const editorRef = useRef<any>(null);
    const themeMode = useSelector((state: RootState) => state.theme.mode);

    useImperativeHandle(ref, () => ({
        setHTML: (html: string) => {
            const editor = editorRef.current;
            if (editor) {
                editor.value = html;
                if (name) {
                    form.setFieldValue(name, html);
                }
            }
        },

        insertText: (text: string) => {
            const editor = editorRef.current;
            if (!editor || readonly) return;

            try {
                editor.focus();
                setTimeout(() => {
                    if (editor.selection?.insertHTML) {
                        editor.selection.insertHTML(text);
                    } else if (editor.s?.insertHTML) {
                        editor.s.insertHTML(text);
                    } else {
                        editor.value = (editor.value || '') + text;
                    }
                    if (name) {
                        form.setFieldValue(name, editor.value);
                    }
                }, 50);
            } catch (error) {
                console.error('Error in insertText:', error);
            }
        },

        getHTML: () => {
            return editorRef.current?.value || '';
        },

        clear: () => {
            const editor = editorRef.current;
            if (editor) {
                editor.value = '';
                if (name) {
                    form.setFieldValue(name, '');
                }
            }
        }
    }), [form, name, readonly]);

    const config = useMemo(() => ({
        theme: themeMode === 'dark' ? 'dark' : 'default',
        extraClasses: themeMode === 'dark' ? 'jodit-dark-mode' : '',
        readonly,
        placeholder: "شروع به تایپ کنید...",
        language: "fa",
        height: 400,
        toolbarSticky: true,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        spellcheck: false,
        buttons: [
            'bold', 'italic', 'underline', '|',
            'font', 'fontsize', '|',
            'align', '|',
            'paragraph', '|',
            {
                name: 'rtl',
                tooltip: 'راست به چپ (RTL)',
                icon: '<span style="font-size: 12px; font-weight: bold;">RTL</span>',
                exec: (editor: any) => {
                    try {
                        const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'TD', 'TH'];
                        
                        // Get all blocks in editor
                        const allBlocks = Array.from(editor.editor.querySelectorAll(blockTags.join(',')));
                        
                        if (allBlocks.length === 0) {
                            // No blocks, apply to editor directly
                            editor.editor.style.direction = 'rtl';
                            editor.editor.style.textAlign = 'right';
                            return;
                        }
                        
                        // Check if there's a selection
                        const sel = editor.selection;
                        const range = sel?.range;
                        
                        if (range && !range.collapsed) {
                            // There's a selection, find which blocks are in it
                            const selectedBlocks: any[] = [];
                            
                            allBlocks.forEach((block: any) => {
                                try {
                                    // Check if block is in selection range
                                    const blockRange = document.createRange();
                                    blockRange.selectNode(block);
                                    
                                    if (range.intersectsNode && range.intersectsNode(block)) {
                                        selectedBlocks.push(block);
                                    } else if (blockRange && range.compareBoundaryPoints) {
                                        // Fallback method
                                        const startCompare = range.compareBoundaryPoints(Range.END_TO_START, blockRange);
                                        const endCompare = range.compareBoundaryPoints(Range.START_TO_END, blockRange);
                                        if (startCompare <= 0 && endCompare >= 0) {
                                            selectedBlocks.push(block);
                                        }
                                    }
                                } catch (e) {
                                    // If block contains selection cursor, include it
                                    if (block.contains(range.startContainer) || block.contains(range.endContainer)) {
                                        selectedBlocks.push(block);
                                    }
                                }
                            });
                            
                            // Apply to selected blocks
                            const targetBlocks = selectedBlocks.length > 0 ? selectedBlocks : allBlocks;
                            targetBlocks.forEach((block: any) => {
                                block.style.direction = 'rtl';
                                block.style.textAlign = 'right';
                                block.setAttribute('dir', 'rtl');
                            });
                        } else {
                            // No selection or collapsed selection, find current block
                            const current = sel?.current();
                            if (current) {
                                let block: any = current;
                                while (block && block !== editor.editor) {
                                    if (block.nodeType === 1 && blockTags.includes(block.nodeName)) {
                                        break;
                                    }
                                    block = block.parentNode;
                                }
                                
                                if (block && block !== editor.editor) {
                                    block.style.direction = 'rtl';
                                    block.style.textAlign = 'right';
                                    block.setAttribute('dir', 'rtl');
                                }
                            }
                        }
                        
                        editor.synchronizeValues();
                    } catch (e) {
                        console.error('RTL error:', e);
                    }
                }
            },
            {
                name: 'ltr',
                tooltip: 'چپ به راست (LTR)',
                icon: '<span style="font-size: 12px; font-weight: bold;">LTR</span>',
                exec: (editor: any) => {
                    try {
                        const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'TD', 'TH'];
                        
                        // Get all blocks in editor
                        const allBlocks = Array.from(editor.editor.querySelectorAll(blockTags.join(',')));
                        
                        if (allBlocks.length === 0) {
                            // No blocks, apply to editor directly
                            editor.editor.style.direction = 'ltr';
                            editor.editor.style.textAlign = 'left';
                            return;
                        }
                        
                        // Check if there's a selection
                        const sel = editor.selection;
                        const range = sel?.range;
                        
                        if (range && !range.collapsed) {
                            // There's a selection, find which blocks are in it
                            const selectedBlocks: any[] = [];
                            
                            allBlocks.forEach((block: any) => {
                                try {
                                    // Check if block is in selection range
                                    const blockRange = document.createRange();
                                    blockRange.selectNode(block);
                                    
                                    if (range.intersectsNode && range.intersectsNode(block)) {
                                        selectedBlocks.push(block);
                                    } else if (blockRange && range.compareBoundaryPoints) {
                                        // Fallback method
                                        const startCompare = range.compareBoundaryPoints(Range.END_TO_START, blockRange);
                                        const endCompare = range.compareBoundaryPoints(Range.START_TO_END, blockRange);
                                        if (startCompare <= 0 && endCompare >= 0) {
                                            selectedBlocks.push(block);
                                        }
                                    }
                                } catch (e) {
                                    // If block contains selection cursor, include it
                                    if (block.contains(range.startContainer) || block.contains(range.endContainer)) {
                                        selectedBlocks.push(block);
                                    }
                                }
                            });
                            
                            // Apply to selected blocks
                            const targetBlocks = selectedBlocks.length > 0 ? selectedBlocks : allBlocks;
                            targetBlocks.forEach((block: any) => {
                                block.style.direction = 'ltr';
                                block.style.textAlign = 'left';
                                block.setAttribute('dir', 'ltr');
                            });
                        } else {
                            // No selection or collapsed selection, find current block
                            const current = sel?.current();
                            if (current) {
                                let block: any = current;
                                while (block && block !== editor.editor) {
                                    if (block.nodeType === 1 && blockTags.includes(block.nodeName)) {
                                        break;
                                    }
                                    block = block.parentNode;
                                }
                                
                                if (block && block !== editor.editor) {
                                    block.style.direction = 'ltr';
                                    block.style.textAlign = 'left';
                                    block.setAttribute('dir', 'ltr');
                                }
                            }
                        }
                        
                        editor.synchronizeValues();
                    } catch (e) {
                        console.error('LTR error:', e);
                    }
                }
            },
            '|',
            'undo', 'redo',
        ],
        controls: {
            font: {
                list: {
                    "": "پیش‌فرض",
                    "IRANSans": "IRANSans",
                    "B Nazanin": "B Nazanin",
                    "B Yekan": "B Yekan",
                    "B Vazir": "B Vazir",
                    "B Titr": "B Titr",
                    "B Mitra": "B Mitra",
                }
            },
            fontsize: {
                list: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 28, 32, 36, 48, 72]
            }
        },
        events: {
            afterGetValue: (html: string) => {
                return html.replace(/font-size:\s*\d+px/gi, match => {
                    const px = parseInt(match.match(/\d+/)![0], 10);
                    const pt = Math.round(px * 0.75);
                    return `font-size:${pt}pt`;
                });
            }
        },
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: "insert_clear_html" as const,
        useNativeTooltip: true,
        toolbarAdaptive: false,
    }), [readonly, themeMode]);

    return (
        <FormItem
            name={name}
            label={label}
            {...restProps}
            style={{ direction: "rtl" }}
        >
            <div style={{ position: 'relative' }}>
                <JoditEditor
                    ref={editorRef}
                    config={config}
                    tabIndex={1}
                    onBlur={(newContent) => {
                        if (name) {
                            form.setFieldValue(name, newContent);
                        }
                    }}
                />
            </div>
        </FormItem>
    );
});

TextEditor.displayName = 'TextEditor';
export default TextEditor;
