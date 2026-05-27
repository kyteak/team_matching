'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react'

export default function ApplicantList({ applications, recruitmentId }: { applications: any[]; recruitmentId: string }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleDecision(appId: string, applicantId: string, decision: 'accepted' | 'rejected') {
    setLoading(appId)
    const supabase = createClient()

    await supabase.from('competition_applications').update({ status: decision }).eq('id', appId)

    if (decision === 'accepted') {
      // 모집 인원 증가
      const { data: rec } = await supabase
        .from('competition_recruitments')
        .select('current_members, max_members, team_name')
        .eq('id', recruitmentId)
        .single()

      if (rec) {
        const newCount = rec.current_members + 1
        const isFull = newCount >= rec.max_members
        await supabase.from('competition_recruitments').update({
          current_members: newCount,
          status: isFull ? 'full' : 'recruiting',
        }).eq('id', recruitmentId)

        // 지원자에게 수락 알림
        await supabase.from('notifications').insert({
          user_id: applicantId,
          type: 'competition_accepted',
          message: `"${rec.team_name}" 팀에 합류하게 되었어요! 🎉 함께 공모전을 준비해봐요!`,
          link: `/competitions/${recruitmentId}`,
        })
      }
    }

    router.refresh()
    setLoading(null)
  }

  return (
    <div className="card p-5">
      <h3 className="font-bold text-slate-800 mb-3">지원자 목록 ({applications.length}명)</h3>
      <div className="flex flex-col gap-3">
        {applications.map(app => {
          const isExpanded = expanded === app.id
          const intro = app.intro
          return (
            <div key={app.id} className="border border-slate-100 rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                onClick={() => setExpanded(isExpanded ? null : app.id)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{app.applicant?.name}</span>
                    <span className={`badge text-xs ${
                      app.status === 'accepted' ? 'badge-green' :
                      app.status === 'rejected' ? 'badge-red' :
                      'badge-blue'
                    }`}>
                      {app.status === 'accepted' ? '수락' : app.status === 'rejected' ? '거부' : '검토 중'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{app.applicant?.department}</p>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>

              {isExpanded && intro && (
                <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100">
                  <div className="flex flex-col gap-3 pt-3">
                    <InfoRow label="관심 분야" value={intro.interests} />
                    <InfoRow label="강점" value={intro.strengths} />
                    <InfoRow label="잘하는 부분" value={intro.skills} />
                    {intro.certifications && <InfoRow label="자격증" value={intro.certifications} />}
                    <InfoRow label="본인 수준" value={intro.level} />

                    {app.status === 'pending' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleDecision(app.id, app.applicant_id, 'accepted')}
                          disabled={!!loading}
                          className="btn-primary flex-1 flex items-center justify-center gap-1 py-2"
                        >
                          <Check size={16} /> 수락
                        </button>
                        <button
                          onClick={() => handleDecision(app.id, app.applicant_id, 'rejected')}
                          disabled={!!loading}
                          className="btn-secondary flex-1 flex items-center justify-center gap-1 py-2 text-red-500"
                        >
                          <X size={16} /> 거부
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  )
}
