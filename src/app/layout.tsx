import type { Metadata } from 'next'
import './globals.css'
import { Geist } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'GaeSin-Matching',
  description: '충북대학교 팀 매칭 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={cn('font-sans', geist.variable)}>
      <body className="min-h-screen bg-background">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
