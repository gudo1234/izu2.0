import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let sender = m.key?.jid || m.key?.participant || m.key?.remoteJid || (m.key?.fromMe && conn.user?.jid) || m.chat || ''
  let response = {}

  // Bypass del @lid
  if (sender?.endsWith('@lid')) {
    const match = (await conn.groupMetadata?.(m.chat).catch(() => null))?.participants?.find(p => p.id === sender && p.jid)
    if (match) sender = match.jid
  }
  response.sender = sender

  // Extrae número real
  const realNum = sender.split('@')[0].replace(/\D/g, '')
  const pn = PhoneNumber(`+${realNum}`)
  const region = pn.getRegionCode() || 'Desconocido'

  // Nombre del país y bandera
  let countryName = ''
  let flag = ''
  try {
    const displayNames = new Intl.DisplayNames(['es'], { type: 'region' })
    countryName = displayNames.of(region) || 'Desconocido'
    flag = [...region.toUpperCase()].map(c => String.fromCodePoint(127397 + c.charCodeAt())).join('')
  } catch {
    countryName = 'Desconocido'
  }

  // Localización por IP (fallback)
  let locationData = {}
  try {
    const res = await fetch('https://ipapi.co/json/')
    locationData = await res.json()
  } catch {
    locationData = {}
  }

  const timezone = locationData.timezone || 'America/Tegucigalpa'
  const date = new Date().toLocaleDateString('es-HN', { timeZone: timezone })
  const time = new Date().toLocaleTimeString('es-HN', { timeZone: timezone })

  // Mensaje final
  const info = `
🌍 *Ubicación del usuario*
────────────────────
👤 *Número real:* +${realNum}
🏳️ *País:* ${countryName} ${flag}
🕒 *Hora local:* ${time}
📅 *Fecha:* ${date}
🧭 *Zona horaria:* ${timezone}
`.trim()

  await conn.reply(m.chat, info, m)
}

handler.command = ['lid']
export default handler
