'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDateOnly } from '@/lib/utils'

export default function CreateCompetitionRecruitmentPage() {
  const router = useRouter()
  const [competitions, setCompetitions] = useState<any[]>([])
  const [selectedComp, setSelectedComp] = useState('')
  const [teamName, setTeamName] = useState('')
  const [maxMembers, setMaxMembers] = useState('')
  const [creatorRole, setCreatorRole] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCompetitions() {
      const supabase = createClient()
      const { data } = await supabase
        .from('competitions')
        .select('*')
        .gte('deadline', new Date().toISOString().split('T')[0])
        .order('deadline', { ascending: true })
      setCompetitions(data ?? [])
    }
    fetchCompetitions()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!selectedComp || !teamName || !maxMembers || !creatorRole || !deadline) {
      setError('모든 항목을 입력해주세요.')
      return
    }

    const membersNum = parseInt(maxMembers)
    if (isNaN(membersNum) || membersNum < 1) {
      setError('모집 인원을 올바르게 입력해주세요.')
      return
    }

    if (new Date(deadline) <= new Date()) {
      setError('마감일은 오늘 이후로 설정해주세요.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: insertError } = await supabase.from('competition_recruitments').insert({
      creator_id: user.id,
      competition_id: selectedComp,
      team_name: teamName,
      max_members: membersNum,
      current_members: 1,
      creator_role: creatorRole,
      deadline: deadline,
      status: 'recruiting',
    })

    if (insertError) {
      setError('모집 생성에 실패했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    router.push('/competitions')
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/competitions" className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">공모전 모집 만들기</h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
        {/* 공모전 선택 */}
        <div>
          <label className="label">공모전 선택 <span className="text-red-500">*</span></label>
          {competitions.length === 0 ? (
            <p className="text-slate-400 text-sm">불러오는 중...</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {competitions.map(comp => (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => setSelectedComp(comp.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedComp === comp.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className={`font-medium text-sm ${selectedComp === comp.id ? 'text-blue-700' : 'text-slate-800'}`}>{comp.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{comp.host} · 마감 {formatDateOnly(comp.deadline)}</p>
                  {comp.prize && <p className="text-xs text-green-600 mt-0.5">🏆 {comp.prize}</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">팀 명 <span className="text-red-500">*</span></label>
          <input className="input" type="text" placeholder="팀 이름을 입력하세요" value={teamName} onChange={e => setTeamName(e.target.value)} />
        </div>

        <div>
          <label className="label">모집 인원 <span className="text-red-500">*</span></label>
          <input className="input" type="number" placeholder="본인 포함 총 팀원 수" min="2" max="20" value={maxMembers} onChange={e => setMaxMembers(e.target.value)} />
        </div>

        <div>
          <label className="label">본인이 공모전에서 잘할 수 있는 부분 <span className="text-red-500">*</span></label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="예: 기획 및 아이디어 발굴, PPT 제작, 코딩 담당 등"
            value={creatorRole}
            onChange={e => setCreatorRole(e.target.value)}
          />
        </div>

        <div>
          <label className="label">모집 마감 기간 <span className="text-red-500">*</span></label>
          <input
            className="input"
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? '생성 중...' : '모집 만들기 🚀'}
        </button>
      </form>
    </div>
  )
}
