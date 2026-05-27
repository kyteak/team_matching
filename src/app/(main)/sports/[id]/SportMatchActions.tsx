'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function SportMatchActions({ matchId }: { matchId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('정말 이 매치를 삭제하시겠어요?')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('sport_matches').update({ status: 'deleted' }).eq('id', matchId)
    router.push('/sports')
    router.refresh()
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading} className="text-destructive hover:text-destructive hover:bg-destructive/10">
      <Trash2 size={20} />
    </Button>
  )
}
