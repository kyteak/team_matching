import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, Trash2 } from 'lucide-react'
import { formatDate, SKILL_LEVELS, isToday } from '@/lib/utils'
import SportMatchActions from './SportMatchActions'

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
        <Link href="/sports" className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">매치 상세</h1>
      </div>

      <div className="card p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{SPORT_EMOJI[match.sport] ?? '🏅'}</span>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{match.team_name}</h2>
              <span className={`badge ${isMatched ? 'badge-gray' : 'badge-blue'} mt-1`}>
                {isMatched ? '매칭 완료' : '모집 중'}
              </span>
            </div>
          </div>
          {canDelete && <SportMatchActions matchId={id} />}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">종목</p>
            <p className="font-semibold text-slate-700">{match.sport}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">인원</p>
            <p className="font-semibold text-slate-700">{match.max_players}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">팀 수준</p>
            <p className="font-semibold text-slate-700">{skillLabel}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">모집자</p>
            <p className="font-semibold text-slate-700">{(match.creator as any)?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Clock size={16} />
          <span className="text-sm">{formatDate(match.match_at)}</span>
        </div>

        {!isCreator && !isMatched && (
          <SportApplySection matchId={id} userId={user!.id} userName={profile?.name ?? ''} alreadyApplied={!!myApplication} />
        )}

        {isCreator && (
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
            내가 만든 매치입니다.{!isMatched && !isToday(match.match_at) ? ' 삭제하려면 우측 상단 버튼을 눌러주세요.' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

function SportApplySection({ matchId, userId, userName, alreadyApplied }: { matchId: string; userId: string; userName: string; alreadyApplied: boolean }) {
  return (
    <div>
      {alreadyApplied ? (
        <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700 text-center font-medium">
          ✅ 이미 매칭 신청을 완료했어요!
        </div>
      ) : (
        <SportApplyButton matchId={matchId} userId={userId} userName={userName} />
      )}
    </div>
  )
}

// Client component for apply button
import SportApplyButton from './SportApplyButton'
