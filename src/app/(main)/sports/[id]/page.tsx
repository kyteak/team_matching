import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Users } from 'lucide-react'
import { formatDate, SKILL_LEVELS, isToday } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import SportMatchActions from './SportMatchActions'
import SportApplyButton from './SportApplyButton'

const SPORT_EMOJI: Record<string, string> = {
  '축구': '⚽', '풋살': '⚽', '농구': '🏀', '테니스': '🎾', '배드민턴': '🏸'
}

export default async function SportMatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: match } = await supabase
    .from('sport_matches')
    .select('*, creator:profiles(id, name, department)')
    .eq('id', id)
    .neq('status', 'deleted')
    .single()

  if (!match) notFound()

  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user!.id).single()
  const { data: myApplication } = await supabase
    .from('sport_match_applications')
    .select('id')
    .eq('match_id', id)
    .eq('applicant_id', user!.id)
    .single()

  const skillLabel = SKILL_LEVELS.find(s => s.value === match.skill_level)?.label ?? match.skill_level
  const isCreator = (match.creator as any)?.id === user!.id
  const isMatched = match.status === 'matched'
  const canDelete = isCreator && !isToday(match.match_at) && !isMatched

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sports" className={buttonVariants({ variant: 'ghost', size: 'icon' })}><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold">매치 상세</h1>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{SPORT_EMOJI[match.sport] ?? '🏅'}</span>
                <div>
                  <h2 className="text-xl font-bold">{match.team_name}</h2>
                  <Badge variant={isMatched ? 'secondary' : 'default'} className={`mt-1 ${isMatched ? '' : 'bg-primary'}`}>
                    {isMatched ? '매칭 완료' : '모집 중'}
                  </Badge>
                </div>
              </div>
              {canDelete && <SportMatchActions matchId={id} />}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">종목</p>
                <p className="font-semibold">{match.sport}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">인원</p>
                <p className="font-semibold">{match.max_players}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">팀 수준</p>
                <p className="font-semibold">{skillLabel}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">모집자</p>
                <p className="font-semibold">{(match.creator as any)?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} />
              <span className="text-sm">{formatDate(match.match_at)}</span>
            </div>
          </CardContent>
        </Card>

        {!isCreator && !isMatched && (
          <Card>
            <CardContent className="p-5">
              {myApplication ? (
                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 text-sm text-green-700 dark:text-green-400 text-center font-medium">
                  ✅ 이미 매칭 신청을 완료했어요!
                </div>
              ) : (
                <SportApplyButton matchId={id} userId={user!.id} userName={profile?.name ?? ''} />
              )}
            </CardContent>
          </Card>
        )}

        {isCreator && (
          <Card>
            <CardContent className="p-4">
              <div className="bg-primary/10 rounded-xl p-4 text-sm text-primary">
                내가 만든 매치입니다.{!isMatched && !isToday(match.match_at) ? ' 삭제하려면 우측 상단 버튼을 눌러주세요.' : ''}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
