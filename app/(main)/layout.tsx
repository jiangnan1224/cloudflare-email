import EmailLayout from "@/components/layout/email-layout"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EmailLayout>{children}</EmailLayout>
} 