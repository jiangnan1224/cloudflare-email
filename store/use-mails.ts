import { create } from "zustand"
import { Mail } from "@/lib/http-client"

interface MailsStore {
  mails: Mail[]
  setMails: (mails: Mail[]) => void
  getMail: (id: string) => Mail | undefined
}

export const useMailsStore = create<MailsStore>((set, get) => ({
  mails: [],
  setMails: (mails) => set({ mails }),
  getMail: (id) => get().mails.find(mail => mail.id.toString() === id)
})) 