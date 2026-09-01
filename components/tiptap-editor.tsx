'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';

import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, ImagePlus,
  List, ListOrdered, Quote, Code, Minus,
  Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, Pilcrow,
  Table as TableIcon, Plus, Trash2, Upload, Link2, Loader2, Image as ImageIcon,
  Edit3, Check, Layers,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useCallback, useRef, useState } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
}

// Heading levels config
const HEADING_LEVELS = [
  { level: 1, label: 'Heading 1', className: 'text-2xl font-bold' },
  { level: 2, label: 'Heading 2', className: 'text-xl font-bold' },
  { level: 3, label: 'Heading 3', className: 'text-lg font-semibold' },
  { level: 4, label: 'Heading 4', className: 'text-base font-semibold' },
  { level: 5, label: 'Heading 5', className: 'text-sm font-semibold' },
  { level: 6, label: 'Heading 6', className: 'text-xs font-semibold uppercase tracking-wide' },
] as const;

interface ImageItem {
  pos?: number;
  src: string;
  alt: string;
  title: string;
  width: string;
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = 'Start writing here…',
  editable = true,
  minHeight = '220px',
}: TipTapEditorProps) {
  const dialogFileInputRef = useRef<HTMLInputElement>(null);

  // Currently active/clicked image in editor
  const [activeImage, setActiveImage] = useState<ImageItem | null>(null);

  // Image Modal State
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [targetImagePos, setTargetImagePos] = useState<number | null>(null);
  const [targetImageSrc, setTargetImageSrc] = useState<string>('');
  const [imageSrc, setImageSrc] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [imageWidth, setImageWidth] = useState('100%');
  const [imageTab, setImageTab] = useState<'upload' | 'url' | 'list'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const openImageModalRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        bulletList: {
          HTMLAttributes: { class: 'list-disc pl-6 space-y-1' },
        },
        orderedList: {
          HTMLAttributes: { class: 'list-decimal pl-6 space-y-1' },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-primary/40 pl-4 italic text-muted-foreground my-4',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'bg-muted rounded px-1.5 py-0.5 font-mono text-sm text-primary',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto my-4',
          },
        },
        horizontalRule: {
          HTMLAttributes: { class: 'border-border my-6' },
        },
      }),
      Underline,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 hover:text-primary/80 transition-colors',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.extend({
        draggable: true,
        addAttributes() {
          return {
            ...this.parent?.(),
            src: {
              default: null,
              parseHTML: element => element.getAttribute('src'),
              renderHTML: attributes => {
                if (!attributes.src) return {};
                return { src: attributes.src };
              },
            },
            alt: {
              default: '',
              parseHTML: element => element.getAttribute('alt') || '',
              renderHTML: attributes => {
                if (!attributes.alt) return {};
                return { alt: attributes.alt };
              },
            },
            title: {
              default: '',
              parseHTML: element => element.getAttribute('title') || '',
              renderHTML: attributes => {
                if (!attributes.title) return {};
                return { title: attributes.title };
              },
            },
            width: {
              default: '100%',
              parseHTML: element => element.style.width || element.getAttribute('width') || '100%',
              renderHTML: attributes => {
                if (!attributes.width) return {};
                return {
                  style: `width: ${attributes.width}; max-width: 100%; height: auto;`,
                };
              },
            },
          };
        },
      }).configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg border border-border shadow-sm max-w-full my-2 inline-block mx-1 align-middle cursor-pointer hover:ring-2 hover:ring-primary/60 transition-all',
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-border',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-border',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-muted border border-border px-3 py-2 font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border px-3 py-2',
        },
      }),
    ],
    content,
    editable,
    editorProps: {
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        if (target && target.tagName === 'IMG') {
          const src = target.getAttribute('src') || '';
          const alt = target.getAttribute('alt') || '';
          const title = target.getAttribute('title') || '';
          const width = target.style.width || target.getAttribute('width') || '100%';
          const imagePos = view.posAtDOM(target, 0);

          setActiveImage({
            src,
            alt,
            title,
            width,
            pos: typeof imagePos === 'number' ? imagePos : pos,
          });
          return false;
        } else {
          // If clicked outside image, clear active selection
          setActiveImage(null);
          return false;
        }
      },
      handleDOMEvents: {
        dblclick: (view, event) => {
          const target = event.target as HTMLElement;
          if (target && target.tagName === 'IMG') {
            const src = target.getAttribute('src') || '';
            const alt = target.getAttribute('alt') || '';
            const title = target.getAttribute('title') || '';
            const width = target.style.width || target.getAttribute('width') || '100%';
            const imagePos = view.posAtDOM(target, 0);

            openImageModalRef.current?.({
              src,
              alt,
              title,
              width,
              pos: typeof imagePos === 'number' ? imagePos : undefined,
              isEdit: true,
            });
            return true;
          }
          return false;
        },
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            uploadFileAndOpenModal(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            uploadFileAndOpenModal(file);
            return true;
          }
        }
        return false;
      },
      transformPastedHTML: (html) => {
        return html
          .replace(/<p[^>]*>(\s|<br>)*<\/p>/gi, '') // Remove empty paragraphs or paragraphs with just a <br>
          .replace(/(<br\s*\/?>\s*){2,}/gi, '<br>'); // Replace multiple <br>s with a single <br>
      },
      attributes: {
        class: [
          'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none',
          'px-5 py-4 bg-background',
          '[&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-foreground',
          '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:text-foreground',
          '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-foreground',
          '[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-1.5 [&_h4]:text-foreground',
          '[&_h5]:text-base [&_h5]:font-semibold [&_h5]:mt-3 [&_h5]:mb-1 [&_h5]:text-foreground',
          '[&_h6]:text-sm [&_h6]:font-semibold [&_h6]:uppercase [&_h6]:tracking-widest [&_h6]:mt-3 [&_h6]:mb-1 [&_h6]:text-muted-foreground',
          '[&_p]:leading-7 [&_p]:my-2',
          '[&_a]:text-primary [&_a]:underline',
          '[&_hr]:border-border',
          '[&_img.ProseMirror-selectednode]:ring-2 [&_img.ProseMirror-selectednode]:ring-primary',
        ].join(' '),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  // Get all images currently inside the editor
  const getAllDocImages = useCallback((): ImageItem[] => {
    if (!editor) return [];
    const images: ImageItem[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'image') {
        images.push({
          pos,
          src: node.attrs.src || '',
          alt: node.attrs.alt || '',
          title: node.attrs.title || '',
          width: node.attrs.width || '100%',
        });
      }
    });
    return images;
  }, [editor]);

  // Open modal helper
  const openImageModal = useCallback((params?: {
    src?: string;
    alt?: string;
    title?: string;
    width?: string;
    pos?: number;
    isEdit?: boolean;
  }) => {
    if (params?.isEdit || params?.src) {
      setImageSrc(params.src || '');
      setTargetImageSrc(params.src || '');
      setImageAlt(params.alt || '');
      setImageTitle(params.title || '');
      setImageWidth(params.width || '100%');
      setTargetImagePos(params.pos !== undefined ? params.pos : null);
      setIsEditingImage(true);
      setImageTab('url');
    } else if (activeImage) {
      setImageSrc(activeImage.src);
      setTargetImageSrc(activeImage.src);
      setImageAlt(activeImage.alt);
      setImageTitle(activeImage.title);
      setImageWidth(activeImage.width || '100%');
      setTargetImagePos(activeImage.pos !== undefined ? activeImage.pos : null);
      setIsEditingImage(true);
      setImageTab('url');
    } else if (editor?.isActive('image')) {
      const attrs = editor.getAttributes('image');
      setImageSrc(attrs.src || '');
      setTargetImageSrc(attrs.src || '');
      setImageAlt(attrs.alt || '');
      setImageTitle(attrs.title || '');
      setImageWidth(attrs.width || '100%');
      setTargetImagePos(null);
      setIsEditingImage(true);
      setImageTab('url');
    } else {
      const docImages = getAllDocImages();
      setImageSrc('');
      setTargetImageSrc('');
      setImageAlt('');
      setImageTitle('');
      setImageWidth('100%');
      setTargetImagePos(null);
      setIsEditingImage(false);
      setImageTab(docImages.length > 0 ? 'list' : 'upload');
    }
    setUploadError(null);
    setImageModalOpen(true);
  }, [editor, activeImage, getAllDocImages]);

  openImageModalRef.current = openImageModal;

  // File upload logic
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('fieldType', 'image');

      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed');

      const url = json.data.url as string;
      setImageSrc(url);

      // Auto-populate alt text from file name if empty
      setImageAlt(prev => {
        if (prev) return prev;
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        return cleanName;
      });
      return url;
    } catch (err: any) {
      console.error('Image upload failed', err);
      setUploadError(err?.message || 'Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFileAndOpenModal = async (file: File) => {
    setImageModalOpen(true);
    setIsEditingImage(false);
    setTargetImagePos(null);
    setImageTab('upload');
    await uploadFile(file);
  };

  const handleDialogFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = '';
  };

  // Direct Update or Insert of Image Attributes
  const handleSaveImage = () => {
    if (!editor || !imageSrc.trim()) return;

    const trimmedSrc = imageSrc.trim();
    const trimmedAlt = imageAlt.trim();
    const trimmedTitle = imageTitle.trim();
    const widthVal = imageWidth || '100%';

    if (isEditingImage) {
      let updated = false;
      const { doc, tr } = editor.state;

      // Update the specific image node in the document directly by position or URL
      doc.descendants((node, pos) => {
        if (node.type.name === 'image') {
          if (targetImagePos !== null && pos === targetImagePos) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              alt: trimmedAlt,
              title: trimmedTitle,
              width: widthVal,
              src: trimmedSrc || node.attrs.src,
            });
            updated = true;
            return false;
          } else if (!updated && targetImageSrc && node.attrs.src === targetImageSrc) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              alt: trimmedAlt,
              title: trimmedTitle,
              width: widthVal,
              src: trimmedSrc || node.attrs.src,
            });
            updated = true;
            return false;
          }
        }
      });

      if (updated) {
        editor.view.dispatch(tr);
        // Sync activeImage state
        setActiveImage({
          src: trimmedSrc,
          alt: trimmedAlt,
          title: trimmedTitle,
          width: widthVal,
          pos: targetImagePos ?? undefined,
        });
      } else {
        // Fallback update
        editor.chain().focus().updateAttributes('image', {
          src: trimmedSrc,
          alt: trimmedAlt,
          title: trimmedTitle,
          width: widthVal,
        }).run();
      }
    } else {
      // Insert new image
      editor.chain().focus().setImage({
        src: trimmedSrc,
        alt: trimmedAlt,
        title: trimmedTitle,
      }).updateAttributes('image', {
        width: widthVal,
      }).run();
    }

    setImageModalOpen(false);
  };

  const handleDeleteImage = () => {
    if (!editor) return;
    if (targetImagePos !== null) {
      const { tr } = editor.state;
      tr.delete(targetImagePos, targetImagePos + 1);
      editor.view.dispatch(tr);
    } else {
      editor.chain().focus().deleteSelection().run();
    }
    setActiveImage(null);
    setImageModalOpen(false);
  };

  // Sync external content
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content || '', { emitUpdate: false });
    }
  }, [editor, content]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL:', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  // Save product to API
  const saveProduct = useCallback(async () => {
    if (!editor) return;
    const title = window.prompt('Product title:');
    if (!title) return;
    const defaultSlug = title.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = window.prompt('Product slug:', defaultSlug) || defaultSlug;
    const html = editor.getHTML();

    const body = {
      title,
      slug,
      description: html,
    };

    try {
      const res = await fetch('/api/data/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = json?.error || json?.message || res.statusText || 'Unknown error';
        if (errMsg.toLowerCase().includes('already using') || errMsg.toLowerCase().includes('500 collections')) {
          alert('Cannot create collection: quota reached. Create the `product` collection manually or use an existing collection.');
        } else {
          alert('Save failed: ' + errMsg);
        }
        console.error('Save product error', errMsg, json);
        return;
      }
      alert('Product saved successfully' + (json?.id ? ` (id: ${json.id})` : ''));
    } catch (err: any) {
      console.error('Save product exception', err);
      alert('Save failed: ' + (err?.message || err));
    }
  }, [editor]);

  if (!editor) {
    return (
      <div
        className="border rounded-md flex items-center justify-center text-muted-foreground text-sm"
        style={{ minHeight }}
      >
        <span className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin mr-2" />
        Loading editor…
      </div>
    );
  }

  // Which heading is active
  const activeHeading = HEADING_LEVELS.find(h => editor.isActive('heading', { level: h.level }));
  const headingLabel = activeHeading?.label ?? 'Paragraph';
  const allExistingImages = getAllDocImages();

  const TB = ({
    onClick,
    isActive = false,
    disabled = false,
    title,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-7 w-7 p-0 rounded transition-colors ${
        isActive
          ? 'bg-white/20 text-white hover:bg-white/25'
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </Button>
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background shadow-sm">
      {editable && (
        <div className="sticky top-0 z-30 flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-border bg-[#1f8989] text-white">
          {/* ── Heading / Paragraph dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-medium min-w-[100px] justify-between gap-1 text-white hover:bg-white/10"
              >
                {headingLabel}
                <span className="text-white/60">▾</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`flex items-center gap-2 ${!editor.isActive('heading') ? 'bg-primary/10 text-primary' : ''}`}
              >
                <Pilcrow className="w-4 h-4" />
                <span className="text-sm">Paragraph</span>
              </DropdownMenuItem>
              {HEADING_LEVELS.map(({ level, label, className }) => (
                <DropdownMenuItem
                  key={level}
                  onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                  className={`flex items-center gap-2 ${editor.isActive('heading', { level }) ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <span className="w-6 text-center text-xs font-bold text-muted-foreground">H{level}</span>
                  <span className={className}>{label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-5 mx-1 bg-white/20" />

          {/* ── Text formatting ── */}
          <TB onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
            <Bold className="w-3.5 h-3.5" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
            <Italic className="w-3.5 h-3.5" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)">
            <UnderlineIcon className="w-3.5 h-3.5" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
            <Strikethrough className="w-3.5 h-3.5" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline code">
            <Code className="w-3.5 h-3.5" />
          </TB>

          <Separator orientation="vertical" className="h-5 mx-1 bg-white/20" />

          {/* ── Lists ── */}
          <TB onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet list">
            <List className="w-3.5 h-3.5" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered list">
            <ListOrdered className="w-3.5 h-3.5" />
          </TB>

          <Separator orientation="vertical" className="h-5 mx-1 bg-white/20" />

          {/* ── Blocks ── */}
          <TB onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
            <Quote className="w-3.5 h-3.5" />
          </TB>
          <TB onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code block">
            <Code className="w-3.5 h-3.5 opacity-70" />
          </TB>
          <TB onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
            <Minus className="w-3.5 h-3.5" />
          </TB>

          <Separator orientation="vertical" className="h-5 mx-1 bg-white/20" />

          {/* ── Link ── */}
          <TB onClick={setLink} isActive={editor.isActive('link')} title="Insert link">
            <LinkIcon className="w-3.5 h-3.5" />
          </TB>

          {/* ── Image with Alt & Title Modal ── */}
          <TB onClick={() => openImageModal()} title="Insert or Edit Image (Alt Text & Title)">
            <ImagePlus className="w-3.5 h-3.5" />
          </TB>

          {/* ── Image Resizing ── */}
          <Separator orientation="vertical" className="h-5 mx-1 bg-white/20" />
          <TB onClick={() => editor.chain().focus().updateAttributes('image', { width: '25%' }).run()} title="Small (25%)">
            <span className="text-[10px] font-bold">25%</span>
          </TB>
          <TB onClick={() => editor.chain().focus().updateAttributes('image', { width: '50%' }).run()} title="Medium (50%)">
            <span className="text-[10px] font-bold">50%</span>
          </TB>
          <TB onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()} title="Full (100%)">
            <span className="text-[10px] font-bold">100%</span>
          </TB>

          <Separator orientation="vertical" className="h-5 mx-1 bg-white/20" />

          {/* ── Alignment ── */}
          <TB onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align left">
            <AlignLeft className="w-3.5 h-3.5" />
          </TB>
          <TB onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align center">
            <AlignCenter className="w-3.5 h-3.5" />
          </TB>
          <TB onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align right">
            <AlignRight className="w-3.5 h-3.5" />
          </TB>
          <TB onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
            <AlignJustify className="w-3.5 h-3.5" />
          </TB>

          <Separator orientation="vertical" className="h-5 mx-1 bg-white/20" />

          {/* ── Tables ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-medium text-white hover:bg-white/10"
                title="Insert table"
              >
                <TableIcon className="w-3.5 h-3.5 mr-1" />
                Table
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => {
                editor.commands.insertTable?.({ rows: 3, cols: 3, withHeaderRow: true });
              }}>
                Insert Table
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                editor.commands.addRowAfter?.();
              }}>
                <Plus className="w-3.5 h-3.5 mr-2" />
                Add Row Below
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                editor.commands.addColumnAfter?.();
              }}>
                <Plus className="w-3.5 h-3.5 mr-2" />
                Add Column
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                editor.commands.deleteRow?.();
              }}>
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete Row
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                editor.commands.deleteColumn?.();
              }}>
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete Column
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                editor.commands.deleteTable?.();
              }}>
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-5 mx-1 bg-white/20" />
          <TB onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
            <Undo className="w-3.5 h-3.5" />
          </TB>
          <TB onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
            <Redo className="w-3.5 h-3.5" />
          </TB>
          <Separator orientation="vertical" className="h-5 mx-1 bg-white/20" />
          <TB onClick={saveProduct} title="Save product">
            <Plus className="w-3.5 h-3.5" />
          </TB>
        </div>
      )}

      {/* ── Active Image Selected Banner ── */}
      {editable && activeImage && (
        <div className="bg-teal-500/10 border-b border-teal-500/30 px-3 py-1.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-teal-600" />
              Selected Image:
            </span>
            <span className="text-muted-foreground truncate max-w-[200px]">
              {activeImage.alt ? (
                <span className="text-foreground font-medium">Alt: "{activeImage.alt}"</span>
              ) : (
                <span className="text-amber-600 font-medium">⚠️ No Alt Text set</span>
              )}
            </span>
            {activeImage.title && (
              <span className="text-muted-foreground truncate max-w-[200px]">
                Title: "{activeImage.title}"
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={() => openImageModal({ ...activeImage, isEdit: true })}
              className="h-6 text-xs px-2.5 bg-[#1f8989] hover:bg-[#1f8989]/90 text-white font-medium gap-1"
            >
              <Edit3 className="w-3 h-3" />
              Edit Alt Text & Title
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveImage(null)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* ── Editor area ── */}
      <div className="overflow-y-auto" style={{ minHeight, maxHeight: '400px' }}>
        <EditorContent editor={editor} />
      </div>

      {/* ── Status bar ── */}
      {editable && (
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-muted/20 text-[11px] text-muted-foreground">
          <span>
            {editor.storage?.characterCount?.characters?.() ?? editor.getText().length} chars
            {' · '}
            {editor.getText().trim().split(/\s+/).filter(Boolean).length} words
            {' · '}
            <span className="text-primary font-medium">💡 Double-click any image to edit its Alt Text & Title</span>
          </span>
          <span className="opacity-60">
            {activeHeading ? activeHeading.label : 'Paragraph'}
          </span>
        </div>
      )}

      {/* ── Image Insert & Edit Dialog ── */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto sm:max-w-lg z-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="w-5 h-5 text-primary" />
              {isEditingImage ? 'Edit Image (Alt Text & Title)' : 'Insert Image'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isEditingImage
                ? 'Update the Alt Text (for SEO & accessibility) and Title for this image without re-uploading.'
                : 'Upload or insert an image along with Alt Text for SEO/Accessibility and Title for tooltips.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* If NOT in direct edit mode, show Tabs */}
            {!isEditingImage ? (
              <Tabs value={imageTab} onValueChange={(val: any) => setImageTab(val)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {allExistingImages.length > 0 && (
                    <TabsTrigger value="list" className="flex items-center gap-1.5 text-xs">
                      <Layers className="w-3.5 h-3.5" />
                      In Article ({allExistingImages.length})
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="upload" className="flex items-center gap-1.5 text-xs">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Image
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-1.5 text-xs">
                    <Link2 className="w-3.5 h-3.5" />
                    Image URL
                  </TabsTrigger>
                </TabsList>

                {/* Tab: List of Existing Images in Document */}
                {allExistingImages.length > 0 && (
                  <TabsContent value="list" className="space-y-2 pt-2">
                    <p className="text-xs text-muted-foreground">
                      Select any existing image from your article to edit its Alt Text and Title directly:
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {allExistingImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <img
                              src={img.src}
                              alt={img.alt || 'Thumbnail'}
                              className="w-12 h-12 object-cover rounded border border-border flex-shrink-0"
                            />
                            <div className="text-xs truncate">
                              <p className="font-medium text-foreground truncate">
                                {img.alt ? `Alt: ${img.alt}` : <span className="text-amber-600">⚠️ No Alt Text</span>}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {img.title ? `Title: ${img.title}` : 'No title set'}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setImageSrc(img.src);
                              setTargetImageSrc(img.src);
                              setImageAlt(img.alt || '');
                              setImageTitle(img.title || '');
                              setImageWidth(img.width || '100%');
                              setTargetImagePos(img.pos ?? null);
                              setIsEditingImage(true);
                              setImageTab('url');
                            }}
                            className="h-7 text-xs px-2.5 flex-shrink-0 gap-1 text-[#1f8989] hover:text-[#1f8989]"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}

                {/* Tab: Upload */}
                <TabsContent value="upload" className="space-y-3 pt-2">
                  <div
                    onClick={() => dialogFileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/60 rounded-lg p-6 text-center cursor-pointer transition-colors bg-muted/10 hover:bg-muted/30 flex flex-col items-center justify-center gap-2"
                  >
                    <input
                      type="file"
                      ref={dialogFileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleDialogFileSelect}
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Uploading image…</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP, GIF, SVG</p>
                      </>
                    )}
                  </div>
                </TabsContent>

                {/* Tab: URL */}
                <TabsContent value="url" className="space-y-2 pt-2">
                  <Label htmlFor="image-src-input" className="text-xs font-semibold">
                    Image Source URL
                  </Label>
                  <Input
                    id="image-src-input"
                    placeholder="https://example.com/image.jpg or /uploads/..."
                    value={imageSrc}
                    onChange={e => setImageSrc(e.target.value)}
                    className="text-xs h-9"
                  />
                </TabsContent>
              </Tabs>
            ) : null}

            {uploadError && (
              <div className="rounded bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
                {uploadError}
              </div>
            )}

            {/* Live Preview If imageSrc exists */}
            {imageSrc && (
              <div className="border border-border/80 rounded-lg p-2.5 bg-muted/20 space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Selected Image Preview</span>
                  {isEditingImage && (
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Existing Image (No re-upload needed)
                    </span>
                  )}
                </div>
                <div className="flex justify-center bg-black/5 dark:bg-black/40 rounded p-2 overflow-hidden max-h-40">
                  <img
                    src={imageSrc}
                    alt={imageAlt || 'Preview'}
                    title={imageTitle || ''}
                    className="max-h-36 max-w-full object-contain rounded"
                  />
                </div>
              </div>
            )}

            {/* ── Alt Text Input (SEO & Accessibility) ── */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="image-alt-input" className="text-xs font-semibold flex items-center gap-1.5">
                  <span>Alt Text (Alternative Text)</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    SEO & Accessibility
                  </span>
                </Label>
              </div>
              <Input
                id="image-alt-input"
                placeholder="e.g. Brand voice strategy workshop notebook and coffee"
                value={imageAlt}
                onChange={e => setImageAlt(e.target.value)}
                className="text-xs h-9"
              />
              <p className="text-[11px] text-muted-foreground">
                Crucial for Google search ranking (SEO) and read aloud by screen readers.
              </p>
            </div>

            {/* ── Image Title Input (Tooltip / Caption) ── */}
            <div className="space-y-1.5">
              <Label htmlFor="image-title-input" className="text-xs font-semibold flex items-center gap-1.5">
                <span>Image Title</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Hover Tooltip
                </span>
              </Label>
              <Input
                id="image-title-input"
                placeholder="e.g. Discovering your brand voice guide"
                value={imageTitle}
                onChange={e => setImageTitle(e.target.value)}
                className="text-xs h-9"
              />
              <p className="text-[11px] text-muted-foreground">
                Displays as a floating tooltip when visitors hover over the image.
              </p>
            </div>

            {/* ── Image Width Selection ── */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Image Width / Size</Label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['25%', '50%', '75%', '100%'].map(w => (
                  <Button
                    key={w}
                    type="button"
                    variant={imageWidth === w ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageWidth(w)}
                    className="h-7 text-xs px-2.5"
                  >
                    {w}
                  </Button>
                ))}
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[11px] text-muted-foreground">Custom:</span>
                  <Input
                    placeholder="e.g. 600px or 80%"
                    value={imageWidth}
                    onChange={e => setImageWidth(e.target.value)}
                    className="w-24 h-7 text-xs px-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between pt-2 border-t border-border">
            {isEditingImage ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeleteImage}
                className="text-xs h-8"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Remove
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setImageModalOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveImage}
                disabled={!imageSrc.trim() || isUploading}
                className="text-xs h-8 bg-[#1f8989] hover:bg-[#1f8989]/90 text-white"
              >
                {isEditingImage ? 'Update Alt Text & Title' : 'Insert Image'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
