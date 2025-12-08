declare module 'react-quill' {
  import React from 'react'
  
  export interface ReactQuillProps {
    theme?: string
    value?: string
    onChange?: (value: string) => void
    modules?: any
    formats?: string[]
    className?: string
    style?: React.CSSProperties
  }

  const ReactQuill: React.FC<ReactQuillProps>
  export default ReactQuill
} 