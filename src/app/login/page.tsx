'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const internalEmail = `${username}@gaesin.app`

    const { error: authError } = await supabase.auth.signInWithPassword({ email: internalEmail, password })

    if (authError) {
      setError('아이디 또는 비밀번호가 올바르지 않아요.')
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
            <CardTitle className="text-xl">로그인</CardTitle>
            <CardDescription>아이디와 비밀번호를 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">아이디</Label>
                <Input id="username" placeholder="아이디를 입력하세요" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input id="password" type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-destructive text-sm text-center">{error}</p>}
              <Button type="submit" className="w-full mt-1" disabled={loading}>
                {loading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              계정이 없으신가요?{' '}
              <Link href="/signup" className="text-primary font-semibold hover:underline">회원가입</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
