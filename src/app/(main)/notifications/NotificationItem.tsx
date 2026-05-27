'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function NotificationItem({ notification }: { notification: any }) {
  const router = useRouter()
  const [isRead, setIsRead] = useState(notification.is_read)

  async function markRead() {
    if (isRead) return
    setIsRead(true)
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id)
    router.refresh()
  }

  const content = (
    <div
      className={`card p-4 transition-all hover:shadow-md cursor-pointer ${!isRead ? 'border-blue-200 bg-blue-50/30' : ''}`}
      onClick={markRead}
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isRead ? 'bg-slate-200' : 'bg-blue-500'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700">{notification.message}</p>
          <p className="text-xs text-slate-400 mt-1">{formatDate(notification.created_at)}</p>
        </div>
      </div>
    </div>
  )

  if (notification.link) {
    return <Link href={notification.link}>{content}</Link>
  }
  return content
}
