'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ChatButton({ type, referenceId }: { type: 'sport' | 'competition'; referenceId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function openChat() {
    setLoading(true)
    const res = await fetch('/api/chat/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, referenceId }),
    })
    const { roomId } = await res.json()
    router.push(`/chat/${roomId}`)
  }

  return (
    <Button variant="outline" onClick={openChat} disabled={loading} className="w-full gap-2">
      <MessageCircle size={16} />
      {loading ? '입장 중...' : '팀 채팅방 열기'}
    </Button>
  )
}
