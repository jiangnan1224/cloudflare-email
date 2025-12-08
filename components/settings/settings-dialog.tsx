"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSettings } from "@/store/use-settings"
import { useState, useEffect } from "react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { 
    apiBaseUrl, 
    authToken, 
    resendApiKey,
    setApiBaseUrl, 
    setAuthToken,
    setResendApiKey
  } = useSettings()
  
  const [url, setUrl] = useState('')
  const [token, setToken] = useState('')
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    setUrl(apiBaseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || '')
    setToken(authToken || process.env.NEXT_PUBLIC_AUTH_TOKEN || '')
    setApiKey(resendApiKey || '')
  }, [apiBaseUrl, authToken, resendApiKey, open])

  const handleSave = () => {
    if (url) setApiBaseUrl(url.trim())
    if (token) setAuthToken(token.trim())
    if (apiKey) setResendApiKey(apiKey.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>系统设置</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>API 地址</Label>
            <Input
              placeholder="请输入 API 地址"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>认证令牌</Label>
            <Input
              type="password"
              placeholder="请输入认证令牌"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Resend API Key</Label>
            <Input
              type="password"
              placeholder="请输入 Resend API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 