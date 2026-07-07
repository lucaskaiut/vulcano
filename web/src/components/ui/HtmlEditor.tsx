import { useRef, useCallback, useEffect } from 'react'
import { Bold, Italic, Underline, Link, List, ListOrdered } from 'lucide-react'

type HtmlEditorProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  placeholder?: string
}

export function HtmlEditor({ value, onChange, label, error, placeholder }: HtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Set initial content on mount, or when value changes externally (ex: loading saved template)
  useEffect(() => {
    const el = editorRef.current
    if (!el) return

    // Don't overwrite if user is typing in the editor
    if (document.activeElement === el) return

    // Don't overwrite if already synced
    if (el.innerHTML === value) return

    el.innerHTML = value
  }, [value])

  const handleInput = useCallback(() => {
    if (!editorRef.current) return
    onChange(editorRef.current.innerHTML)
  }, [onChange])

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val)
    editorRef.current?.focus()
    handleInput()
  }, [handleInput])

  const handleLink = useCallback(() => {
    const url = window.prompt('URL do link:')
    if (url) exec('createLink', url)
  }, [exec])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    handleInput()
  }, [handleInput])

  const btnClass = 'flex size-8 items-center justify-center rounded transition-colors hover:bg-surface-sunken text-foreground-muted'

  return (
    <div>
      {label && <label className="mb-2 block text-sm font-medium text-foreground-muted">{label}</label>}

      <div className="rounded-lg border border-surface-sunken overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30">
        <div className="flex items-center gap-0.5 border-b border-surface-sunken bg-surface-sunken/30 px-2 py-1">
          <button type="button" onClick={() => exec('bold')} className={btnClass} title="Negrito"><Bold className="size-4" /></button>
          <button type="button" onClick={() => exec('italic')} className={btnClass} title="Itálico"><Italic className="size-4" /></button>
          <button type="button" onClick={() => exec('underline')} className={btnClass} title="Sublinhado"><Underline className="size-4" /></button>
          <span className="mx-1 h-5 w-px bg-surface-sunken" />
          <button type="button" onClick={handleLink} className={btnClass} title="Link"><Link className="size-4" /></button>
          <span className="mx-1 h-5 w-px bg-surface-sunken" />
          <button type="button" onClick={() => exec('insertUnorderedList')} className={btnClass} title="Lista"><List className="size-4" /></button>
          <button type="button" onClick={() => exec('insertOrderedList')} className={btnClass} title="Lista numerada"><ListOrdered className="size-4" /></button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          data-placeholder={placeholder ?? ''}
          className="min-h-[200px] px-4 py-3 text-sm text-foreground outline-none empty:before:text-foreground-subtle empty:before:content-[attr(data-placeholder)] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        />
      </div>

      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  )
}
