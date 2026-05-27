import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Bell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import NotificationItem from './NotificationItem'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
          <Bell size={18} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold">알림</h1>
      </div>

      {!notifications || notifications.length === 0 ? (
        <Card><CardContent className="p-16 text-center">
          <p className="text-4xl mb-4">🔔</p>
          <p className="text-muted-foreground">아직 알림이 없어요.</p>
        </CardContent></Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(notif => (
            <NotificationItem key={notif.id} notification={notif} />
          ))}
        </div>
      )}
    </div>
  )
}
