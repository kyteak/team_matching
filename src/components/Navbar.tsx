'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  unreadCount?: number
}

export default function Navbar({ unreadCount = 0 }: NavbarProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-blue-600">
          GaeSin-Matching
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="알림"
          >
            <Bell size={20} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/profile"
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="개인정보"
          >
            <User size={20} className="text-slate-600" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="로그아웃"
          >
            <LogOut size={20} className="text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  )
}
