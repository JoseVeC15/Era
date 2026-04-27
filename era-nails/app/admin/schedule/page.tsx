import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminScheduleGrid from '@/components/AdminScheduleGrid'
import AdminNav from '@/components/AdminNav'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="admin-layout">
      <AdminNav />
      <div className="admin-content">
        <AdminScheduleGrid />
      </div>
    </div>
  )
}
