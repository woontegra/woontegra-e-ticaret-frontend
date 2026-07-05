import { useRef } from 'react';
import {
  Bold,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Underline,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from './Button';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML ?? '');
  };

  const handleLink = () => {
    const url = window.prompt('Link URL');
    if (url) exec('createLink', url);
    handleInput();
  };

  return (
    <div className={cn('overflow-hidden rounded-lg border border-slate-200', className)}>
      <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50 p-1.5">
        <ToolbarButton
          label="Kalın"
          onClick={() => {
            exec('bold');
            handleInput();
          }}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="İtalik"
          onClick={() => {
            exec('italic');
            handleInput();
          }}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Altı çizili"
          onClick={() => {
            exec('underline');
            handleInput();
          }}
        >
          <Underline className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Başlık"
          onClick={() => {
            exec('formatBlock', 'h2');
            handleInput();
          }}
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Madde işaretli liste"
          onClick={() => {
            exec('insertUnorderedList');
            handleInput();
          }}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Numaralı liste"
          onClick={() => {
            exec('insertOrderedList');
            handleInput();
          }}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Link" onClick={handleLink}>
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="prose prose-sm min-h-[240px] max-w-none px-3 py-2 text-sm text-slate-800 focus:outline-none"
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleInput}
        onBlur={handleInput}
      />
    </div>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
