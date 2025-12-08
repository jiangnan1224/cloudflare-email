"use client"

import { Mail, HttpClient } from "@/lib/http-client"
import { formatDistanceToNow, addHours } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Loader2, Mail as MailIcon, Inbox } from "lucide-react"
import { useEffect, useRef, useState, useMemo } from "react"
import { MailView } from "./mail-view"
import { MobileMailView } from "./mobile-mail-view"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useAddressStore } from "@/store/use-address"
import { useSearchStore } from "@/store/use-search"
import { useMailView } from "@/store/use-mail-view"

interface MailListProps {
  mails: Mail[]
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}

export function MailList({ mails: initialMails, hasMore, loadingMore, onLoadMore }: MailListProps) {
  const { currentAddress } = useAddressStore()
  const { query } = useSearchStore()
  const { view } = useMailView()
  const [mails, setMails] = useState<Mail[]>(initialMails)
  const [newMailIds, setNewMailIds] = useState<Set<number>>(new Set())
  const { toast } = useToast()
  const lastMailId = useRef(mails[0]?.id || 0)
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
  const listRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const filteredMails = useMemo(() => {
    return mails.filter(mail => {
      if (!query) return true
      const searchLower = query.toLowerCase()
      return (
        mail.subject?.toLowerCase().includes(searchLower) ||
        mail.from?.toLowerCase().includes(searchLower) ||
        mail.source?.toLowerCase().includes(searchLower)
      )
    })
  }, [mails, query])

  useEffect(() => {
    setMails(initialMails)
  }, [initialMails])

  useEffect(() => {
    if (!hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore()
        }
      },
      {
        root: listRef.current,
        rootMargin: '100px',
        threshold: 0.1
      }
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, onLoadMore])

  useEffect(() => {
    const checkNewMails = async () => {
      try {
        const response = currentAddress?.id === -1
          ? await HttpClient.getAllMails(20, 0)
          : await HttpClient.getMails(currentAddress?.id.toString() || '0', 20, 0)

        const newMails = response.items

        if (newMails[0]?.id > lastMailId.current) {
          const newMailsToAdd = newMails.filter(mail => mail.id > lastMailId.current)

          lastMailId.current = newMails[0].id

          const newIds = new Set(Array.from(newMailIds))
          newMailsToAdd.forEach(mail => newIds.add(mail.id))
          setNewMailIds(newIds)

          setMails(prev => [...newMailsToAdd, ...prev])

          if (newMailsToAdd.length > 0) {
            toast({
              description: `收到 ${newMailsToAdd.length} 封新邮件`,
            })
          }
        }
      } catch (error) {
        console.error('Failed to check new mails:', error)
      }
    }

    const interval = setInterval(checkNewMails, 30000)
    return () => clearInterval(interval)
  }, [toast, newMailIds, currentAddress])

  const handleMailClick = (mail: Mail) => {
    setSelectedMail(mail)
    if (newMailIds.has(mail.id)) {
      const updatedIds = new Set(Array.from(newMailIds))
      updatedIds.delete(mail.id)
      setNewMailIds(updatedIds)
    }
  }

  return (
    <div className="flex h-full gap-6">
      {/* 邮件列表 */}
      <motion.div
        className={cn(
          "w-full lg:w-[350px] bg-card rounded-[2rem] shadow-sm overflow-hidden flex flex-col",
          isMobile && selectedMail && "hidden"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex-1 overflow-y-auto" ref={listRef}>
          {filteredMails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm">暂无邮件</p>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence mode="wait">
                {filteredMails.map((mail) => (
                  <motion.div
                    key={mail.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="relative group"
                      onClick={() => handleMailClick(mail)}
                    >
                      <button
                        className={cn(
                          "w-full px-5 py-6 flex items-start gap-4 hover:bg-slate-50 text-left transition-colors",
                          selectedMail?.id === mail.id && "bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg font-medium mt-1",
                          selectedMail?.id === mail.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                        )}>
                          {(mail.from?.[0] || 'U').toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-800 truncate text-sm flex-1">
                              {mail.subject || '无主题'}
                            </span>
                            <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                              {(() => {
                                try {
                                  const date = new Date(mail.created_at)
                                  if (isNaN(date.getTime())) return ''
                                  return formatDistanceToNow(addHours(date, 8), {
                                    locale: zhCN,
                                    addSuffix: true
                                  })
                                } catch (e) {
                                  return ''
                                }
                              })()}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {mail.source || mail.from}
                          </div>
                        </div>
                      </button>
                      {newMailIds.has(mail.id) && (
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {hasMore && (
                <div
                  ref={loadingRef}
                  className="p-4 text-center text-sm text-muted-foreground"
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>加载更多...</span>
                    </div>
                  ) : (
                    <span>上滑加载更多</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* 邮件详情 */}
      <AnimatePresence mode="wait">
        {selectedMail ? (
          <motion.div
            key="mail-detail"
            initial={isMobile ? { x: '100%' } : { opacity: 0, x: 20 }}
            animate={isMobile ? { x: 0 } : { opacity: 1, x: 0 }}
            exit={isMobile ? { x: '100%' } : { opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag={isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.5 }}
            onDragEnd={(e, info) => {
              if (isMobile && (info.offset.x > 100 || info.velocity.x > 500)) {
                setSelectedMail(null)
              }
            }}
            className={cn(
              "bg-card rounded-[2rem] shadow-sm overflow-hidden flex flex-col",
              isMobile ? 'fixed inset-0 z-50 rounded-none' : 'hidden lg:flex flex-1'
            )}
          >
            {isMobile ? (
              <MobileMailView
                mail={selectedMail}
                onClose={() => setSelectedMail(null)}
              />
            ) : (
              <MailView
                mail={selectedMail}
                onClose={() => setSelectedMail(null)}
              />
            )}
          </motion.div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-muted-foreground bg-card rounded-[2rem] shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MailIcon className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Select an email to view details</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
} 