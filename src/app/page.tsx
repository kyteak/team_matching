import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Trophy, Dumbbell } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let unreadCount = 0
  if (user) {
    const [profileRes, notifRes] = await Promise.all([
      supabase.from('profiles').select('name, department').eq('id', user.id).single(),
      supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
    ])
    profile = profileRes.data
    unreadCount = notifRes.count ?? 0
  }

  return (
    <div className="min-h-screen">
      <Navbar unreadCount={unreadCount} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[65vh] gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800">안녕하세요, {profile?.name ?? ''}님! 👋</h1>
            <p className="text-slate-500 mt-2">{profile?.department} · 무엇을 찾고 계신가요?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
            <Link href="/sports" className="card p-8 flex flex-col items-center gap-4 hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Dumbbell size={32} className="text-blue-600" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">스포츠</h2>
                <p className="text-slate-500 text-sm mt-1">축구, 풋살, 농구, 테니스, 배드민턴<br/>함께 할 팀을 찾아보세요!</p>
              </div>
            </Link>

            <Link href="/competitions" className="card p-8 flex flex-col items-center gap-4 hover:shadow-md hover:border-yellow-200 transition-all group cursor-pointer">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <Trophy size={32} className="text-yellow-600" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">공모전</h2>
                <p className="text-slate-500 text-sm mt-1">다양한 공모전에 참여할<br/>팀원을 모집해보세요!</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
