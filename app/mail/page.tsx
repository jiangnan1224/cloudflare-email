import MailEditor from '@/components/mail/mail-editor'

export default function MailPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">写邮件</h1>
      <MailEditor />
    </div>
  )
} 