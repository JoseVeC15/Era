import { describe, it, expect } from 'vitest'
import { formatTime, slotDurationLabel, buildWhatsAppURL, timeToMinutes } from '../utils'

describe('formatTime', () => {
  it('formats morning time as AM', () => {
    expect(formatTime('09:30')).toBe('9:30 AM')
  })
  it('formats afternoon time as PM', () => {
    expect(formatTime('14:00')).toBe('2:00 PM')
  })
  it('formats noon as PM', () => {
    expect(formatTime('12:00')).toBe('12:00 PM')
  })
  it('formats midnight as AM', () => {
    expect(formatTime('00:00')).toBe('12:00 AM')
  })
})

describe('slotDurationLabel', () => {
  it('returns singular hour', () => {
    expect(slotDurationLabel('09:00', '10:00')).toBe('1 hora')
  })
  it('returns plural hours', () => {
    expect(slotDurationLabel('09:00', '11:00')).toBe('2 horas')
  })
  it('returns hours and minutes', () => {
    expect(slotDurationLabel('09:00', '10:30')).toBe('1h 30min')
  })
  it('returns zero hours with minutes', () => {
    expect(slotDurationLabel('09:00', '09:45')).toBe('0h 45min')
  })
})

describe('timeToMinutes', () => {
  it('converts 00:00 to 0', () => {
    expect(timeToMinutes('00:00')).toBe(0)
  })
  it('converts 01:30 to 90', () => {
    expect(timeToMinutes('01:30')).toBe(90)
  })
  it('converts 14:00 to 840', () => {
    expect(timeToMinutes('14:00')).toBe(840)
  })
})

describe('buildWhatsAppURL', () => {
  it('targets the correct phone number', () => {
    const url = buildWhatsAppURL('2025-06-15', '10:00', '11:00')
    expect(url).toContain('wa.me/595984704144')
  })
  it('includes encoded text param', () => {
    const url = buildWhatsAppURL('2025-06-15', '10:00', '11:00')
    expect(url).toContain('?text=')
  })
  it('mentions the deposit amount', () => {
    const url = buildWhatsAppURL('2025-06-15', '10:00', '11:00')
    expect(decodeURIComponent(url)).toContain('50.000')
  })
})
