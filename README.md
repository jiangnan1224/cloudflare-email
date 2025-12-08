# Cloudflare邮箱管

之前使用了[cloudflare_temp_email](https://github.com/dreamhunter2333/cloudflare_temp_email)部署了一个cloudflare邮箱，但是前端管理页面不是特别符合我的使用习惯，尤其是移动端，邮件查看基本没法用。所以用cursor撸了一个适合自己使用习惯的前端页面出来。

## 前置要求
使用cloudflare_temp_email后端，[点击这里查看部署教程](https://temp-mail-docs.awsl.uk/zh/guide/cli/worker.html)，部署好之后在使用本项目。

## 体验地址

[https://cloudflare-email.vercel.app/](https://cloudflare-email.vercel.app/)

### 参数配置
API地址：
![API地址](./screenshots/s1.png)

认证令牌：
![认证令牌](./screenshots/s2.png)

## Vercel部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jiangnan1224/cloudflare-email)



## 特色功能

### 邮件管理
- 🔄 实时邮件接收（30秒自动刷新）
- 📍 新邮件红点提示
- 🔍 邮件内容预览
- 📎 附件查看和下载
- 💨 无限滚动加载更多邮件

### 用户体验
- 📱 响应式设计，支持移动端
- 👆 移动端支持滑动返回
- ⚡️ 快速切换邮箱账号
- 🔒 安全的 HTML 内容渲染

### 支持resend发送邮件
- ✨ 配置resend的api key即可发送邮件

## 部署指南

### 环境要求
- Node.js 18+
- 支持 WebAssembly 的环境

### 本地开发

```bash
# 安装依赖
pnpm install

# 开发环境运行
pnpm dev

# 生产环境构建
pnpm build
pnpm start
```

### Vercel 部署

点击上方的 "Deploy with Vercel" 按钮，然后：

1. 连接你的 GitHub 仓库
2. 配置环境变量
3. 部署完成后即可访问

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- SWR
- Zustand
- shadcn/ui

## 开源协议

MIT License
