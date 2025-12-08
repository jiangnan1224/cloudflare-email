"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Label } from '@/components/ui/label'
import { Paperclip, Send } from 'lucide-react'
import { useSettings } from "@/store/use-settings"
import { useToast } from "@/hooks/use-toast"
import 'react-quill/dist/quill.snow.css'
import { useAddressStore } from "@/store/use-address"

// 动态导入 ReactQuill 以避免 SSR 问题
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-[calc(100vh-240px)] w-full animate-pulse bg-muted" />
})

const modules = {
  toolbar: {
    container: [
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
    handlers: {
      image: function(this: { quill: any }) {
        const quill = this.quill;
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
          const file = input.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, 'image', e.target?.result);
            };
            reader.readAsDataURL(file);
          }
        };
      }
    }
  }
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'size',
  'list', 'bullet',
  'align',
  'color', 'background',
  'link', 'image'
]

export default function MailEditor() {
  const [content, setContent] = useState('')
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { resendApiKey } = useSettings()
  const { toast } = useToast()
  const currentAddress = useAddressStore(state => state.currentAddress)

  const handleSend = async () => {
    // 表单验证
    if (!to) {
      toast({ title: "错误", description: "请输入收件人邮箱", variant: "destructive" })
      return
    }
    if (!subject) {
      toast({ title: "错误", description: "请输入邮件主题", variant: "destructive" })
      return
    }
    if (!content) {
      toast({ title: "错误", description: "请输入邮件内容", variant: "destructive" })
      return
    }
    if (!resendApiKey) {
      toast({ title: "错误", description: "请先在设置中配置 Resend API Key", variant: "destructive" })
      return
    }
    if (!currentAddress) {
      toast({ title: "错误", description: "请先选择发件人邮箱", variant: "destructive" })
      return
    }
    if (currentAddress.id === -1) {
      toast({ title: "错误", description: "请选择一个具体的发件邮箱", variant: "destructive" })
      return
    }

    try {
      setSending(true)

      // 处理 Quill HTML 内容
      const emailContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              /* 基础样式 */
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
              }
              
              /* Quill 标题样式 */
              .ql-editor h1 { 
                font-size: 2em; 
                font-weight: bold;
                margin: 0.67em 0; 
              }
              .ql-editor h2 { 
                font-size: 1.5em;
                font-weight: bold;
                margin: 0.75em 0; 
              }
              .ql-editor h3 { 
                font-size: 1.17em;
                font-weight: bold;
                margin: 0.83em 0; 
              }
              
              /* Quill 对齐方式 */
              .ql-editor .ql-align-center { 
                text-align: center !important; 
              }
              .ql-editor .ql-align-right { 
                text-align: right !important; 
              }
              .ql-editor .ql-align-justify { 
                text-align: justify !important; 
              }
              
              /* Quill 文本大小 */
              .ql-editor .ql-size-small { 
                font-size: 0.75em !important; 
              }
              .ql-editor .ql-size-large { 
                font-size: 1.5em !important; 
              }
              .ql-editor .ql-size-huge { 
                font-size: 2em !important; 
              }
              
              /* Quill 列表样式 */
              .ql-editor ul { 
                list-style-type: disc !important;
                margin: 1em 0 !important;
                padding-left: 2em !important;
              }
              .ql-editor ol { 
                list-style-type: decimal !important;
                margin: 1em 0 !important;
                padding-left: 2em !important;
              }
              
              /* Quill 其他样式 */
              .ql-editor p {
                margin: 0.5em 0;
              }
              .ql-editor strong { 
                font-weight: bold !important; 
              }
              .ql-editor em { 
                font-style: italic !important; 
              }
              .ql-editor u { 
                text-decoration: underline !important; 
              }
              .ql-editor s { 
                text-decoration: line-through !important; 
              }
              
              /* Quill 图片样式 */
              .ql-editor img {
                max-width: 100% !important;
                height: auto !important;
                margin: 1em 0 !important;
              }
              
              /* Quill 链接样式 */
              .ql-editor a {
                color: #0066cc !important;
                text-decoration: underline !important;
              }
            </style>
          </head>
          <body>
            <div class="ql-editor">
              ${content}
            </div>
          </body>
        </html>
      `

      // 处理附件
      const attachments = await Promise.all(
        files.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const base64String = reader.result as string
              resolve(base64String.split(',')[1]) // 移除 data:image/jpeg;base64, 前缀
            }
            reader.readAsDataURL(file)
          })
          
          return {
            filename: file.name,
            content: base64
          }
        })
      )

      // 发送邮件
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-resend-api-key': resendApiKey
        },
        body: JSON.stringify({
          from: currentAddress.name,
          to,
          subject,
          html: emailContent,  // 使用处理后的 HTML
          attachments
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Send email response:', data)
        throw new Error(data.details || data.error || '发送失败')
      }

      toast({ title: "成功", description: "邮件已发送" })
      
      // 清空表单
      setTo('')
      setSubject('')
      setContent('')
      setFiles([])

    } catch (error: any) {
      console.error('发送邮件失败:', error)
      toast({ 
        title: "错误", 
        description: error.message || "发送邮件失败，请稍后重试", 
        variant: "destructive" 
      })
    } finally {
      setSending(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      <div className="grid gap-2 flex-none">
        {/* 发件人 */}
        <div className="grid grid-cols-[4rem,1fr] items-center">
          <Label htmlFor="from" className="text-sm text-muted-foreground">发件人</Label>
          <Input 
            id="from"
            value={currentAddress?.name}
            disabled
            className="bg-muted"
          />
        </div>

        {/* 收件人 */}
        <div className="grid grid-cols-[4rem,1fr] items-center">
          <Label htmlFor="to" className="text-sm text-muted-foreground">收件人</Label>
          <Input 
            id="to"
            placeholder="输入收件人邮箱地址" 
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        {/* 主题 */}
        <div className="grid grid-cols-[4rem,1fr] items-center">
          <Label htmlFor="subject" className="text-sm text-muted-foreground">主题</Label>
          <Input 
            id="subject"
            placeholder="输入邮件主题" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
      </div>

      {/* 编辑器 */}
      <div className="flex-1 min-h-0 border rounded-md overflow-hidden" style={{ maxHeight: 'calc(100vh - 350px)' }}>
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          className="h-full"
          style={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between items-center flex-none">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4 mr-2" />
            添加附件
          </Button>
          {files.length > 0 && (
            <span className="text-sm text-muted-foreground">
              已选择 {files.length} 个文件
            </span>
          )}
        </div>
        <Button 
          onClick={handleSend} 
          disabled={sending}
        >
          <Send className="h-4 w-4 mr-2" />
          {sending ? '发送中...' : '发送'}
        </Button>
      </div>
    </div>
  )
} 