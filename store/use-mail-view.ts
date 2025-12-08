import { create } from 'zustand'

interface MailViewState {
  view: string
  setView: (view: string) => void
}

export const useMailView = create<MailViewState>((set) => ({
  view: 'inbox',
  setView: (view) => set({ view })
})) 