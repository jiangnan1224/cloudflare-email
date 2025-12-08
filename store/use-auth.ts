import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import Cookies from 'js-cookie'

interface AuthStore {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
  hydrated: boolean
  setHydrated: (state: boolean) => void
}

// 检查是否在浏览器环境
const isBrowser = typeof window !== 'undefined'

// 创建一个自定义storage来同时处理localStorage和cookie
const customStorage = {
  getItem: (name: string) => {
    if (!isBrowser) return null
    const value = localStorage.getItem(name)
    if (value) {
      Cookies.set(name, value, { expires: 7 })
    }
    return value
  },
  setItem: (name: string, value: string) => {
    if (!isBrowser) return
    localStorage.setItem(name, value)
    Cookies.set(name, value, { expires: 7 })
  },
  removeItem: (name: string) => {
    if (!isBrowser) return
    localStorage.removeItem(name)
    Cookies.remove(name)
  },
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      hydrated: false,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
      setHydrated: (state) => set({ hydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => customStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
) 