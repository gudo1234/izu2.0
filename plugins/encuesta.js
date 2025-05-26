let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!args[0]) {
    throw `⚠️️ *_Ingrese un texto para iniciar la encuesta._*\n\n📌 Ejemplo:\n*${usedPrefix + command}* opción1|opción2|opción3`
  }

  if (!text.includes('|')) {
    throw `⚠️️ Separe las opciones con *|*\n\n📌 Ejemplo:\n*${usedPrefix + command}* opción1|opción2|opción3`
  }

  let opciones = text.split('|').map(opcion => [opcion.trim()])

  return conn.sendPoll(m.chat, `Encuesta:`, opciones, m)
}

handler.command = ['poll', 'encuesta']
handler.group = true

export default handler
