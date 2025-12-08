"use client"

import { useEffect, type RefObject } from 'react'
import "trix"
import "trix/dist/trix.css"

type Props = {
  editorRef: RefObject<HTMLDivElement>
}

export default function TrixInit({ editorRef }: Props) {
  useEffect(() => {
    const trixElement = editorRef.current?.querySelector('trix-editor')
    
    if (trixElement) {
      // 移除不需要的按钮
      const toolbar = editorRef.current?.querySelector('trix-toolbar')
      const unwantedButtons = toolbar?.querySelectorAll('.trix-button--icon-quote, .trix-button--icon-code, .trix-button--icon-decrease-nesting-level, .trix-button--icon-increase-nesting-level, .trix-button--icon-strike')
      unwantedButtons?.forEach(button => button.remove())

      // 添加对齐按钮
      const buttonGroup = toolbar?.querySelector('.trix-button-group--block-tools')
      if (buttonGroup) {
        const alignButtons = `
          <button type="button" class="trix-button trix-button--icon" data-trix-attribute="textAlign" data-trix-action="align" data-align="left" title="左对齐">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h10M3 18h14"/></svg>
          </button>
          <button type="button" class="trix-button trix-button--icon" data-trix-attribute="textAlign" data-trix-action="align" data-align="center" title="居中对齐">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M7 12h10M5 18h14"/></svg>
          </button>
          <button type="button" class="trix-button trix-button--icon" data-trix-attribute="textAlign" data-trix-action="align" data-align="right" title="右对齐">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M11 12h10M7 18h14"/></svg>
          </button>
        `
        buttonGroup.insertAdjacentHTML('beforeend', alignButtons)
      }

      // 监听对齐按钮点击
      toolbar?.addEventListener('click', (event) => {
        const target = event.target as HTMLElement
        const button = target.closest('button[data-trix-action="align"]')
        if (button) {
          event.preventDefault()
          const alignment = button.getAttribute('data-align')
          const editor = (trixElement as any).editor
          
          // 使用 insertLineBreak 和 insertString 来实现对齐
          const currentAttributes = editor.getSelectedRange()
          editor.setSelectedRange(currentAttributes)
          editor.activateAttribute('textAlign', alignment)
        }
      })

      // 自定义文字大小样式
      const editor = (trixElement as any).editor
      editor.composition.delegate.textAttributeConfig = {
        ...editor.composition.delegate.textAttributeConfig,
        large: { 
          tagName: 'span',
          style: { fontSize: '4.0em' }
        },
        small: { 
          tagName: 'span',
          style: { fontSize: '0.8em' }
        }
      }
    }
  }, [editorRef])

  return (
    <>
      <style jsx global>{`
        trix-editor {
          [data-trix-attribute="textAlign=left"] { text-align: left !important; }
          [data-trix-attribute="textAlign=center"] { text-align: center !important; }
          [data-trix-attribute="textAlign=right"] { text-align: right !important; }
          
          [data-trix-attribute="large"] { font-size: 4.0em !important; }
          [data-trix-attribute="small"] { font-size: 0.8em !important; }
        }
      `}</style>
      <input id="trix-content" type="hidden" name="content" />
      <trix-editor 
        input="trix-content"
        placeholder="在这里输入邮件内容..."
        class="trix-content"
      />
    </>
  )
} 