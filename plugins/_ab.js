import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  // Detecta correctamente el número del usuario
  const sender = m.sender || m.key.participant || m.key.remoteJid
  const realNum = sender.split('@')[0].replace(/\D/g, '')

  // Detectar país a partir del prefijo telefónico
  const pn = PhoneNumber(`+${realNum}`)
  const region = pn.getRegionCode() || 'Desconocido'
  let countryName = ''
  let flag = ''

  try {
    const displayNames = new Intl.DisplayNames(['es'], { type: 'region' })
    countryName = displayNames.of(region) || 'Desconocido'
    flag = [...region.toUpperCase()].map(c => 
      String.fromCodePoint(127397 + c.charCodeAt())
    ).join('')
  } catch {
    countryName = 'Desconocido'
  }

  // Obtener zona horaria real usando IP (mejor precisión)
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

  // Crear mensaje
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
