import { createClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileRes, introRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('self_introductions').select('*').eq('user_id', user!.id).single(),
  ])

  return <ProfileClient profile={profileRes.data} intro={introRes.data} userId={user!.id} />
}
