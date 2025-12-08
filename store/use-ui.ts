import { create } from 'zustand'

interface UIState {
    isSettingsOpen: boolean
    setSettingsOpen: (open: boolean) => void
    toggleSettings: () => void
}

export const useUIStore = create<UIState>((set) => ({
    isSettingsOpen: false,
    setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
}))
