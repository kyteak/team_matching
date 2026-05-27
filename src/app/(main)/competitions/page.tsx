import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar, Users, ChevronRight } from 'lucide-react'
import { formatDateOnly } from '@/lib/utils'

export default async function CompetitionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 자기소개서 작성 여부 확인
  const { data: intro } = await supabase
    .from('self_introductions')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  if (!intro) {
    redirect('/competitions/intro')
  }

  const { data: recruitments } = await supabase
    .from('competition_recruitments')
    .select('*, competition:competitions(title, deadline, host), creator:profiles(name, department)')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">공모전 팀 매칭</h1>
          <p className="text-slate-500 text-sm mt-1">공모전 팀원을 찾거나 직접 모집해보세요</p>
        </div>
        <Link href="/competitions/create" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          모집 만들기
        </Link>
      </div>

      {!recruitments || recruitments.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-4">🏆</p>
          <p className="text-slate-500">아직 모집 중인 공모전이 없어요.</p>
          <p className="text-slate-400 text-sm mt-1">첫 번째 팀 모집을 만들어보세요!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recruitments.map((rec: any) => {
            const isFull = rec.status === 'full'
            return (
              <Link
                key={rec.id}
                href={`/competitions/${rec.id}`}
                className={`card p-5 flex items-center justify-between hover:shadow-md transition-all ${isFull ? 'opacity-60' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800">{rec.team_name}</span>
                    <span className={`badge ${isFull ? 'badge-gray' : 'badge-green'}`}>
                      {isFull ? '모집 완료' : '모집 중'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mt-0.5 truncate">{rec.competition?.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users size={12} />{rec.current_members}/{rec.max_members}명
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />마감 {formatDateOnly(rec.deadline)}
                    </span>
                    <span>{rec.creator?.name} · {rec.creator?.department}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 flex-shrink-0 ml-2" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
