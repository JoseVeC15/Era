'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }
  return (
    <button
      onClick={logout}
      style={{ background: 'none', border: '1px solid rgba(183,110,121,0.4)', color: 'var(--quartz)', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
    >
      Salir
    </button>
  )
}
