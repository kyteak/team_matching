import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email?.endsWith('@chungbuk.ac.kr') && !email?.endsWith('@cbnu.ac.kr')) {
    return NextResponse.json({ error: '충북대학교 이메일(@chungbuk.ac.kr)만 사용 가능해요.' }, { status: 400 })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  const supabase = await createClient()
  const { error: insertError } = await supabase.from('email_verifications').insert({
    email, code, expires_at: expiresAt.toISOString(),
  })

  if (insertError) {
    return NextResponse.json({ error: '서버 오류가 발생했어요.' }, { status: 500 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: '이메일 서비스가 설정되지 않았어요.' }, { status: 500 })
  }

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'GaeSin-Matching <onboarding@resend.dev>',
      to: [email],
      subject: '[개신매칭] 이메일 인증 코드',
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:24px">
          <h2 style="color:#4f46e5;margin-bottom:8px">이메일 인증 코드</h2>
          <p style="color:#374151;margin-bottom:20px">아래 6자리 코드를 회원가입 화면에 입력해주세요.</p>
          <div style="font-size:38px;font-weight:700;letter-spacing:12px;background:#f3f4f6;padding:24px;text-align:center;border-radius:12px;color:#111827">${code}</div>
          <p style="color:#9ca3af;font-size:13px;margin-top:16px">이 코드는 10분간 유효합니다. 본인이 요청하지 않았다면 무시하세요.</p>
        </div>
      `,
    }),
  })

  if (!emailRes.ok) {
    const err = await emailRes.json()
    console.error('Resend error:', err)
    return NextResponse.json({ error: '이메일 전송에 실패했어요.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
