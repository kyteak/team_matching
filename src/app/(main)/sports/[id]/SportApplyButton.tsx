'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SportApplyButton({ matchId, userId, userName }: { matchId: string; userId: string; userName: string }) {
  const router = useRouter()
  const [teamName, setTeamName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApply() {
    if (!teamName.trim()) { setError('우리 팀 이름을 입력해주세요.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error: applyError } = await supabase.from('sport_match_applications').insert({
      match_id: matchId,
      applicant_id: userId,
      team_name: teamName,
    })

    if (applyError) { setError('신청에 실패했어요. 다시 시도해주세요.'); setLoading(false); return }

    await supabase.from('sport_matches').update({ status: 'matched' }).eq('id', matchId)

    const { data: match } = await supabase.from('sport_matches').select('creator_id, team_name').eq('id', matchId).single()
    if (match) {
      await supabase.from('notifications').insert({
        user_id: match.creator_id,
        type: 'sport_matched',
        message: `"${match.team_name}" 매치에 "${teamName}" 팀이 매칭되었어요! 🎉`,
        link: `/sports/${matchId}`,
      })
    }

    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label>우리 팀 이름</Label>
        <Input placeholder="상대방에게 보여질 우리 팀 이름" value={teamName} onChange={e => setTeamName(e.target.value)} />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button className="w-full" onClick={handleApply} disabled={loading}>
        {loading ? '신청 중...' : '매칭 신청하기 🤝'}
      </Button>
    </div>
  )
}
