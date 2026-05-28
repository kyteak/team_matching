import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Users, Trophy } from 'lucide-react'
import { formatDateOnly } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import CompetitionApplyButton from './CompetitionApplyButton'
import CompetitionActions from './CompetitionActions'
import ApplicantList from './ApplicantList'
import ChatButton from '@/components/ChatButton'

export default async function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rec } = await supabase
    .from('competition_recruitments')
    .select('*, competition:competitions(*), creator:profiles(id, name, department)')
    .eq('id', id)
    .neq('status', 'deleted')
    .single()

  if (!rec) notFound()

  const { data: myApplication } = await supabase
    .from('competition_applications')
    .select('id, status')
    .eq('recruitment_id', id)
    .eq('applicant_id', user!.id)
    .single()

  const { data: applications } = await supabase
    .from('competition_applications')
    .select('*, applicant:profiles(name, department), intro:self_introductions(*)')
    .eq('recruitment_id', id)

  const isCreator = (rec.creator as any)?.id === user!.id
  const isFull = rec.status === 'full'
  const canDelete = isCreator && rec.current_members <= 1

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/competitions" className={buttonVariants({ variant: 'ghost', size: 'icon' })}><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold">모집 상세</h1>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold">{rec.team_name}</h2>
                <Badge variant={isFull ? 'secondary' : 'default'} className={`mt-1 ${isFull ? '' : 'bg-green-600'}`}>
                  {isFull ? '모집 완료' : '모집 중'}
                </Badge>
              </div>
              {canDelete && <CompetitionActions recruitmentId={id} />}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={16} className="text-yellow-600" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-400 text-sm">{rec.competition?.title}</span>
              </div>
              <p className="text-yellow-700 dark:text-yellow-500 text-xs">{rec.competition?.host}</p>
              {rec.competition?.prize && <p className="text-yellow-700 dark:text-yellow-500 text-xs mt-1">🏆 {rec.competition.prize}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">모집 인원</p>
                <p className="font-semibold flex items-center gap-1"><Users size={14} />{rec.current_members}/{rec.max_members}명</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">모집 마감</p>
                <p className="font-semibold flex items-center gap-1"><Calendar size={14} />{formatDateOnly(rec.deadline)}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1">모집자 역할</p>
              <p className="text-sm bg-muted/50 rounded-xl p-3">{rec.creator_role}</p>
            </div>

            <p className="text-xs text-muted-foreground">
              모집자: {(rec.creator as any)?.name} · {(rec.creator as any)?.department}
            </p>
          </CardContent>
        </Card>

        {!isCreator && !isFull && (
          <Card>
            <CardContent className="p-5">
              {myApplication ? (
                <div className={`rounded-xl p-4 text-sm text-center font-medium ${
                  myApplication.status === 'accepted' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' :
                  myApplication.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                  'bg-primary/10 text-primary'
                }`}>
                  {myApplication.status === 'accepted' && '✅ 수락되었어요! 팀에 합류하게 되었습니다.'}
                  {myApplication.status === 'rejected' && '❌ 아쉽게도 이번 팀과는 맞지 않았어요.'}
                  {myApplication.status === 'pending' && '⏳ 지원 완료! 모집자의 검토를 기다리고 있어요.'}
                </div>
              ) : (
                <CompetitionApplyButton recruitmentId={id} userId={user!.id} />
              )}
            </CardContent>
          </Card>
        )}

        {isCreator && applications && applications.length > 0 && (
          <ApplicantList applications={applications} recruitmentId={id} />
        )}

        {isCreator && (!applications || applications.length === 0) && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              아직 지원자가 없어요. 조금만 기다려주세요! 👀
            </CardContent>
          </Card>
        )}

        {(isCreator || myApplication?.status === 'accepted') && (
          <Card>
            <CardContent className="p-4">
              <ChatButton type="competition" referenceId={id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
