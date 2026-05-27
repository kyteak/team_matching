import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Clock, Users, ChevronRight } from 'lucide-react'
import { formatDate, SKILL_LEVELS } from '@/lib/utils'

const SPORT_EMOJI: Record<string, string> = {
  '축구': '⚽', '풋살': '⚽', '농구': '🏀', '테니스': '🎾', '배드민턴': '🏸'
}

export default async function SportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
          <h1 className="text-2xl font-bold text-slate-800">스포츠 매칭</h1>
          <p className="text-slate-500 text-sm mt-1">함께할 팀을 찾거나 직접 매치를 만들어보세요</p>
        </div>
        <Link href="/sports/create" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          매치 만들기
        </Link>
      </div>

      {!matches || matches.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-4">🏆</p>
          <p className="text-slate-500">아직 모집 중인 매치가 없어요.</p>
          <p className="text-slate-400 text-sm mt-1">첫 번째 매치를 만들어보세요!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match: any) => {
            const skillLabel = SKILL_LEVELS.find(s => s.value === match.skill_level)?.label ?? match.skill_level
            const isMatched = match.status === 'matched'
            return (
              <Link
                key={match.id}
                href={`/sports/${match.id}`}
                className={`card p-5 flex items-center justify-between hover:shadow-md transition-all ${isMatched ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{SPORT_EMOJI[match.sport] ?? '🏅'}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{match.team_name}</span>
                      <span className={`badge ${isMatched ? 'badge-gray' : 'badge-blue'}`}>
                        {isMatched ? '매칭 완료' : '모집 중'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {match.sport} · {match.max_players} · {skillLabel}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={12} />{formatDate(match.match_at)}</span>
                      <span className="flex items-center gap-1"><Users size={12} />{(match.creator as any)?.name}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
