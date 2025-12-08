"use client"

import { useState, useEffect } from "react"
import { HttpClient } from "@/lib/http-client"
import { useAddressStore } from "@/store/use-address"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAddressDialog({ open, onOpenChange }: CreateAddressDialogProps) {
  const [prefix, setPrefix] = useState("")
  const [domain, setDomain] = useState("")
  const [domains, setDomains] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { setAddresses } = useAddressStore()
  const { toast } = useToast()

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const settings = await HttpClient.getSettings()
        setDomains(settings.domains)
        if (settings.domains.length > 0) {
          setDomain(settings.domains[0])
        }
      } catch (error) {
        console.error('Failed to fetch domains:', error)
        setError("获取域名列表失败")
      }
    }

    if (open) {
      fetchDomains()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prefix || !domain) {
      setError("请填写完整信息")
      return
    }

    setLoading(true)
    setError("")

    try {
      await HttpClient.createAddress(prefix, domain)
      const addresses = await HttpClient.getAddresses()
      setAddresses(addresses)
      onOpenChange(false)
      setPrefix("")
      
      toast({
        title: "创建成功",
        description: `邮箱 ${prefix}@${domain} 已创建`,
        variant: "default",
      })
    } catch (error) {
      console.error('Failed to create address:', error)
      setError("创建邮箱失败")
      
      toast({
        title: "创建失败",
        description: "创建邮箱时出现错误",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建邮箱地址</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <Input
                placeholder="请输入邮箱前缀"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                disabled={loading}
                autoFocus={false}
              />
            </div>
            <div className="text-2xl text-muted-foreground">@</div>
            <div className="w-[180px]">
              <Select
                value={domain}
                onValueChange={setDomain}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择域名" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 