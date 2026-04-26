import LogoutButton from './LogoutButton'

export default function AdminNav() {
  return (
    <nav className="admin-nav">
      <span className="logo-text">💅 Era Nails & Hair — Admin</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <a href="/admin/schedule" className="admin-nav-link">Turnos</a>
        <a href="/admin/reservas" className="admin-nav-link">Reservas</a>
        <a href="/" style={{ opacity: 0.6, fontSize: '0.85rem' }}>← Sitio</a>
        <LogoutButton />
      </div>
    </nav>
  )
}
