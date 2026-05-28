'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DEPARTMENTS } from '@/lib/departments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '', passwordConfirm: '', name: '', department: '', studentId: '', email: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [sendingCode, setSendingCode] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [codeError, setCodeError] = useState('')

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'email') {
      setEmailVerified(false)
      setCodeSent(false)
      setVerificationCode('')
      setCodeError('')
    }
  }

  async function sendVerification() {
    setCodeError('')
    setSendingCode(true)
    const res = await fetch('/api/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    })
    const data = await res.json()
    setSendingCode(false)
    if (!res.ok) { setCodeError(data.error); return }
    setCodeSent(true)
  }

  async function verifyCode() {
    setCodeError('')
    setVerifyingCode(true)
    const res = await fetch('/api/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, code: verificationCode }),
    })
    const data = await res.json()
    setVerifyingCode(false)
    if (!res.ok) { setCodeError(data.error); return }
    setEmailVerified(true)
    setCodeError('')
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) { setError('비밀번호는 6자 이상이어야 해요.'); return }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않아요.'); return }
    if (!form.department) { setError('학과를 선택해주세요.'); return }
    if (!emailVerified) { setError('학교 이메일 인증을 완료해주세요.'); return }

    setLoading(true)
    const supabase = createClient()

    const { data: existing } = await supabase.from('profiles').select('id').eq('username', form.username).single()
    if (existing) { setError('이미 사용 중인 아이디예요.'); setLoading(false); return }

    const internalEmail = `${form.username}@gaesin.app`
    const { data: authData, error: authError } = await supabase.auth.signUp({ email: internalEmail, password: form.password })

    if (authError) { setError(`회원가입 실패: ${authError.message}`); setLoading(false); return }
    if (!authData.user) { setError('회원가입에 실패했어요.'); setLoading(false); return }
    if (!authData.session) {
      setError('이메일 인증이 필요합니다. Supabase → Authentication → Providers → Email → "Confirm email" 을 OFF로 설정해주세요.')
      setLoading(false); return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username: form.username,
      name: form.name,
      department: form.department,
      student_id: form.studentId || null,
      email: form.email,
    })

    if (profileError) { setError(`프로필 생성 실패: ${profileError.message}`); setLoading(false); return }

    router.push('/'); router.refresh(); setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
            <Dumbbell size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary">GaeSin-Matching</h1>
          <p className="text-muted-foreground text-sm">충북대학교 팀 매칭 플랫폼</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">회원가입</CardTitle>
            <CardDescription>충북대학교 학생만 가입할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">아이디 <span className="text-destructive">*</span></Label>
                <Input id="username" placeholder="영문, 숫자" value={form.username} onChange={e => update('username', e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">비밀번호 <span className="text-destructive">*</span></Label>
                <Input id="password" type="password" placeholder="6자 이상" value={form.password} onChange={e => update('password', e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="passwordConfirm">비밀번호 확인 <span className="text-destructive">*</span></Label>
                <Input id="passwordConfirm" type="password" placeholder="비밀번호를 다시 입력하세요" value={form.passwordConfirm} onChange={e => update('passwordConfirm', e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">이름 <span className="text-destructive">*</span></Label>
                <Input id="name" placeholder="실명을 입력하세요" value={form.name} onChange={e => update('name', e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label>학과 <span className="text-destructive">*</span></Label>
                <Select onValueChange={v => update('department', v as string)}>
                  <SelectTrigger><SelectValue placeholder="학과를 선택하세요" /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 학교 이메일 인증 */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">학교 이메일 <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="학번@chungbuk.ac.kr"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    disabled={emailVerified}
                    className="flex-1"
                  />
                  {!emailVerified && (
                    <Button type="button" variant="outline" onClick={sendVerification} disabled={sendingCode || !form.email} className="shrink-0">
                      {sendingCode ? '전송 중...' : codeSent ? '재전송' : '인증코드 전송'}
                    </Button>
                  )}
                </div>

                {codeSent && !emailVerified && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="6자리 코드 입력"
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value)}
                      maxLength={6}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={verifyCode} disabled={verifyingCode || verificationCode.length < 6} className="shrink-0">
                      {verifyingCode ? '확인 중...' : '확인'}
                    </Button>
                  </div>
                )}

                {emailVerified && (
                  <div className="flex items-center gap-1.5 text-green-500 text-sm">
                    <CheckCircle size={15} />
                    이메일 인증 완료
                  </div>
                )}
                {codeError && <p className="text-destructive text-sm">{codeError}</p>}
                {codeSent && !emailVerified && !codeError && (
                  <p className="text-muted-foreground text-xs">코드가 전송되었어요. 스팸함도 확인해보세요. (10분 유효)</p>
                )}
              </div>

              <Separator className="my-1" />
              <p className="text-xs text-muted-foreground">선택 입력사항</p>

              <div className="flex flex-col gap-2">
                <Label htmlFor="studentId">학번</Label>
                <Input id="studentId" placeholder="학번 (선택)" value={form.studentId} onChange={e => update('studentId', e.target.value)} />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full mt-1" disabled={loading || !emailVerified}>
                {loading ? '가입 중...' : '회원가입'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">로그인</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
