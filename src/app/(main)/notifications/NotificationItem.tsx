'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

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
    <Card
      className={`transition-all hover:shadow-md cursor-pointer ${!isRead ? 'border-primary/30 bg-primary/5' : ''}`}
      onClick={markRead}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isRead ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatDate(notification.created_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (notification.link) return <Link href={notification.link}>{content}</Link>
  return content
}
