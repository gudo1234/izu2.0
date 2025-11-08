import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
import fetch from 'node-fetch'
import 'moment/locale/es.js'

let handler = async (m, { conn }) => {
  try {
    // --- DETECCIÓN REAL DE NÚMERO, PAÍS, BANDERA, HORA Y FECHA ---
    let id = m.sender.replace(/@s\.whatsapp\.net$/, '')

    // 🔸 Burla el LID: si el número contiene letras o formato inusual, intenta obtener el real del remoteJid
    if (!/^\d+$/.test(id) && m.key?.remoteJid)
      id = m.key.remoteJid.replace(/@s\.whatsapp\.net$/, '')

    // Crear objeto PhoneNumber
    let numero = new PhoneNumber('+' + id)
    let pais = numero.getRegionCode()
    let nombrePais = pais
      ? new Intl.DisplayNames(['es'], { type: 'region' }).of(pais)
      : 'Desconocido'
    let bandera = pais
      ? String.fromCodePoint(...[...pais].map(c => 127397 + c.charCodeAt()))
      : '🏳️'

    // Posibles zonas horarias por país
    const zonas = {
      MX: 'America/Mexico_City', CO: 'America/Bogota', AR: 'America/Argentina/Buenos_Aires',
      CL: 'America/Santiago', VE: 'America/Caracas', PE: 'America/Lima', EC: 'America/Guayaquil',
      BO: 'America/La_Paz', PY: 'America/Asuncion', UY: 'America/Montevideo', DO: 'America/Santo_Domingo',
      GT: 'America/Guatemala', HN: 'America/Tegucigalpa', NI: 'America/Managua', CR: 'America/Costa_Rica',
      SV: 'America/El_Salvador', PA: 'America/Panama', US: 'America/New_York', ES: 'Europe/Madrid',
      BR: 'America/Sao_Paulo', CU: 'America/Havana', PR: 'America/Puerto_Rico', HT: 'America/Port-au-Prince',
      CA: 'America/Toronto'
    }

    // Detectar zona horaria
    let zona = zonas[pais] || 'UTC'
    try {
      if (zona === 'UTC') {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        zona = data.timezone || 'UTC'
        if (nombrePais === 'Desconocido') {
          nombrePais = data.country_name
          bandera = data.country_code
            ? String.fromCodePoint(...[...data.country_code.toUpperCase()].map(c => 127397 + c.charCodeAt()))
            : '🏳️'
        }
      }
    } catch {}

    // Obtener hora y fecha local
    let fecha = moment().tz(zona).format('dddd, D [de] MMMM [de] YYYY')
    let hora = moment().tz(zona).format('hh:mm:ss A')

    // Construir mensaje final
    let infoGeo = `🌎 *Ubicación del usuario*\n\n` +
      `👤 *Número real:* +${id}\n` +
      `🏳️ *País:* ${nombrePais} ${bandera}\n` +
      `🕒 *Hora local:* ${hora}\n` +
      `🗓️ *Fecha:* ${fecha}\n` +
      `🧭 *Zona horaria:* ${zona}`

    await conn.reply(m.chat, infoGeo, m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Error al obtener la información del número.')
  }
}

handler.command = ['lid']
export default handler
