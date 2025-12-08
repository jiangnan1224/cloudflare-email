import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import '@/styles/quill.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CloudFlare邮件系统",
  description: "CloudFlare邮件系统",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '临时邮箱',
    startupImage: [
      // 可以为不同设备尺寸提供启动图
      // '/splash/launch.png',
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cloudflare临时邮箱" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        <link rel="apple-touch-icon" href="/logo.png" />
        
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
          href="/splash/iPhone_14_Pro_Max_landscape.png"
        />
      </head>
      <body className={inter.className}>
        {/* 根据路径条件渲染布局 */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
