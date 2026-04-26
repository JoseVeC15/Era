import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminScheduleGrid from '@/components/AdminScheduleGrid'
import LogoutButton from '@/components/LogoutButton'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <span className="logo-text">💅 Era Nails & Hair — Admin</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="/admin/schedule" className="admin-nav-link active">Turnos</a>
          <a href="/admin/reservas" className="admin-nav-link">Reservas</a>
          <a href="/admin/horarios" className="admin-nav-link">Horarios</a>
          <a href="/admin/pagos" className="admin-nav-link">Pagos</a>
          <a href="/admin/crm" className="admin-nav-link">CRM</a>
          <a href="/" style={{ opacity: 0.6, fontSize: '0.85rem' }}>← Sitio</a>
          <LogoutButton />
        </div>
      </nav>
      <div className="admin-content">
        <AdminScheduleGrid />
      </div>
    </div>
  )
}
