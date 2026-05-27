'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DEPARTMENTS } from '@/lib/departments'
import { canChangePassword, cn } from '@/lib/utils'
import { User, Lock, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const LEVEL_OPTIONS = [
  '완전 초보 수준이에요 🌱',
  '기초는 알고 있어요 📚',
  '어느 정도 할 수 있어요 💪',
  '상위 수준이에요 🔥',
  '전문가 수준이에요 ⭐',
]

export default function ProfileClient({ profile, intro, userId }: { profile: any; intro: any; userId: string }) {
  const router = useRouter()
  const [section, setSection] = useState<'dept' | 'pw' | 'intro' | null>(null)

  const [department, setDepartment] = useState(profile?.department ?? '')
  const [deptLoading, setDeptLoading] = useState(false)
  const [deptMsg, setDeptMsg] = useState('')

  const [newPw, setNewPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  const [introForm, setIntroForm] = useState({
    interests: intro?.interests ?? '', strengths: intro?.strengths ?? '',
    skills: intro?.skills ?? '', certifications: intro?.certifications ?? '', level: intro?.level ?? '',
  })
  const [introLoading, setIntroLoading] = useState(false)
  const [introMsg, setIntroMsg] = useState('')

  const pwAllowed = canChangePassword(profile?.password_changed_at)

  async function saveDepartment() {
    setDeptLoading(true); setDeptMsg('')
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ department }).eq('id', userId)
    setDeptMsg(error ? '저장 실패. 다시 시도해주세요.' : '학과가 변경되었어요!')
    setDeptLoading(false)
    if (!error) router.refresh()
  }

  async function changePassword() {
    if (!newPw || newPw.length < 6) { setPwMsg('새 비밀번호는 6자 이상이어야 해요.'); return }
    setPwLoading(true); setPwMsg('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) {
      setPwMsg('비밀번호 변경 실패. 현재 비밀번호를 확인해주세요.')
    } else {
      await supabase.from('profiles').update({ password_changed_at: new Date().toISOString() }).eq('id', userId)
      setPwMsg('비밀번호가 변경되었어요!')
      setNewPw('')
    }
    setPwLoading(false)
  }

  async function saveIntro() {
    if (!introForm.interests || !introForm.strengths || !introForm.skills || !introForm.level) {
      setIntroMsg('필수 항목을 모두 입력해주세요.'); return
    }
    setIntroLoading(true); setIntroMsg('')
    const supabase = createClient()
    const { error } = await supabase.from('self_introductions').upsert({
      user_id: userId, ...introForm, certifications: introForm.certifications || null, updated_at: new Date().toISOString(),
    })
    setIntroMsg(error ? '저장 실패. 다시 시도해주세요.' : '자기소개서가 업데이트되었어요!')
    setIntroLoading(false)
  }

  function toggle(s: typeof section) { setSection(prev => prev === s ? null : s) }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">개인정보 관리</h1>
        <p className="text-muted-foreground text-sm mt-1">{profile?.name} · {profile?.department}</p>
      </div>

      <div className="flex flex-col gap-3">
        {/* 학과 수정 */}
        <Card className="overflow-hidden">
          <button className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors" onClick={() => toggle('dept')}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold">학과 수정</p>
                <p className="text-sm text-muted-foreground">{profile?.department}</p>
              </div>
            </div>
            {section === 'dept' ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
          </button>
          {section === 'dept' && (
            <CardContent className="border-t pt-4 flex flex-col gap-3">
              <Select value={department} onValueChange={v => setDepartment(v as string)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              {deptMsg && <p className={`text-sm ${deptMsg.includes('실패') ? 'text-destructive' : 'text-green-600'}`}>{deptMsg}</p>}
              <Button onClick={saveDepartment} disabled={deptLoading}>{deptLoading ? '저장 중...' : '저장'}</Button>
            </CardContent>
          )}
        </Card>

        {/* 비밀번호 변경 */}
        <Card className="overflow-hidden">
          <button className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors" onClick={() => toggle('pw')}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Lock size={18} className="text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold">비밀번호 변경</p>
                <p className="text-sm text-muted-foreground">{pwAllowed ? '변경 가능' : '한 달에 한 번만 변경 가능'}</p>
              </div>
            </div>
            {section === 'pw' ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
          </button>
          {section === 'pw' && (
            <CardContent className="border-t pt-4 flex flex-col gap-3">
              {!pwAllowed ? (
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-3 text-sm text-orange-700 dark:text-orange-400">
                  한 달에 한 번만 비밀번호를 변경할 수 있어요. 30일 후에 다시 시도해주세요.
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <Label>새 비밀번호</Label>
                    <Input type="password" placeholder="새 비밀번호 (6자 이상)" value={newPw} onChange={e => setNewPw(e.target.value)} />
                  </div>
                  {pwMsg && <p className={`text-sm ${pwMsg.includes('실패') ? 'text-destructive' : 'text-green-600'}`}>{pwMsg}</p>}
                  <Button onClick={changePassword} disabled={pwLoading}>{pwLoading ? '변경 중...' : '비밀번호 변경'}</Button>
                </>
              )}
            </CardContent>
          )}
        </Card>

        {/* 자기소개서 수정 */}
        <Card className="overflow-hidden">
          <button className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors" onClick={() => toggle('intro')}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <FileText size={18} className="text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold">공모전 자기소개서</p>
                <p className="text-sm text-muted-foreground">{intro ? '작성 완료 · 수정 가능' : '아직 작성하지 않았어요'}</p>
              </div>
            </div>
            {section === 'intro' ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
          </button>
          {section === 'intro' && (
            <CardContent className="border-t pt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>관심 분야 <span className="text-destructive">*</span></Label>
                <Textarea className="min-h-[70px] resize-none" value={introForm.interests} onChange={e => setIntroForm(p => ({ ...p, interests: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>공모전 강점 <span className="text-destructive">*</span></Label>
                <Textarea className="min-h-[70px] resize-none" value={introForm.strengths} onChange={e => setIntroForm(p => ({ ...p, strengths: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>잘할 수 있는 부분 <span className="text-destructive">*</span></Label>
                <Textarea className="min-h-[70px] resize-none" value={introForm.skills} onChange={e => setIntroForm(p => ({ ...p, skills: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>자격증 <span className="text-muted-foreground font-normal">(선택)</span></Label>
                <Input value={introForm.certifications} onChange={e => setIntroForm(p => ({ ...p, certifications: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>본인 수준 <span className="text-destructive">*</span></Label>
                <div className="flex flex-col gap-1.5">
                  {LEVEL_OPTIONS.map(opt => (
                    <button key={opt} type="button" onClick={() => setIntroForm(p => ({ ...p, level: opt }))}
                      className={cn('p-2.5 rounded-xl border-2 text-sm text-left transition-all', introForm.level === opt ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40')}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {introMsg && <p className={`text-sm ${introMsg.includes('실패') ? 'text-destructive' : 'text-green-600'}`}>{introMsg}</p>}
              <Button onClick={saveIntro} disabled={introLoading}>{introLoading ? '저장 중...' : '저장'}</Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
