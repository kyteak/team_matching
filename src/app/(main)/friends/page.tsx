import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FriendSearch from './FriendSearch'
import FriendItem from './FriendItem'
import RequestItem from './RequestItem'

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [friendsRes, receivedRes, sentRes] = await Promise.all([
    supabase.from('friendships')
      .select('*, requester:profiles!requester_id(id, name, department), addressee:profiles!addressee_id(id, name, department)')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`),
    supabase.from('friendships')
      .select('*, requester:profiles!requester_id(id, name, department)')
      .eq('status', 'pending')
      .eq('addressee_id', user!.id),
    supabase.from('friendships')
      .select('*, addressee:profiles!addressee_id(id, name, department)')
      .eq('status', 'pending')
      .eq('requester_id', user!.id),
  ])

  const friends = friendsRes.data ?? []
  const received = receivedRes.data ?? []
  const sent = sentRes.data ?? []

  // IDs already in a friendship relation (to disable duplicate add)
  const existingIds = [
    ...friends.map((f: any) => f.requester_id === user!.id ? f.addressee_id : f.requester_id),
    ...received.map((f: any) => f.requester_id),
    ...sent.map((f: any) => f.addressee_id),
  ]

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">친구</h1>
        <p className="text-muted-foreground text-sm mt-1">친구를 추가하고 1:1 채팅을 나눠보세요</p>
      </div>

      <FriendSearch currentUserId={user!.id} existingIds={existingIds} />

      {received.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">받은 친구 요청 ({received.length})</CardTitle></CardHeader>
          <CardContent className="pt-0 divide-y divide-border">
            {received.map((req: any) => (
              <RequestItem key={req.id} friendship={req} currentUserId={user!.id} />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">친구 목록 ({friends.length})</CardTitle></CardHeader>
        <CardContent className="pt-0">
          {friends.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">아직 친구가 없어요.<br/>위에서 이름이나 아이디로 검색해보세요!</p>
          ) : (
            <div className="divide-y divide-border">
              {friends.map((f: any) => {
                const friend = f.requester_id === user!.id ? f.addressee : f.requester
                return <FriendItem key={f.id} friendshipId={f.id} friend={friend} />
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {sent.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">보낸 요청 ({sent.length})</CardTitle></CardHeader>
          <CardContent className="pt-0 divide-y divide-border">
            {sent.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                    {(req.addressee as any)?.name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{(req.addressee as any)?.name}</p>
                    <p className="text-xs text-muted-foreground">{(req.addressee as any)?.department}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">대기 중</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
