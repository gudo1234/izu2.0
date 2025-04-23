import moment from 'moment-timezone'
let handler = async (m, { conn }) => {
  // Obtener la fecha con formato "miércoles 23 de abril del 2025"
  let fecha = moment.tz('America/Mexico_City').format('dddd D [de] MMMM [del] YYYY')

  // Contar chats privados y grupos
  let chats = Object.values(conn.chats).filter(c => c.id)
  let chatsPrivados = chats.filter(c => !c.id.endsWith('@g.us')).length
  let grupos = chats.filter(c => c.id.endsWith('@g.us')).length

  // Calcular uptime
  let tiempoActivoMs = process.uptime() * 1000
  let tiempoActivo = clockString(tiempoActivoMs)

  conn.reply(m.chat, `╭━━〔 *Información del Bot* 〕━━
┃
┃  *Chats privados:* ${chatsPrivados}
┃  *Grupos unidos:* ${grupos}
┃  *Bot activo hace:* ${tiempoActivo}
┃  *Fecha:* ${fecha}
┃
╰━━━━━━━━━━━━━━━━━━━`, m)
}

handler.command = ['infobot']
handler.group = true
export default handler

// Función para mostrar tiempo en formato HH:MM:SS
function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
