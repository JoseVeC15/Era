'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

interface Conversation {
  phone: string
  name: string | null
  last_body: string
  last_dir: 'inbound' | 'outbound'
  last_time: string
  unread_count: number
  bot_paused: boolean
}

interface Message {
  id: string
  direction: 'inbound' | 'outbound'
  body: string
  msg_type: string
  is_bot: boolean
  read_by_owner: boolean
  created_at: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
}

function formatMsgDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PY', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function CRMPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activePhone, setActivePhone] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [search, setSearch] = useState('')
  const [togglingBot, setTogglingBot] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchConversations = useCallback(async () => {
    const res = await fetch('/api/crm/conversations')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setConversations(Array.isArray(data) ? data : [])
    setLoadingConvs(false)
  }, [router])

  const fetchMessages = useCallback(async (phone: string) => {
    setLoadingMsgs(true)
    const res = await fetch(`/api/crm/messages?phone=${encodeURIComponent(phone)}`)
    const data = await res.json()
    setMessages(Array.isArray(data) ? data : [])
    setLoadingMsgs(false)
    // Mark as read
    await fetch(`/api/crm/messages?phone=${encodeURIComponent(phone)}`, { method: 'PATCH' })
    setConversations(prev => prev.map(c => c.phone === phone ? { ...c, unread_count: 0 } : c))
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  useEffect(() => {
    if (activePhone) fetchMessages(activePhone)
  }, [activePhone, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime: nuevos mensajes entrantes
  useEffect(() => {
    const channel = supabase
      .channel('crm_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'crm_messages' }, (payload) => {
        const msg = payload.new as Message & { phone: string }
        // Update conversations list
        setConversations(prev => {
          const existing = prev.find(c => c.phone === msg.phone)
          const updated = {
            phone: msg.phone,
            name: existing?.name ?? null,
            last_body: msg.body,
            last_dir: msg.direction,
            last_time: msg.created_at,
            unread_count: msg.direction === 'inbound' && msg.phone !== activePhone
              ? (existing?.unread_count ?? 0) + 1
              : (existing?.unread_count ?? 0),
            bot_paused: existing?.bot_paused ?? false,
          }
          const others = prev.filter(c => c.phone !== msg.phone)
          return [updated, ...others]
        })
        // If active chat, append message
        if (msg.phone === activePhone) {
          setMessages(prev => [...prev, msg])
          // Mark as read immediately
          fetch(`/api/crm/messages?phone=${encodeURIComponent(msg.phone)}`, { method: 'PATCH' })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activePhone, supabase])

  async function toggleBot(pause: boolean) {
    if (!activePhone) return
    setTogglingBot(true)
    if (pause) {
      await fetch('/api/crm/bot-pause', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: activePhone }) })
    } else {
      await fetch(`/api/crm/bot-pause?phone=${encodeURIComponent(activePhone)}`, { method: 'DELETE' })
    }
    setConversations(prev => prev.map(c => c.phone === activePhone ? { ...c, bot_paused: pause } : c))
    setTogglingBot(false)
  }

  async function sendMessage() {
    if (!activePhone || !input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)

    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      direction: 'outbound',
      body: text,
      msg_type: 'text',
      is_bot: false,
      read_by_owner: true,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    const res = await fetch('/api/crm/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: activePhone, body: text }),
    })
    setSending(false)
    if (!res.ok) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInput(text)
    }
  }

  const activeConv = conversations.find(c => c.phone === activePhone)
  const filtered = conversations.filter(c =>
    !search || c.phone.includes(search) || (c.name?.toLowerCase().includes(search.toLowerCase()))
  )

  // Group messages by date
  const groupedMsgs: { date: string; msgs: Message[] }[] = []
  for (const msg of messages) {
    const date = formatMsgDate(msg.created_at)
    const last = groupedMsgs[groupedMsgs.length - 1]
    if (last?.date === date) last.msgs.push(msg)
    else groupedMsgs.push({ date, msgs: [msg] })
  }

  return (
    <div className="admin-layout">
      <AdminNav />

      <div className="crm-layout">
        {/* ── Sidebar: lista de conversaciones ── */}
        <aside className="crm-sidebar">
          <div className="crm-sidebar-head">
            <h2>Conversaciones</h2>
            <input
              className="crm-search"
              placeholder="Buscar por nombre o teléfono..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="crm-conv-list">
            {loadingConvs && <p className="crm-empty">Cargando...</p>}
            {!loadingConvs && filtered.length === 0 && (
              <p className="crm-empty">No hay conversaciones aún.</p>
            )}
            {filtered.map(conv => (
              <div
                key={conv.phone}
                className={`crm-conv-item${activePhone === conv.phone ? ' active' : ''}${conv.unread_count > 0 ? ' unread' : ''}`}
                onClick={() => setActivePhone(conv.phone)}
              >
                <div className="crm-conv-avatar">
                  {(conv.name ?? conv.phone).slice(0, 1).toUpperCase()}
                </div>
                <div className="crm-conv-info">
                  <div className="crm-conv-top">
                    <span className="crm-conv-name">{conv.name ?? conv.phone}</span>
                    <span className="crm-conv-time">{timeAgo(conv.last_time)}</span>
                  </div>
                  <div className="crm-conv-bottom">
                    <span className="crm-conv-preview">
                      {conv.last_dir === 'outbound' ? '↗ ' : ''}{conv.last_body?.slice(0, 40)}{(conv.last_body?.length ?? 0) > 40 ? '…' : ''}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      {conv.bot_paused && <span className="crm-bot-off-dot" title="Bot pausado" />}
                      {conv.unread_count > 0 && (
                        <span className="crm-unread-badge">{conv.unread_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Panel de chat ── */}
        <main className="crm-chat">
          {!activePhone ? (
            <div className="crm-chat-empty">
              <div className="crm-chat-empty-icon">💬</div>
              <p>Seleccioná una conversación</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="crm-chat-head">
                <div className="crm-conv-avatar" style={{ width: 38, height: 38, fontSize: '1rem', flexShrink: 0 }}>
                  {(activeConv?.name ?? activePhone).slice(0, 1).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="crm-chat-head-name">{activeConv?.name ?? activePhone}</div>
                  <div className="crm-chat-head-phone">{activePhone}</div>
                </div>
                {/* Bot status toggle */}
                {activeConv?.bot_paused ? (
                  <button
                    className="crm-bot-btn paused"
                    onClick={() => toggleBot(false)}
                    disabled={togglingBot}
                    title="Bot pausado — clic para reactivar"
                  >
                    🤖 Pausado — Reactivar
                  </button>
                ) : (
                  <button
                    className="crm-bot-btn active"
                    onClick={() => toggleBot(true)}
                    disabled={togglingBot}
                    title="Bot activo — clic para pausar"
                  >
                    🤖 Activo
                  </button>
                )}
                <a
                  href={`https://wa.me/${activePhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="crm-wa-link"
                  title="Abrir en WhatsApp"
                >
                  <i className="fab fa-whatsapp" />
                </a>
              </div>

              {/* Messages */}
              <div className="crm-messages">
                {loadingMsgs && <p className="crm-empty" style={{ padding: '2rem' }}>Cargando mensajes...</p>}
                {!loadingMsgs && messages.length === 0 && (
                  <p className="crm-empty" style={{ padding: '2rem' }}>Sin mensajes.</p>
                )}
                {groupedMsgs.map(({ date, msgs }) => (
                  <div key={date}>
                    <div className="crm-date-divider"><span>{date}</span></div>
                    {msgs.map(msg => (
                      <div key={msg.id} className={`crm-bubble-wrap ${msg.direction}`}>
                        <div className={`crm-bubble ${msg.direction}${msg.is_bot && msg.direction === 'outbound' ? ' bot' : ''}`}>
                          {msg.body}
                          <div className="crm-bubble-meta">
                            {formatMsgTime(msg.created_at)}
                            {msg.direction === 'outbound' && (
                              <span className="crm-bubble-sender">{msg.is_bot ? ' · 🤖 Bot' : ' · 👤 Vos'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="crm-input-bar">
                <textarea
                  className="crm-input"
                  placeholder="Escribí un mensaje..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
                  }}
                  rows={1}
                />
                <button
                  className="crm-send-btn"
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                >
                  {sending ? '...' : '➤'}
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
