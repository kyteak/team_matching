import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let unreadCount = 0
  if (user) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    unreadCount = count ?? 0
  }

  return (
    <div className="min-h-screen">
      <Navbar unreadCount={unreadCount} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
