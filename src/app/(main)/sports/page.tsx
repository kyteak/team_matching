import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Clock, Users } from 'lucide-react'
import { formatDate, SKILL_LEVELS } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const SPORT_EMOJI: Record<string, string> = { '축구': '⚽', '풋살': '⚽', '농구': '🏀', '테니스': '🎾', '배드민턴': '🏸' }

export default async function SportsPage() {
  const supabase = await createClient()
  const { data: matches } = await supabase
    .from('sport_matches')
    .select('*, creator:profiles(name, department)')
    .neq('status', 'deleted')
    .order('status', { ascending: true })
    .order('match_at', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">스포츠 매칭</h1>
          <p className="text-muted-foreground text-sm mt-1">함께할 팀을 찾거나 직접 매치를 만들어보세요</p>
        </div>
        <Link href="/sports/create" className={buttonVariants()}><Plus size={16} className="mr-1" />매치 만들기</Link>
      </div>

      {!matches || matches.length === 0 ? (
        <Card><CardContent className="p-16 text-center">
          <p className="text-4xl mb-4">🏆</p>
          <p className="text-muted-foreground">아직 모집 중인 매치가 없어요.</p>
          <p className="text-muted-foreground/60 text-sm mt-1">첫 번째 매치를 만들어보세요!</p>
        </CardContent></Card>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match: any) => {
            const skillLabel = SKILL_LEVELS.find(s => s.value === match.skill_level)?.label ?? match.skill_level
            const isMatched = match.status === 'matched'
            return (
              <Link key={match.id} href={`/sports/${match.id}`}>
                <Card className={`hover:shadow-md transition-all duration-200 hover:border-primary/20 ${isMatched ? 'opacity-60' : ''}`}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{SPORT_EMOJI[match.sport] ?? '🏅'}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">{match.team_name}</span>
                          <Badge variant={isMatched ? 'secondary' : 'default'} className={isMatched ? '' : 'bg-primary'}>
                            {isMatched ? '매칭 완료' : '모집 중'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mt-0.5">{match.sport} · {match.max_players} · {skillLabel}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground/70">
                          <span className="flex items-center gap-1"><Clock size={11} />{formatDate(match.match_at)}</span>
                          <span className="flex items-center gap-1"><Users size={11} />{(match.creator as any)?.name}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
