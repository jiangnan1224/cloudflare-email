
"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Inbox,
  Send,
  MailOpen,
  PenLine, // This import is no longer used, but kept as per original file structure before the change.
  Settings,
  Trash2, // Added
  PenSquare, // Added
  Plus // Added
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { CreateAddressDialog } from "../settings/create-address-dialog"
import { useMailView } from "@/store/use-mail-view"
// import { SettingsDialog } from "../settings/settings-dialog" // Removed
import { useUIStore } from "@/store/use-ui" // Added import for useUIStore
import { motion } from "framer-motion" // Added framer-motion import

// Original global navItems removed, now defined inside component
// const navItems = [
//   { id: 'inbox', icon: Inbox, label: "收件箱" },
//   { id: 'sent', icon: Send, label: "发件箱", disabled: true },
// ]

interface SidebarNavProps {
  onMobileClose?: () => void
}

export function SidebarNav({ onMobileClose }: SidebarNavProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  // const [showSettingsDialog, setShowSettingsDialog] = useState(false) // Removed, state managed by useUIStore
  const { view, setView } = useMailView()
  const { setSettingsOpen } = useUIStore() // Added useUIStore and setSettingsOpen

  // navItems moved inside the component and updated
  const navItems = [
    { id: 'inbox', label: '收件箱', icon: Inbox },
    { id: 'sent', label: '已发送', icon: Send },
    { id: 'trash', label: '垃圾箱', icon: Trash2 },
  ]

  // handleNavClick simplified, now directly in onClick
  // const handleNavClick = (id: string) => {
  //   setView(id)
  //   // 移动端自动收起
  //   onMobileClose?.()
  // }

  return (
    <div className="flex flex-col h-full">
      {/* Separator removed, replaced by div with padding */}
      {/* <Separator className="mb-2" /> */}

      {/* 写邮件按钮 - completely re-styled */}
      <div className="px-3 py-4">
        <Button
          className="w-full justify-start gap-3 rounded-xl h-12 bg-primary hover:bg-primary/90 text-white shadow-md shadow-blue-500/20"
          onClick={() => setView('compose')}
        >
          <PenSquare className="h-5 w-5" />
          <span className="font-medium">写邮件</span>
        </Button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = view === item.id
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-12 rounded-xl font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
              onClick={() => {
                setView(item.id as any)
                onMobileClose?.()
              }}
            >
              <div className="relative flex items-center gap-3 flex-1">
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -left-3 w-1.5 h-8 bg-primary rounded-r-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400")} />
                <span>{item.label}</span>
              </div>
            </Button>
          )
        })}

        <div className="pt-4 mt-4 border-t border-slate-100">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            其他
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 rounded-xl font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            onClick={() => setShowCreateDialog(true)}
          >
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-slate-400" />
              <span>新建邮箱</span>
            </div>
          </Button>
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-slate-100 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 rounded-xl font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          onClick={() => {
            setSettingsOpen(true)
            onMobileClose?.()
          }}
        >
          <Settings className="h-5 w-5 text-slate-400" />
          <span>设置</span>
        </Button>
      </div>

      <CreateAddressDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
}
