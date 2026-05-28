import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { email, code } = await request.json()

  if (!email || !code) {
    return NextResponse.json({ error: '이메일과 코드를 입력해주세요.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('email_verifications')
    .select('id')
    .eq('email', email)
    .eq('code', code)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '인증 코드가 올바르지 않거나 만료되었어요.' }, { status: 400 })
  }

  await supabase.from('email_verifications').update({ used: true }).eq('id', data.id)

  return NextResponse.json({ success: true })
}
