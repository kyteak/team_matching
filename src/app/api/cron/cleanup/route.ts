import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Vercel Cron Job: 매시간 실행
// vercel.json에서 "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 * * * *" }] 설정 필요

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date()

  // 1. 매치 시작 1시간 전까지 매칭 안된 스포츠 매치 삭제
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
  const { error: sportError } = await supabase
    .from('sport_matches')
    .update({ status: 'deleted' })
    .eq('status', 'recruiting')
    .lte('match_at', oneHourLater.toISOString())

  // 2. 마감일 지난 공모전 모집 삭제
  const today = now.toISOString().split('T')[0]
  const { error: compError } = await supabase
    .from('competition_recruitments')
    .update({ status: 'deleted' })
    .eq('status', 'recruiting')
    .lt('deadline', today)

  if (sportError || compError) {
    console.error('Cleanup errors:', { sportError, compError })
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: '자동 삭제 완료',
    timestamp: now.toISOString(),
  })
}
