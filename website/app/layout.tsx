import type { Metadata } from 'next'
import { Inter, Fira_Code } from 'next/font/google'
import Header from '@/components/layout/header'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Internal Prompt Library',
  description: 'Discover, manage, and share reusable AI prompts',
  keywords: ['AI', 'prompts', 'ChatGPT', 'Claude', 'prompt engineering'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
