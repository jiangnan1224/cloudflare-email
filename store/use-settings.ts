import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  apiBaseUrl: string | null
  authToken: string | null
  resendApiKey: string | null
  setApiBaseUrl: (url: string) => void
  setAuthToken: (token: string) => void
  setResendApiKey: (key: string) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      apiBaseUrl: null,
      authToken: null,
      resendApiKey: null,
      setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
      setAuthToken: (token) => set({ authToken: token }),
      setResendApiKey: (key) => set({ resendApiKey: key }),
    }),
    {
      name: 'settings-storage',
    }
  )
) 