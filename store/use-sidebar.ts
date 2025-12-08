import { create } from "zustand"

type SidebarStore = {
  isOpen: boolean
  toggle: () => void
}

export const useSidebar = create<SidebarStore>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
})) 