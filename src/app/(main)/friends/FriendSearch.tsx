'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function FriendSearch({ currentUserId, existingIds }: { currentUserId: string; existingIds: string[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [sent, setSent] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')

  async function search(q: string) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, name, department, username')
      .or(`name.ilike.%${q}%,username.ilike.%${q}%`)
      .neq('id', currentUserId)
      .limit(10)
    setResults(data ?? [])
    setSearching(false)
  }

  async function sendRequest(addresseeId: string) {
    setError('')
    const supabase = createClient()
    const { error: insertError } = await supabase.from('friendships').insert({
      requester_id: currentUserId,
      addressee_id: addresseeId,
      status: 'pending',
    })
    if (insertError) {
      if (insertError.code === '23505') setError('이미 친구 요청을 보냈거나 친구 상태예요.')
      else setError('요청 전송에 실패했어요.')
      return
    }
    const { data: myProfile } = await supabase.from('profiles').select('name').eq('id', currentUserId).single()
    await supabase.from('notifications').insert({
      user_id: addresseeId,
      type: 'friend_request',
      message: `${myProfile?.name}님이 친구 요청을 보냈어요! 👋`,
      link: '/friends',
    })
    setSent(prev => ({ ...prev, [addresseeId]: true }))
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="이름 또는 아이디로 검색" value={query} onChange={e => search(e.target.value)} className="pl-9" />
        </div>

        {searching && <div className="flex justify-center py-2"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div>}

        {results.length > 0 && (
          <div className="flex flex-col divide-y divide-border">
            {results.map(u => {
              const isExisting = existingIds.includes(u.id)
              const isSent = sent[u.id] || isExisting
              return (
                <div key={u.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.department} · @{u.username}</p>
                    </div>
                  </div>
                  <Button size="sm" variant={isSent ? 'secondary' : 'outline'} onClick={() => sendRequest(u.id)} disabled={isSent} className="shrink-0 gap-1.5">
                    {isSent ? <><Check size={13} />추가됨</> : <><UserPlus size={13} />추가</>}
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && !searching && (
          <p className="text-sm text-muted-foreground text-center py-2">검색 결과가 없어요.</p>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}
      </CardContent>
    </Card>
  )
}
