import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function saveInbound(phone: string, body: string, msgType = 'text', yCloudMsgId?: string) {
  const row: any = { phone, direction: 'inbound', body, msg_type: msgType, is_bot: false }
  if (yCloudMsgId) row.ycloud_msg_id = yCloudMsgId
  const { error } = await db().from('crm_messages').upsert(row, { onConflict: 'ycloud_msg_id', ignoreDuplicates: true })
  if (error) console.error('[crm] saveInbound error:', error.message)
}

export async function saveOutbound(phone: string, body: string, isBot = true) {
  const { error } = await db().from('crm_messages').insert({ phone, direction: 'outbound', body, msg_type: 'text', is_bot: isBot })
  if (error) console.error('[crm] saveOutbound error:', error.message)
}
