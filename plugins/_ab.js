import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'

const zonas = {
  MX: 'America/Mexico_City',
  CO: 'America/Bogota',
  AR: 'America/Argentina/Buenos_Aires',
  CL: 'America/Santiago',
  VE: 'America/Caracas',
  PE: 'America/Lima',
  EC: 'America/Guayaquil',
  BO: 'America/La_Paz',
  PY: 'America/Asuncion',
  UY: 'America/Montevideo',
  DO: 'America/Santo_Domingo',
  GT: 'America/Guatemala',
  HN: 'America/Tegucigalpa',
  NI: 'America/Managua',
  CR: 'America/Costa_Rica',
  SV: 'America/El_Salvador',
  PA: 'America/Panama',
  US: 'America/New_York',
  ES: 'Europe/Madrid',
  BR: 'America/Sao_Paulo',
  CU: 'America/Havana',
  PR: 'America/Puerto_Rico',
  HT: 'America/Port-au-Prince',
  CA: 'America/Toronto',
}

let handler = async (m, { conn }) => {
  let sender = m.key?.jid || m.key?.participant || m.key?.remoteJid || (m.key?.fromMe && conn.user?.jid) || m.chat || ''

  // Bypass del @lid
  if (sender?.endsWith('@lid')) {
    const match = (await conn.groupMetadata?.(m.chat).catch(() => null))?.participants?.find(p => p.id === sender && p.jid)
    if (match) sender = match.jid
  }

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

  // Selección de zona horaria según el país
  const timezone = zonas[region] || 'America/Tegucigalpa'
  const date = new Date().toLocaleDateString('es-HN', { timeZone: timezone })
  const time = new Date().toLocaleTimeString('es-HN', { timeZone: timezone })

  // Mensaje final con mención
  const info = `
🌍 *Ubicación del usuario*
────────────────────
👤 *Número real:* +${realNum}
🏷️ *Mención:* @${realNum}
🏳️ *País:* ${countryName} ${flag}
🕒 *Hora local:* ${time}
📅 *Fecha:* ${date}
🧭 *Zona horaria:* ${timezone}
`.trim()

  await conn.reply(m.chat, info, m, { mentions: [sender] })
}

handler.command = ['lid']
export default handler
