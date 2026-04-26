'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PaymentMethod {
  id: string
  type: 'bank_transfer' | 'oca_mobile' | 'alias'
  is_active: boolean
  bank_name: string | null
  account_number: string | null
  account_holder: string | null
  mobile_number: string | null
  alias: string | null
}

const DEFAULTS: Record<string, PaymentMethod> = {
  bank_transfer: { id: '', type: 'bank_transfer', is_active: false, bank_name: '', account_number: '', account_holder: '', mobile_number: null, alias: null },
  oca_mobile:    { id: '', type: 'oca_mobile',    is_active: false, bank_name: null, account_number: null, account_holder: null, mobile_number: '', alias: null },
  alias:         { id: '', type: 'alias',          is_active: false, bank_name: null, account_number: null, account_holder: null, mobile_number: null, alias: '' },
}

export default function PagosPage() {
  const router = useRouter()
  const [methods, setMethods] = useState<Record<string, PaymentMethod>>({ ...DEFAULTS })
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved]   = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/payment-methods')
      .then(r => r.json())
      .then((data: any) => {
        if (!Array.isArray(data)) { router.push('/admin/login'); return }
        const map: Record<string, PaymentMethod> = { ...DEFAULTS }
        data.forEach((m: PaymentMethod) => {
          map[m.type] = {
            ...DEFAULTS[m.type],
            ...m,
            bank_name:      m.bank_name      ?? '',
            account_number: m.account_number ?? '',
            account_holder: m.account_holder ?? '',
            mobile_number:  m.mobile_number  ?? '',
            alias:          m.alias          ?? '',
          }
        })
        setMethods(map)
        setLoading(false)
      })
  }, [router])

  function update(type: string, field: string, value: any) {
    setMethods(prev => ({ ...prev, [type]: { ...prev[type], [field]: value } }))
    setSaved(prev => ({ ...prev, [type]: false }))
  }

  async function save(type: string) {
    setSaving(prev => ({ ...prev, [type]: true }))
    const res = await fetch('/api/payment-methods', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(methods[type]),
    })
    setSaving(prev => ({ ...prev, [type]: false }))
    if (res.ok) {
      setSaved(prev => ({ ...prev, [type]: true }))
      setTimeout(() => setSaved(prev => ({ ...prev, [type]: false })), 3000)
    }
  }

  if (loading) return <div className="admin-layout"><div className="admin-content"><p className="loading-msg">Cargando...</p></div></div>

  const bt = methods.bank_transfer
  const oca = methods.oca_mobile
  const al = methods.alias

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <span className="logo-text">💅 Era Nails & Hair — Admin</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="/admin/schedule" className="admin-nav-link">Turnos</a>
          <a href="/admin/reservas" className="admin-nav-link">Reservas</a>
          <a href="/admin/horarios" className="admin-nav-link">Horarios</a>
          <a href="/admin/pagos" className="admin-nav-link active">Pagos</a>
          <a href="/admin/crm" className="admin-nav-link">CRM</a>
          <a href="/" style={{ opacity: 0.6, fontSize: '0.85rem' }}>← Sitio</a>
        </div>
      </nav>

      <div className="admin-content">
        <div className="schedule-header">
          <h1>Métodos de Pago</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            El bot usa estos datos para informar a los clientes cómo enviar la seña y para validar los comprobantes recibidos.
          </p>
        </div>

        {/* ── Transferencia bancaria ── */}
        <div className="horarios-card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 className="horarios-section-title" style={{ margin: 0 }}>🏦 Transferencia bancaria</h2>
              <p className="horarios-hint" style={{ margin: '0.25rem 0 0' }}>Datos de la cuenta para recibir transferencias.</p>
            </div>
            <label className="horarios-toggle" style={{ flexShrink: 0 }}>
              <input type="checkbox" checked={bt.is_active} onChange={e => update('bank_transfer', 'is_active', e.target.checked)} />
              <span className="horarios-toggle-slider" />
            </label>
          </div>

          <div className="pagos-fields" style={{ opacity: bt.is_active ? 1 : 0.45, pointerEvents: bt.is_active ? 'auto' : 'none' }}>
            <div className="pagos-field">
              <label>Banco</label>
              <input type="text" className="horarios-time-input" style={{ width: '100%' }} placeholder="Ej: Banco Continental, Bancop..." value={bt.bank_name ?? ''} onChange={e => update('bank_transfer', 'bank_name', e.target.value)} />
            </div>
            <div className="pagos-field">
              <label>Número de cuenta</label>
              <input type="text" className="horarios-time-input" style={{ width: '100%' }} placeholder="Ej: 001-123456-7" value={bt.account_number ?? ''} onChange={e => update('bank_transfer', 'account_number', e.target.value)} />
            </div>
            <div className="pagos-field">
              <label>A nombre de</label>
              <input type="text" className="horarios-time-input" style={{ width: '100%' }} placeholder="Nombre del titular de la cuenta" value={bt.account_holder ?? ''} onChange={e => update('bank_transfer', 'account_holder', e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '0.65rem 1.75rem' }} onClick={() => save('bank_transfer')} disabled={saving.bank_transfer}>
              {saving.bank_transfer ? 'Guardando...' : 'Guardar'}
            </button>
            {saved.bank_transfer && <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>✓ Guardado</span>}
          </div>
        </div>

        {/* ── Móvil OCA ── */}
        <div className="horarios-card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 className="horarios-section-title" style={{ margin: 0 }}>📱 Móvil OCA</h2>
              <p className="horarios-hint" style={{ margin: '0.25rem 0 0' }}>Número para recibir pagos por OCA móvil.</p>
            </div>
            <label className="horarios-toggle" style={{ flexShrink: 0 }}>
              <input type="checkbox" checked={oca.is_active} onChange={e => update('oca_mobile', 'is_active', e.target.checked)} />
              <span className="horarios-toggle-slider" />
            </label>
          </div>

          <div className="pagos-fields" style={{ opacity: oca.is_active ? 1 : 0.45, pointerEvents: oca.is_active ? 'auto' : 'none' }}>
            <div className="pagos-field">
              <label>Número de celular</label>
              <input type="text" className="horarios-time-input" style={{ width: '100%' }} placeholder="Ej: 0984 123456" value={oca.mobile_number ?? ''} onChange={e => update('oca_mobile', 'mobile_number', e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '0.65rem 1.75rem' }} onClick={() => save('oca_mobile')} disabled={saving.oca_mobile}>
              {saving.oca_mobile ? 'Guardando...' : 'Guardar'}
            </button>
            {saved.oca_mobile && <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>✓ Guardado</span>}
          </div>
        </div>

        {/* ── Alias (próximamente) ── */}
        <div className="horarios-card" style={{ marginTop: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div className="pagos-coming-soon">Próximamente</div>
          <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h2 className="horarios-section-title" style={{ margin: 0 }}>🔗 Alias de cuenta</h2>
                <p className="horarios-hint" style={{ margin: '0.25rem 0 0' }}>Alias bancario para facilitar transferencias.</p>
              </div>
              <label className="horarios-toggle">
                <input type="checkbox" disabled checked={false} readOnly />
                <span className="horarios-toggle-slider" />
              </label>
            </div>
            <div className="pagos-fields">
              <div className="pagos-field">
                <label>Alias</label>
                <input type="text" className="horarios-time-input" style={{ width: '100%' }} placeholder="Ej: ERANAILS.PY" disabled />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
