'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SKILL_LEVELS, SPORT_PLAYERS } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const SPORTS = ['축구', '풋살', '농구', '테니스', '배드민턴']
const SPORT_EMOJI: Record<string, string> = { '축구': '⚽', '풋살': '⚽', '농구': '🏀', '테니스': '🎾', '배드민턴': '🏸' }

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
    if (!sport || !teamName || !skillLevel || !maxPlayers || !matchDate || !matchTime) { setError('모든 항목을 입력해주세요.'); return }
    const matchAt = new Date(`${matchDate}T${matchTime}:00`)
    if (matchAt <= new Date()) { setError('매치 날짜는 현재 시간 이후로 설정해주세요.'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error: insertError } = await supabase.from('sport_matches').insert({ creator_id: user.id, sport, team_name: teamName, skill_level: skillLevel, max_players: maxPlayers, match_at: matchAt.toISOString(), status: 'recruiting' })
    if (insertError) { setError('매치 생성에 실패했어요.'); setLoading(false); return }
    router.push('/sports'); router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sports" className={buttonVariants({ variant: 'ghost', size: 'icon' })}><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold">매치 만들기</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>매치 정보 입력</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label>종목 선택 <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-5 gap-2">
                {SPORTS.map(s => (
                  <button key={s} type="button" onClick={() => { setSport(s); setMaxPlayers('') }}
                    className={cn('p-2.5 rounded-xl border-2 text-center transition-all text-xs font-medium', sport === s ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40')}>
                    <div className="text-xl mb-1">{SPORT_EMOJI[s]}</div>{s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="teamName">팀 명 <span className="text-destructive">*</span></Label>
              <Input id="teamName" placeholder="우리 팀 이름을 입력하세요" value={teamName} onChange={e => setTeamName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>팀 수준 <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 gap-2">
                {SKILL_LEVELS.map(level => (
                  <button key={level.value} type="button" onClick={() => setSkillLevel(level.value)}
                    className={cn('p-3 rounded-xl border-2 text-sm font-medium text-left transition-all', skillLevel === level.value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40')}>
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {sport && (
              <div className="flex flex-col gap-2">
                <Label>인원 <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 flex-wrap">
                  {SPORT_PLAYERS[sport]?.map(option => (
                    <button key={option} type="button" onClick={() => setMaxPlayers(option)}
                      className={cn('px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all', maxPlayers === option ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40')}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="matchDate">날짜 <span className="text-destructive">*</span></Label>
                <Input id="matchDate" type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="matchTime">시간 <span className="text-destructive">*</span></Label>
                <Input id="matchTime" type="time" value={matchTime} onChange={e => setMatchTime(e.target.value)} />
              </div>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '생성 중...' : '매치 생성하기 🏅'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
