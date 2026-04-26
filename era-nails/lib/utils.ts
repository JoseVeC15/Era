export function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${ampm}`
}

export function formatDate(date: string): string {
  const d = new Date(date + 'T12:00:00')
  return d.toLocaleDateString('es-PY', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

export function buildWhatsAppURL(date: string, startTime: string, endTime: string): string {
  const dateStr = formatDate(date)
  const start = formatTime(startTime)
  const end = formatTime(endTime)
  const text = `Hola! Quiero reservar el turno del ${dateStr} de ${start} a ${end}. Entiendo que se requiere una seña de ₲50.000 para confirmar la reserva.`
  return `https://wa.me/595984704144?text=${encodeURIComponent(text)}`
}

export function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + hours * 60
  const newH = Math.floor(total / 60) % 24
  const newM = total % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function slotDurationLabel(startTime: string, endTime: string): string {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  const mins = end - start
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (m === 0) return `${h} hora${h !== 1 ? 's' : ''}`
  return `${h}h ${m}min`
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
