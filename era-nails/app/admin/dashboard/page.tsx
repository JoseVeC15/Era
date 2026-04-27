'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

interface Stats {
  awaiting_review: number
  today:     { total: number; confirmed: number }
  week:      { total: number; completed: number; cancelled: number; no_show: number }
  all_time:  { total: number; completed: number }
  top_services: Array<{ name: string; count: number }>
}

function StatCard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.2rem' }}>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: '0 0 0.25rem', fontSize: '2.2rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
      <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.45 }}>{sub}</p>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => { if (r.status === 401) { router.push('/admin/login'); return null } return r.json() })
      .then(data => { if (data) setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [router])

  return (
    <div className="admin-layout">
      <AdminNav />
      <div className="admin-content">
        <div className="schedule-header">
          <h1>Dashboard</h1>
        </div>

        {loading && <p className="loading-msg">Cargando métricas...</p>}

        {stats && (
          <>
            {stats.awaiting_review > 0 && (
              <div style={{ background: 'rgba(90,180,255,0.1)', border: '1px solid rgba(90,180,255,0.3)', borderRadius: '10px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>💳</span>
                <div>
                  <strong style={{ color: '#5ab4ff' }}>
                    {stats.awaiting_review} seña{stats.awaiting_review > 1 ? 's' : ''} recibida{stats.awaiting_review > 1 ? 's' : ''}
                  </strong>
                  <span style={{ opacity: 0.7, marginLeft: '0.5rem', fontSize: '0.9rem' }}>pendiente{stats.awaiting_review > 1 ? 's' : ''} de confirmar</span>
                </div>
                <a href="/admin/reservas" style={{ marginLeft: 'auto', color: '#5ab4ff', fontSize: '0.85rem', textDecoration: 'none' }}>Ver reservas →</a>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard label="Hoy"             value={stats.today.total}       sub={`${stats.today.confirmed} confirmados`}    color="var(--primary)" />
              <StatCard label="Últimos 7 días"  value={stats.week.total}        sub={`${stats.week.completed} completados`}     color="#6bcf8e" />
              <StatCard label="Cancelaciones"   value={stats.week.cancelled}    sub="últimos 7 días"                            color="#ff6b6b" />
              <StatCard label="No asistieron"   value={stats.week.no_show}      sub="últimos 7 días"                            color="rgba(255,200,220,0.7)" />
              <StatCard label="Total historico" value={stats.all_time.total}    sub={`${stats.all_time.completed} completados`} color="var(--accent)" />
            </div>

            {stats.top_services.length > 0 && (
              <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.2rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Servicios más pedidos</h3>
                {stats.top_services.map((s, i) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0', borderBottom: i < stats.top_services.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                    <span style={{ opacity: 0.35, width: '1.5rem', textAlign: 'right', fontSize: '0.8rem' }}>#{i + 1}</span>
                    <span style={{ flex: 1, fontSize: '0.9rem' }}>{s.name}</span>
                    <span style={{ background: 'rgba(183,110,121,0.15)', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--primary)' }}>{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
