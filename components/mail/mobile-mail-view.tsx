"use client"

import { Mail } from "@/lib/http-client"
import { Button } from "../ui/button"
import { ArrowLeft } from "lucide-react"
import { format, addHours } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useMemo, useState, useEffect, useRef } from "react"
import DOMPurify from 'dompurify'

interface MobileMailViewProps {
  mail: Mail
  onClose: () => void
}

export function MobileMailView({ mail, onClose }: MobileMailViewProps) {
  const [scale, setScale] = useState(1)
  const [scaledHeight, setScaledHeight] = useState<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

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
      ADD_ATTR: ['target'],
    })
  }, [mail.message])

  // Calculate scale to fit content within container
  useEffect(() => {
    const calculateScale = () => {
      if (!contentRef.current || !wrapperRef.current) return

      const wrapperWidth = wrapperRef.current.offsetWidth
      const contentWidth = contentRef.current.scrollWidth
      const contentHeight = contentRef.current.scrollHeight

      if (contentWidth > wrapperWidth) {
        const newScale = wrapperWidth / contentWidth
        setScale(newScale)
        setScaledHeight(contentHeight * newScale)
      } else {
        setScale(1)
        setScaledHeight(null)
      }
    }

    // Calculate on mount and when content changes
    const timer = setTimeout(calculateScale, 100)

    // Recalculate on window resize
    window.addEventListener('resize', calculateScale)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculateScale)
    }
  }, [sanitizedHtml, mail.id])

  return (
    <div className="flex flex-col h-full bg-background safe-top">
      {/* 顶部导航 */}
      <div className="h-14 lg:h-16 border-b flex items-center px-4 gap-4 shrink-0 bg-background/95 backdrop-blur-sm z-10 sticky top-0">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-medium truncate flex-1 min-w-0">邮件详情</h1>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {/* 邮件信息卡片 */}
        <div className="bg-card/50 rounded-lg border">
          <div className="p-4">
            <div className="flex flex-col space-y-4">
              <h2 className="text-xl font-semibold break-words">
                {mail.subject || '无主题'}
              </h2>

              <div className="flex items-start gap-3 min-w-0">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
                  {(mail.from?.[0] || 'U').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">
                    {mail.source || mail.from}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    发送至: {mail.address}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {(() => {
                      try {
                        const date = new Date(mail.created_at)
                        if (isNaN(date.getTime())) return '未知时间'
                        return format(addHours(date, 8), 'PPpp', { locale: zhCN })
                      } catch (e) {
                        return '未知时间'
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 邮件内容 */}
        <div className="bg-card/50 rounded-lg border max-w-full overflow-hidden">
          <div className="p-4">
            {mail.message ? (
              <div
                ref={wrapperRef}
                className="email-content-wrapper"
                style={{
                  height: scaledHeight ? `${scaledHeight}px` : 'auto'
                }}
              >
                <div
                  ref={contentRef}
                  className="email-content [&>*]:leading-normal [&>*]:my-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                             [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline
                             [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto
                             [&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-4
                             [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
                             [&_code]:text-sm
                             text-sm"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: scale < 1 ? `${100 / scale}%` : '100%',
                  }}
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words text-sm max-w-full">
                {mail.text}
              </div>
            )}
          </div>
        </div>

        {/* 附件 */}
        {mail.attachments && mail.attachments.length > 0 && (
          <div className="bg-card/50 rounded-lg border">
            <div className="p-4">
              <h3 className="font-medium mb-3">附件</h3>
              <div className="space-y-2">
                {mail.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg active:bg-muted/50"
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate font-medium">{attachment.filename}</span>
                      <span className="text-xs text-muted-foreground">
                        {attachment.size}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" asChild className="ml-4 shrink-0">
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        下载
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 