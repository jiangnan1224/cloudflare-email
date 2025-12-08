import { EmailSwitcher } from "./email-switcher"
import { SidebarNav } from "./sidebar-nav"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useSidebar } from "@/store/use-sidebar"
import Image from "next/image"

interface SidebarProps {
  showHeader?: boolean
}

export function Sidebar({ showHeader }: SidebarProps) {
  const { toggle } = useSidebar()

  return (
    <div className="flex flex-col h-full py-4">
      {/* Desktop Logo */}
      <div className="hidden lg:flex items-center gap-2 px-6 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rounded-sm" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">EmailDash.</h1>
      </div>

      {/* Mobile Header */}
      {showHeader && (
        <div className="h-14 lg:hidden flex items-center px-4 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-sm" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">EmailDash.</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggle}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* 邮箱切换器 */}
      <div className="px-4 mb-4">
        <EmailSwitcher />
      </div>

      {/* 导航菜单和设置按钮的容器 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 导航菜单（可滚动区域） */}
        <div className="flex-1 overflow-y-auto px-4">
          <SidebarNav onMobileClose={toggle} />
        </div>
      </div>
    </div>
  )
} 