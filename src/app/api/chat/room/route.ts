import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { type, referenceId } = await request.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: existing } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('reference_id', referenceId)
    .single()

  if (existing) return NextResponse.json({ roomId: existing.id })

  const { data: room, error } = await supabase
    .from('chat_rooms')
    .insert({ type, reference_id: referenceId })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ roomId: room.id })
}
