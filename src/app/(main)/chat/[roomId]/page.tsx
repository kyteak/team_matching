import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ChatClient from './ChatClient'

export default async function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: room } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (!room) notFound()

  const [messagesRes, profileRes] = await Promise.all([
    supabase.from('chat_messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true }).limit(200),
    supabase.from('profiles').select('name').eq('id', user!.id).single(),
  ])

  let roomTitle = '채팅방'
  if (room.type === 'sport') {
    const { data: match } = await supabase.from('sport_matches').select('team_name, sport').eq('id', room.reference_id).single()
    if (match) roomTitle = `${match.sport} · ${match.team_name}`
  } else if (room.type === 'competition') {
    const { data: rec } = await supabase.from('competition_recruitments').select('team_name').eq('id', room.reference_id).single()
    if (rec) roomTitle = rec.team_name
  } else if (room.type === 'direct') {
    const { data: friendship } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id, requester:profiles!requester_id(name), addressee:profiles!addressee_id(name)')
      .eq('id', room.reference_id)
      .single()
    if (friendship) {
      const other = friendship.requester_id === user!.id ? friendship.addressee : friendship.requester
      roomTitle = (other as any)?.name ?? '1:1 채팅'
    }
  }

  return (
    <ChatClient
      roomId={roomId}
      roomTitle={roomTitle}
      roomType={room.type}
      initialMessages={messagesRes.data ?? []}
      userId={user!.id}
      userName={profileRes.data?.name ?? ''}
    />
  )
}
