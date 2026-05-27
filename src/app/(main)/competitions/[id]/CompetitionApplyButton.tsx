'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CompetitionApplyButton({ recruitmentId, userId }: { recruitmentId: string; userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApply() {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error: applyError } = await supabase.from('competition_applications').insert({
      recruitment_id: recruitmentId,
      applicant_id: userId,
      status: 'pending',
    })

    if (applyError) {
      setError('지원에 실패했어요. 이미 지원했거나 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    // 모집자에게 알림
    const { data: rec } = await supabase
      .from('competition_recruitments')
      .select('creator_id, team_name')
      .eq('id', recruitmentId)
      .single()

    if (rec) {
      await supabase.from('notifications').insert({
        user_id: rec.creator_id,
        type: 'competition_applicant',
        message: `"${rec.team_name}" 팀에 새 지원자가 있어요! 자기소개서를 확인해보세요. 📋`,
        link: `/competitions/${recruitmentId}`,
      })
    }

    router.refresh()
    setLoading(false)
  }

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button className="btn-primary w-full" onClick={handleApply} disabled={loading}>
        {loading ? '지원 중...' : '이 팀에 지원하기 ✋'}
      </button>
    </div>
  )
}
