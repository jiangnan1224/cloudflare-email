"use client"

import { Mail } from "@/lib/http-client"
import { Button } from "../ui/button"
import { X } from "lucide-react"
import { format, addHours } from "date-fns"
import { zhCN } from "date-fns/locale"
import DOMPurify from 'dompurify'
import { useMemo, useRef, useEffect } from "react"

interface MailViewProps {
  mail: Mail
  onClose: () => void
}

export function MailView({ mail, onClose }: MailViewProps) {
  const sanitizedHtml = useMemo(() => {
    if (!mail.message) return ''
    return DOMPurify.sanitize(mail.message, {
      ALLOWED_TAGS: [
        // 基础文本格式
        'p', 'br', 'b', 'i', 'em', 'strong', 'u', 'small', 'sub', 'sup',
        // 标题
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        // 列表
        'ul', 'ol', 'li',
        // 表格
        'table', 'thead', 'tbody', 'tr', 'td', 'th',
        // 其他常用元素
        'div', 'span', 'a', 'img', 'blockquote', 'pre', 'code',
        // 样式和布局
        'style', 'font', 'center', 'hr'
      ],
      ALLOWED_ATTR: [
        // 通用属性
        'class', 'id', 'style',
        // 链接属性
        'href', 'target', 'rel',
        // 图片属性
        'src', 'alt', 'width', 'height',
        // 表格属性
        'border', 'cellpadding', 'cellspacing',
        // 字体和颜色
        'face', 'color', 'size'
      ],
      ALLOW_DATA_ATTR: false,
      ADD_TAGS: ['style'],
      ADD_ATTR: ['target'], // 允许链接在新窗口打开
    })
  }, [mail.message])

  const contentRef = useRef<HTMLDivElement>(null)

  // 监听 mail 变化，滚动到顶部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [mail.id]) // 只在邮件 ID 变化时触发

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
        <h2 className="text-2xl font-semibold text-slate-800 line-clamp-1 flex-1 min-w-0 mr-4">{mail.subject || '无主题'}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <div
          ref={contentRef}
          className="h-full overflow-y-auto"
        >
          <div className="p-6 space-y-8">
            {/* Sender Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-medium">
                  {(mail.from?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-lg">
                    {mail.source || mail.from}
                  </div>
                  <div className="text-slate-500">
                    To: {mail.address}
                  </div>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                {format(addHours(new Date(mail.created_at), 8), 'PPpp', { locale: zhCN })}
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-slate max-w-none">
              {mail.message ? (
                <div className="relative">
                  <div
                    className="email-content [&>*]:leading-normal [&>*]:my-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                               [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline
                               [&_img]:!max-w-full [&_img]:!w-auto [&_img]:!h-auto [&_img]:object-contain
                               [&_table]:!w-full [&_table]:!max-w-full [&_table]:!table-auto [&_table]:border-collapse
                               [&_td]:!max-w-full [&_td]:p-2 [&_td]:break-words
                               [&_th]:!max-w-full [&_th]:p-2 [&_th]:break-words
                               [&_div]:!max-w-full [&_div]:break-words
                               [&_pre]:bg-slate-50 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:max-w-full
                               [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:pl-4 [&_blockquote]:text-slate-600
                               [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
                               [&>p]:break-words [&>div]:break-words
                               max-w-full break-words overflow-hidden"
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                  />
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-all overflow-x-auto text-slate-600 leading-relaxed">
                  {mail.text}
                </div>
              )}
            </div>

            {/* Attachments */}
            {mail.attachments && mail.attachments.length > 0 && (
              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <span>附件</span>
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{mail.attachments.length}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mail.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex flex-col min-w-0 flex-1 mr-3">
                        <span className="truncate font-medium text-slate-700">{attachment.filename}</span>
                        <span className="text-xs text-slate-400">
                          {attachment.size}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                          下载
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 