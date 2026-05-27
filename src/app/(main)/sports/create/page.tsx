'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SKILL_LEVELS, SPORT_PLAYERS } from '@/lib/utils'

const SPORTS = ['축구', '풋살', '농구', '테니스', '배드민턴']
const SPORT_EMOJI: Record<string, string> = {
  '축구': '⚽', '풋살': '⚽', '농구': '🏀', '테니스': '🎾', '배드민턴': '🏸'
}

export default function CreateSportMatchPage() {
  const router = useRouter()
  const [sport, setSport] = useState('')
  const [teamName, setTeamName] = useState('')
  const [skillLevel, setSkillLevel] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('')
  const [matchDate, setMatchDate] = useState('')
  const [matchTime, setMatchTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!sport || !teamName || !skillLevel || !maxPlayers || !matchDate || !matchTime) {
      setError('모든 항목을 입력해주세요.')
      return
    }

    const matchAt = new Date(`${matchDate}T${matchTime}:00`)
    if (matchAt <= new Date()) {
      setError('매치 날짜는 현재 시간 이후로 설정해주세요.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: insertError } = await supabase.from('sport_matches').insert({
      creator_id: user.id,
      sport,
      team_name: teamName,
      skill_level: skillLevel,
      max_players: maxPlayers,
      match_at: matchAt.toISOString(),
      status: 'recruiting',
    })

    if (insertError) {
      setError('매치 생성에 실패했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    router.push('/sports')
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sports" className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">매치 만들기</h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
        {/* 종목 선택 */}
        <div>
          <label className="label">종목 선택 <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {SPORTS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { setSport(s); setMaxPlayers('') }}
                className={`p-3 rounded-xl border-2 text-center transition-all text-sm font-medium ${
                  sport === s
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xl mb-1">{SPORT_EMOJI[s]}</div>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 팀 명 */}
        <div>
          <label className="label">팀 명 <span className="text-red-500">*</span></label>
          <input className="input" type="text" placeholder="우리 팀 이름을 입력하세요" value={teamName} onChange={e => setTeamName(e.target.value)} />
        </div>

        {/* 팀 수준 */}
        <div>
          <label className="label">팀 수준 <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            {SKILL_LEVELS.map(level => (
              <button
                key={level.value}
                type="button"
                onClick={() => setSkillLevel(level.value)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                  skillLevel === level.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* 인원 선택 */}
        {sport && (
          <div>
            <label className="label">인원 <span className="text-red-500">*</span></label>
            <div className="flex gap-2 flex-wrap">
              {SPORT_PLAYERS[sport]?.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMaxPlayers(option)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    maxPlayers === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 날짜 & 시간 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">날짜 <span className="text-red-500">*</span></label>
            <input className="input" type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="label">시간 <span className="text-red-500">*</span></label>
            <input className="input" type="time" value={matchTime} onChange={e => setMatchTime(e.target.value)} />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? '생성 중...' : '매치 생성하기 🏅'}
        </button>
      </form>
    </div>
  )
}
