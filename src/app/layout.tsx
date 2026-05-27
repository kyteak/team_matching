import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GaeSin-Matching',
  description: '충북대학교 팀 매칭 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
