'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DEPARTMENTS } from '@/lib/departments'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    name: '',
    department: '',
    studentId: '',
    email: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.')
      return
    }
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }
    if (!form.department) {
      setError('학과를 선택해주세요.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // 아이디 중복 확인
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', form.username)
      .single()

    if (existing) {
      setError('이미 사용 중인 아이디예요.')
      setLoading(false)
      return
    }

    // 이메일 생성 (username@gaesin.cbnu.kr 형태로 내부 처리)
    const internalEmail = `${form.username}@gaesin-matching.internal`

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: internalEmail,
      password: form.password,
    })

    if (authError || !authData.user) {
      setError('회원가입에 실패했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username: form.username,
      name: form.name,
      department: form.department,
      student_id: form.studentId || null,
      email: form.email || null,
    })

    if (profileError) {
      setError('프로필 생성에 실패했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">GaeSin-Matching</h1>
          <p className="text-slate-500 text-sm mt-1">회원가입</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="label">아이디 <span className="text-red-500">*</span></label>
            <input className="input" type="text" placeholder="아이디 (영문, 숫자)" value={form.username} onChange={e => update('username', e.target.value)} required />
          </div>
          <div>
            <label className="label">비밀번호 <span className="text-red-500">*</span></label>
            <input className="input" type="password" placeholder="6자 이상" value={form.password} onChange={e => update('password', e.target.value)} required />
          </div>
          <div>
            <label className="label">비밀번호 확인 <span className="text-red-500">*</span></label>
            <input className="input" type="password" placeholder="비밀번호를 다시 입력하세요" value={form.passwordConfirm} onChange={e => update('passwordConfirm', e.target.value)} required />
          </div>
          <div>
            <label className="label">이름 <span className="text-red-500">*</span></label>
            <input className="input" type="text" placeholder="실명을 입력하세요" value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>
          <div>
            <label className="label">학과 <span className="text-red-500">*</span></label>
            <select className="input" value={form.department} onChange={e => update('department', e.target.value)} required>
              <option value="">학과를 선택하세요</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400 mb-3">선택 입력사항</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="label">학번</label>
                <input className="input" type="text" placeholder="학번 (선택)" value={form.studentId} onChange={e => update('studentId', e.target.value)} />
              </div>
              <div>
                <label className="label">이메일</label>
                <input className="input" type="email" placeholder="이메일 주소 (선택)" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button className="btn-primary w-full mt-2" type="submit" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  )
}
