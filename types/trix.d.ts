declare namespace JSX {
  interface IntrinsicElements {
    'trix-editor': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      input?: string
      placeholder?: string
      class?: string
    }
  }
} 