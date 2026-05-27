'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ApplicantList({ applications, recruitmentId }: { applications: any[]; recruitmentId: string }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleDecision(appId: string, applicantId: string, decision: 'accepted' | 'rejected') {
    setLoading(appId)
    const supabase = createClient()
    await supabase.from('competition_applications').update({ status: decision }).eq('id', appId)

    if (decision === 'accepted') {
      const { data: rec } = await supabase.from('competition_recruitments').select('current_members, max_members, team_name').eq('id', recruitmentId).single()
      if (rec) {
        const newCount = rec.current_members + 1
        const isFull = newCount >= rec.max_members
        await supabase.from('competition_recruitments').update({ current_members: newCount, status: isFull ? 'full' : 'recruiting' }).eq('id', recruitmentId)
        await supabase.from('notifications').insert({
          user_id: applicantId, type: 'competition_accepted',
          message: `"${rec.team_name}" 팀에 합류하게 되었어요! 🎉 함께 공모전을 준비해봐요!`,
          link: `/competitions/${recruitmentId}`,
        })
      }
    }

    router.refresh()
    setLoading(null)
  }

  return (
    <Card>
      <CardHeader><CardTitle>지원자 목록 ({applications.length}명)</CardTitle></CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="flex flex-col gap-3">
          {applications.map(app => {
            const isExpanded = expanded === app.id
            const intro = app.intro
            const statusVariant = app.status === 'accepted' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'
            const statusLabel = app.status === 'accepted' ? '수락' : app.status === 'rejected' ? '거부' : '검토 중'
            return (
              <div key={app.id} className="border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setExpanded(isExpanded ? null : app.id)}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{app.applicant?.name}</span>
                      <Badge variant={statusVariant} className={app.status === 'accepted' ? 'bg-green-600' : app.status === 'pending' ? 'bg-primary' : ''}>
                        {statusLabel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{app.applicant?.department}</p>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>

                {isExpanded && intro && (
                  <div className="px-4 pb-4 bg-muted/30 border-t">
                    <div className="flex flex-col gap-3 pt-3">
                      <InfoRow label="관심 분야" value={intro.interests} />
                      <InfoRow label="강점" value={intro.strengths} />
                      <InfoRow label="잘하는 부분" value={intro.skills} />
                      {intro.certifications && <InfoRow label="자격증" value={intro.certifications} />}
                      <InfoRow label="본인 수준" value={intro.level} />

                      {app.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleDecision(app.id, app.applicant_id, 'accepted')} disabled={!!loading}>
                            <Check size={16} className="mr-1" /> 수락
                          </Button>
                          <Button variant="outline" className="flex-1 text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleDecision(app.id, app.applicant_id, 'rejected')} disabled={!!loading}>
                            <X size={16} className="mr-1" /> 거부
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}
