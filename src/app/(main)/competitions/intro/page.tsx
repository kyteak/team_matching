'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LEVEL_OPTIONS = [
  '완전 초보 수준이에요 🌱',
  '기초는 알고 있어요 📚',
  '어느 정도 할 수 있어요 💪',
  '상위 수준이에요 🔥',
  '전문가 수준이에요 ⭐',
]

export default function IntroPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    interests: '',
    strengths: '',
    skills: '',
    certifications: '',
    level: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.interests || !form.strengths || !form.skills || !form.level) {
      setError('필수 항목을 모두 입력해주세요.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: insertError } = await supabase.from('self_introductions').upsert({
      user_id: user.id,
      interests: form.interests,
      strengths: form.strengths,
      skills: form.skills,
      certifications: form.certifications || null,
      level: form.level,
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      setError('저장에 실패했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    router.push('/competitions')
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">📝</div>
        <h1 className="text-2xl font-bold text-slate-800">자기소개서 작성</h1>
        <p className="text-slate-500 text-sm mt-2">
          공모전 팀 매칭을 위해 자기소개서를 작성해주세요.<br/>
          팀 모집자가 검토 후 수락 여부를 결정합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
        <div>
          <label className="label">관심 분야 <span className="text-red-500">*</span></label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="예: IT, 디자인, 마케팅, 환경, 사회혁신 등"
            value={form.interests}
            onChange={e => update('interests', e.target.value)}
          />
        </div>

        <div>
          <label className="label">공모전 참여 시 강점 <span className="text-red-500">*</span></label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="예: 아이디어 발굴, 발표, 기획, 데이터 분석 등"
            value={form.strengths}
            onChange={e => update('strengths', e.target.value)}
          />
        </div>

        <div>
          <label className="label">잘할 수 있는 부분 <span className="text-red-500">*</span></label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="예: PPT 제작, 코딩, UX 디자인, 문서 작성 등"
            value={form.skills}
            onChange={e => update('skills', e.target.value)}
          />
        </div>

        <div>
          <label className="label">소유 자격증 <span className="text-slate-400 font-normal">(선택)</span></label>
          <input
            className="input"
            type="text"
            placeholder="예: 정보처리기사, GTQ, 한국사능력검정 등"
            value={form.certifications}
            onChange={e => update('certifications', e.target.value)}
          />
        </div>

        <div>
          <label className="label">객관적으로 생각하는 본인의 수준 <span className="text-red-500">*</span></label>
          <div className="flex flex-col gap-2">
            {LEVEL_OPTIONS.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => update('level', opt)}
                className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                  form.level === opt
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? '저장 중...' : '저장하고 공모전 보러가기 →'}
        </button>
      </form>
    </div>
  )
}
