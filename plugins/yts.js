import Starlights from "@StarlightsTeam/Scraper"

let handler = async (m, { conn, usedPrefix, command, text }) => {
  conn.ytsearch = conn.ytsearch || {}

  // Si es comando de búsqueda
  if (command === 'ytsearch' || command === 'yts') {
    if (!text) return m.reply(`Ejemplo: ${usedPrefix + command} Ricardo Arjona`)
    await m.react('🕓')

    try {
      const results = await Starlights.ytsearch(text)
      if (!results?.length) return m.reply('No se encontraron resultados.')

      const img = await (await fetch(results[0].thumbnail)).buffer()
      let txt = '*乂  Y T  -  S E A R C H*\n\n'

      results.forEach((video, index) => {
        txt += `*${index + 1}.* ${video.title}\n`
        txt += `   • Duración: ${video.duration}\n`
        txt += `   • Publicado: ${video.published}\n`
        txt += `   • Autor: ${video.author}\n\n`
      })

      txt += '───────────────\n'
      txt += '*Audio* ➠ Responde a este mensaje con `a número`\n'
      txt += '*Video* ➠ Responde a este mensaje con `v número`\n'
      txt += '*Documento* ➠ Responde a este mensaje con `d número tipo`\n'
      txt += '*Ejemplo:* `d 1 audio`\n'

      const sentMsg = await conn.sendFile(m.chat, img, 'thumb.jpg', txt.trim(), m)

      conn.ytsearch[m.chat] = {
        results,
        msgId: sentMsg.key.id
      }

      await m.react('✅')
    } catch (e) {
      console.error(e)
      await m.react('❌')
      m.reply('Ocurrió un error al realizar la búsqueda.')
    }
    return
  }

  // Si es respuesta como: a 1 | v 2 | d 1 audio
  if (/^(a|v|d)\s+\d+(\s+\w+)?$/i.test(text)) {
    const args = text.trim().split(/\s+/)
    const tipo = args[0].toLowerCase()
    const index = parseInt(args[1]) - 1
    const extra = args[2]?.toLowerCase()

    const ref = conn.ytsearch[m.chat]
    if (!ref || !ref.results || !m.quoted || m.quoted.id !== ref.msgId) {
      return m.reply('No se reconoció el mensaje de referencia o ya expiró.')
    }

    const video = ref.results[index]
    if (!video) return m.reply('Número inválido.')

    let finalCommand = ''
    if (tipo === 'a') finalCommand = `.play ${video.url}`
    else if (tipo === 'v') finalCommand = `.play2 ${video.url}`
    else if (tipo === 'd') {
      if (!extra) return m.reply('Debes especificar el tipo: audio o video.\nEjemplo: d 1 audio')
      finalCommand = `.play4 ${video.url} ${extra}`
    }

    m.text = finalCommand
    return conn.handleMessage(m, m)
  }
}

handler.command = ['ytsearch', 'yts']
handler.customPrefix = /^(a|v|d)\s+\d+(\s+\w+)?$/i
handler.group = true
handler.register = false
export default handler
