import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Users, Trophy } from 'lucide-react'
import { formatDateOnly } from '@/lib/utils'
import CompetitionApplyButton from './CompetitionApplyButton'
import CompetitionActions from './CompetitionActions'
import ApplicantList from './ApplicantList'

export default async function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rec } = await supabase
    .from('competition_recruitments')
    .select('*, competition:competitions(*), creator:profiles(id, name, department)')
    .eq('id', id)
    .neq('status', 'deleted')
    .single()

  if (!rec) notFound()

  const { data: myApplication } = await supabase
    .from('competition_applications')
    .select('id, status')
    .eq('recruitment_id', id)
    .eq('applicant_id', user!.id)
    .single()

  const { data: applications } = await supabase
    .from('competition_applications')
    .select('*, applicant:profiles(name, department), intro:self_introductions(*)')
    .eq('recruitment_id', id)

  const isCreator = (rec.creator as any)?.id === user!.id
  const isFull = rec.status === 'full'
  const canDelete = isCreator && rec.current_members <= 1

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/competitions" className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">모집 상세</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="card p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{rec.team_name}</h2>
              <span className={`badge mt-1 ${isFull ? 'badge-gray' : 'badge-green'}`}>
                {isFull ? '모집 완료' : '모집 중'}
              </span>
            </div>
            {canDelete && <CompetitionActions recruitmentId={id} />}
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} className="text-yellow-600" />
              <span className="font-semibold text-yellow-800 text-sm">{rec.competition?.title}</span>
            </div>
            <p className="text-yellow-700 text-xs">{rec.competition?.host}</p>
            {rec.competition?.prize && <p className="text-yellow-700 text-xs mt-1">🏆 {rec.competition.prize}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">모집 인원</p>
              <p className="font-semibold text-slate-700 flex items-center gap-1">
                <Users size={14} />{rec.current_members}/{rec.max_members}명
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">모집 마감</p>
              <p className="font-semibold text-slate-700 flex items-center gap-1">
                <Calendar size={14} />{formatDateOnly(rec.deadline)}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-1">모집자 역할</p>
            <p className="text-slate-700 text-sm bg-slate-50 rounded-xl p-3">{rec.creator_role}</p>
          </div>

          <p className="text-xs text-slate-400">
            모집자: {(rec.creator as any)?.name} · {(rec.creator as any)?.department}
          </p>
        </div>

        {/* 지원 버튼 (비생성자 & 미완료) */}
        {!isCreator && !isFull && (
          <div className="card p-5">
            {myApplication ? (
              <div className={`rounded-xl p-4 text-sm text-center font-medium ${
                myApplication.status === 'accepted' ? 'bg-green-50 text-green-700' :
                myApplication.status === 'rejected' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {myApplication.status === 'accepted' && '✅ 수락되었어요! 팀에 합류하게 되었습니다.'}
                {myApplication.status === 'rejected' && '❌ 아쉽게도 이번 팀과는 맞지 않았어요.'}
                {myApplication.status === 'pending' && '⏳ 지원 완료! 모집자의 검토를 기다리고 있어요.'}
              </div>
            ) : (
              <CompetitionApplyButton recruitmentId={id} userId={user!.id} />
            )}
          </div>
        )}

        {/* 지원자 목록 (생성자만) */}
        {isCreator && applications && applications.length > 0 && (
          <ApplicantList applications={applications} recruitmentId={id} />
        )}

        {isCreator && (!applications || applications.length === 0) && (
          <div className="card p-6 text-center text-slate-400 text-sm">
            아직 지원자가 없어요. 조금만 기다려주세요! 👀
          </div>
        )}
      </div>
    </div>
  )
}
