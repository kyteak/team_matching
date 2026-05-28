import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar, Users, ChevronRight } from 'lucide-react'
import { formatDateOnly } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import CompetitionRegionFilter from './CompetitionRegionFilter'
import { Suspense } from 'react'

export default async function CompetitionsPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: intro } = await supabase
    .from('self_introductions')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  if (!intro) redirect('/competitions/intro')

  let query = supabase
    .from('competition_recruitments')
    .select('*, competition:competitions(title, deadline, host, region), creator:profiles(name, department)')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  if (region) {
    query = query.eq('competitions.region', region)
  }

  const { data: allRecruitments } = await query
  const recruitments = allRecruitments ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">공모전 팀 매칭</h1>
          <p className="text-muted-foreground text-sm mt-1">공모전 팀원을 찾거나 직접 모집해보세요</p>
        </div>
        <Link href="/competitions/create" className={buttonVariants()}><Plus size={16} className="mr-1" />모집 만들기</Link>
      </div>

      <Suspense>
        <CompetitionRegionFilter current={region ?? ''} />
      </Suspense>

      <div className="mt-4">
        {!recruitments || recruitments.length === 0 ? (
          <Card><CardContent className="p-16 text-center">
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-muted-foreground">
              {region ? `${region} 지역 모집 중인 공모전이 없어요.` : '아직 모집 중인 공모전이 없어요.'}
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">첫 번째 팀 모집을 만들어보세요!</p>
          </CardContent></Card>
        ) : (
          <div className="flex flex-col gap-3">
            {recruitments.map((rec: any) => {
              const isFull = rec.status === 'full'
              return (
                <Link key={rec.id} href={`/competitions/${rec.id}`}>
                  <Card className={`hover:shadow-md transition-all duration-200 hover:border-primary/20 ${isFull ? 'opacity-60' : ''}`}>
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">{rec.team_name}</span>
                          <Badge variant={isFull ? 'secondary' : 'default'} className={isFull ? '' : 'bg-green-600'}>
                            {isFull ? '모집 완료' : '모집 중'}
                          </Badge>
                          {rec.competition?.region && (
                            <Badge variant="outline" className="text-xs">{rec.competition.region}</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mt-0.5 truncate">{rec.competition?.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground/70 flex-wrap">
                          <span className="flex items-center gap-1"><Users size={11} />{rec.current_members}/{rec.max_members}명</span>
                          <span className="flex items-center gap-1"><Calendar size={11} />마감 {formatDateOnly(rec.deadline)}</span>
                          <span>{rec.creator?.name} · {rec.creator?.department}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground flex-shrink-0 ml-2" />
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
