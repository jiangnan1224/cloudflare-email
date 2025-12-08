"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useEffect, useState, useRef, useMemo } from "react"
import { ChevronDown, Search, Trash2, Settings as SettingsIcon } from "lucide-react"
import { useAddressStore } from "@/store/use-address"
import { HttpClient } from "@/lib/http-client"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSidebar } from "@/store/use-sidebar"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import useSWR from 'swr'
import { EmailAddress } from "@/lib/http-client"
import { useSettings } from "@/store/use-settings"

export function EmailSwitcher() {
  const { addresses, currentAddress, setAddresses, setCurrentAddress } = useAddressStore()
  const { toggle } = useSidebar()
  const { data: settings } = useSWR('/api/settings', () => HttpClient.getSettings())
  const domain = settings?.domains[0] || ''
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState<EmailAddress | null>(null)
  const { mutate } = useSWR('/api/addresses')
  const { apiBaseUrl, authToken } = useSettings()

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addresses = await HttpClient.getAddresses()
        setAddresses(addresses)
      } catch (error) {
        console.error('Failed to fetch addresses:', error)
      }
    }

    if (addresses.length === 0) {
      fetchAddresses()
    }
  }, [addresses.length, setAddresses])

  useEffect(() => {
    if (!currentAddress && addresses.length > 0) {
      setCurrentAddress(addresses[0])
    }
  }, [addresses, currentAddress, setCurrentAddress])

  useEffect(() => {
    if (!open) {
      setSearch("")
    }
  }, [open])

  const allMailsOption = useMemo(() => ({
    id: -1,
    name: '所有邮件',
    created_at: '',
    updated_at: '',
    mail_count: undefined,
    send_count: 0,
  }), [])

  const filteredAddresses = useMemo(() => {
    const filtered = addresses.filter(address => 
      address.name.toLowerCase().includes(search.toLowerCase())
    )
    return [allMailsOption, ...filtered]
  }, [addresses, search, allMailsOption])

  if (!apiBaseUrl || !authToken) {
    return (
      <Button 
        variant="ghost" 
        className="w-full justify-between hover:bg-accent rounded-lg h-11 lg:h-14 px-2"
        onClick={() => {
          (document.querySelector('[data-settings-trigger="true"]') as HTMLElement)?.click()
        }}
      >
        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
          <div className="shrink-0 w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-muted text-muted-foreground grid place-items-center">
            <SettingsIcon className="h-4 w-4" />
          </div>
          <span className="font-medium text-sm lg:text-base text-muted-foreground">
            请配置 API
          </span>
        </div>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
      </Button>
    )
  }

  if (!currentAddress) return null

  const handleDelete = (address: EmailAddress) => {
    setAddressToDelete(address)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!addressToDelete) return

    try {
      await HttpClient.deleteAddress(addressToDelete.id)
      
      // 更新本地邮箱列表
      const newAddresses = addresses.filter(addr => addr.id !== addressToDelete.id)
      setAddresses(newAddresses)
      
      // 如果删除的是当前选中的邮箱，切换到第一个邮箱
      if (currentAddress?.id === addressToDelete.id && newAddresses.length > 0) {
        setCurrentAddress(newAddresses[0])
      }

      toast({
        description: "邮箱已删除",
      })
      setDeleteDialogOpen(false)
      setAddressToDelete(null)
      
      // 刷新邮箱列表
      mutate('/api/addresses')
    } catch (error) {
      toast({
        variant: "destructive",
        description: "删除失败，请重试",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between hover:bg-accent rounded-lg h-11 lg:h-14 px-2"
        >
          <div className="flex items-center gap-2 lg:gap-3 min-w-0">
            <div className="shrink-0 w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm">
              {currentAddress.name[0].toUpperCase()}
            </div>
            <span className="font-medium text-sm lg:text-base truncate">
              {currentAddress.name}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>选择邮箱账号</DialogTitle>
        </DialogHeader>
        <div 
          className="relative mb-4 cursor-text" 
          onClick={() => inputRef.current?.focus()}
        >
          <Search 
            className={cn(
              "absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-opacity duration-200",
              search && "opacity-0"
            )} 
          />
          <Input
            ref={inputRef}
            placeholder="搜索邮箱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "mb-2",
              search ? "pl-4" : "pl-9"
            )}
            autoFocus={false}
          />
        </div>
        <ScrollArea className="h-[300px] -mr-4 pr-4">
          <div className="space-y-2">
            {filteredAddresses.map((address) => (
              <div
                key={address.id}
                className={cn(
                  "relative group rounded-md",
                  currentAddress?.id === address.id && "bg-muted"
                )}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto py-2"
                  onClick={() => {
                    setCurrentAddress(address)
                    setOpen(false)
                    toggle()
                  }}
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary grid place-items-center">
                    {address.name[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start text-sm min-w-0">
                    <span className="font-medium truncate w-full">
                      {address.name}
                    </span>
                    {address.mail_count !== undefined && (
                      <span className="text-muted-foreground">
                        {address.mail_count} 封邮件
                      </span>
                    )}
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
                    address.id === -1 && "hidden"
                  )}
                  onClick={(e) => handleDelete(address)}
                  disabled={deleting === address.id}
                >
                  {deleting === address.id ? (
                    <div className="animate-spin">⏳</div>
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
                {currentAddress?.id === address.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除邮箱 {addressToDelete?.name}@{domain} 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
} 