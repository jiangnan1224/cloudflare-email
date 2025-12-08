import { create } from "zustand"
import { persist } from "zustand/middleware"
import { EmailAddress } from "@/lib/http-client"
import { useMailView } from './use-mail-view'

interface AddressStore {
  addresses: EmailAddress[]
  currentAddress: EmailAddress | null
  setAddresses: (addresses: EmailAddress[]) => void
  setCurrentAddress: (address: EmailAddress | null) => void
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set) => ({
      addresses: [],
      currentAddress: null,
      setAddresses: (addresses) => set({ addresses }),
      setCurrentAddress: (address) => {
        set({ currentAddress: address })
        // 切换邮箱时自动跳转到收件箱
        useMailView.getState().setView('inbox')
      },
    }),
    {
      name: 'address-storage',
    }
  )
) 