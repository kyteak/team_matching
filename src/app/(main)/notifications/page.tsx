import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import NotificationItem from './NotificationItem'
import { Bell } from 'lucide-react'

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
        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
          <Bell size={18} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">알림</h1>
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-4">🔔</p>
          <p className="text-slate-500">아직 알림이 없어요.</p>
        </div>
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
