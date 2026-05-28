'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function RequestItem({ friendship, currentUserId }: { friendship: any; currentUserId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null)
  const requester = friendship.requester as any

  async function respond(status: 'accepted' | 'rejected') {
    setLoading(status === 'accepted' ? 'accept' : 'reject')
    const supabase = createClient()
    await supabase.from('friendships').update({ status }).eq('id', friendship.id)
    if (status === 'accepted') {
      const { data: me } = await supabase.from('profiles').select('name').eq('id', currentUserId).single()
      await supabase.from('notifications').insert({
        user_id: friendship.requester_id,
        type: 'friend_accepted',
        message: `${me?.name}님이 친구 요청을 수락했어요! 🎉`,
        link: '/friends',
      })
    }
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
          {requester?.name?.[0]}
        </div>
        <div>
          <p className="font-medium text-sm">{requester?.name}</p>
          <p className="text-xs text-muted-foreground">{requester?.department}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => respond('accepted')} disabled={!!loading} className="bg-green-600 hover:bg-green-700 gap-1">
          <Check size={13} />{loading === 'accept' ? '...' : '수락'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => respond('rejected')} disabled={!!loading} className="text-destructive border-destructive hover:bg-destructive/10 gap-1">
          <X size={13} />{loading === 'reject' ? '...' : '거절'}
        </Button>
      </div>
    </div>
  )
}
