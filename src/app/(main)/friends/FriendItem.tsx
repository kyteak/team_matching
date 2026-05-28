'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FriendItem({ friendshipId, friend }: { friendshipId: string; friend: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function openDM() {
    setLoading(true)
    const res = await fetch('/api/chat/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'direct', referenceId: friendshipId }),
    })
    const { roomId } = await res.json()
    router.push(`/chat/${roomId}`)
  }

  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
          {friend?.name?.[0]}
        </div>
        <div>
          <p className="font-medium text-sm">{friend?.name}</p>
          <p className="text-xs text-muted-foreground">{friend?.department}</p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={openDM} disabled={loading} className="gap-1.5 shrink-0">
        <MessageCircle size={13} />
        {loading ? '...' : '채팅'}
      </Button>
    </div>
  )
}
