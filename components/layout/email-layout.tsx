"use client"

import { Sidebar } from "@/components/sidebar/sidebar"
import { MenuIcon, Search, Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSidebar } from "@/store/use-sidebar"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUIStore } from "@/store/use-ui"
import { useSearchStore } from "@/store/use-search"
import { useMailView } from "@/store/use-mail-view"
import { SettingsDialog } from "@/components/settings/settings-dialog"

interface EmailLayoutProps {
  children: React.ReactNode
}

export default function EmailLayout({ children }: EmailLayoutProps) {
  const { isOpen, toggle } = useSidebar()
  const { query, setQuery } = useSearchStore()
  const { view } = useMailView()
  const { isSettingsOpen, setSettingsOpen } = useUIStore()

  const getTitle = () => {
    switch (view) {
      case 'inbox': return '收件箱'
      case 'sent': return '发送邮件'
      case 'compose': return 'Compose'
      default: return '收件箱'
    }
  }

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* 侧边栏 - Desktop: Static, Mobile: Fixed */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 border-r-0 shadow-sm",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar showHeader={false} />
      </div>

      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={toggle}
        />
      )}

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* 顶部 Header */}
        <header className="h-20 flex items-center justify-between px-6 gap-4 bg-card lg:bg-transparent border-b lg:border-none shrink-0">
          <div className="flex items-center gap-4 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="-ml-2"
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
            <span className="font-semibold text-lg">EmailDash.</span>
          </div>

          <div className="hidden lg:flex items-center text-2xl font-semibold text-slate-800">
            {getTitle()}
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="hidden md:flex relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for something"
                className="pl-10 bg-white rounded-full border-none shadow-sm h-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-white shadow-sm h-10 w-10 text-muted-foreground hover:text-primary hidden sm:flex"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button size="icon" variant="ghost" className="rounded-full bg-white shadow-sm h-10 w-10 text-red-500 hover:text-red-600 hidden sm:flex">
              <Bell className="h-5 w-5" />
            </Button>

            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="flex-1 overflow-hidden p-4 lg:p-6 pt-0 lg:pt-0">
          {children}
        </main>
      </div>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}