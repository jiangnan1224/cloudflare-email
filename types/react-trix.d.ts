declare module 'react-trix' {
  import { ComponentType } from 'react'

  interface TrixEditorProps {
    onChange?: (html: string, text: string) => void
    onEditorReady?: (editor: any) => void
    placeholder?: string
    value?: string
    uploadURL?: string
    uploadData?: Record<string, any>
    className?: string
    [key: string]: any
  }

  export const TrixEditor: ComponentType<TrixEditorProps>
} 