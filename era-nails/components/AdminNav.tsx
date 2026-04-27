'use client'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

const LINKS = [
  { href: '/admin/dashboard',  label: 'Dashboard' },
  { href: '/admin/schedule',   label: 'Turnos' },
  { href: '/admin/reservas',   label: 'Reservas' },
  { href: '/admin/servicios',  label: 'Servicios' },
  { href: '/admin/horarios',   label: 'Horarios' },
  { href: '/admin/pagos',      label: 'Pagos' },
  { href: '/admin/clientes',   label: 'Clientes' },
  { href: '/admin/crm',        label: 'CRM' },
]

export default function AdminNav() {
  const path = usePathname()
  return (
    <nav className="admin-nav">
      <span className="logo-text">💅 Era Nails & Hair — Admin</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        {LINKS.map(l => (
          <a key={l.href} href={l.href} className={`admin-nav-link${path.startsWith(l.href) ? ' active' : ''}`}>
            {l.label}
          </a>
        ))}
        <a href="/" style={{ opacity: 0.6, fontSize: '0.85rem' }}>← Sitio</a>
        <LogoutButton />
      </div>
    </nav>
  )
}
