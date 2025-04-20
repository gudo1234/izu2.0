import Starlights from "@StarlightsTeam/Scraper"

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const isQuery = command === 'ytsearch' || command === 'yts'

  // Si es búsqueda
  if (isQuery) {
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
      txt += '*Audio* ➠ Responde a este mensaje escribiendo `a número`\n'
      txt += '*Video* ➠ Responde a este mensaje escribiendo `v número`\n'
      txt += '*Documento* ➠ Responde con `d número tipo`\n'
      txt += '*Ejemplo:* `d 1 audio`\n'

      const sent = await conn.sendFile(m.chat, img, 'thumb.jpg', txt, m)

      conn.ytsearch = conn.ytsearch || {}
      conn.ytsearch[m.chat] = {
        id: sent.key.id,
        results
      }

      await m.react('✅')
    } catch (e) {
      console.error(e)
      await m.react('✖️')
      m.reply('Error al realizar la búsqueda.')
    }
  }

  // Si es respuesta tipo `a 1`, `v 2`, `d 3 audio`
  if (/^(a|v|d)\s+\d+(\s+\w+)?$/i.test(text)) {
    const args = text.trim().split(/\s+/)
    const tipo = args[0].toLowerCase()
    const index = parseInt(args[1]) - 1
    const formato = args[2]?.toLowerCase()

    const data = conn.ytsearch?.[m.chat]
    if (!data || !m.quoted || m.quoted.id !== data.id) return

    const video = data.results[index]
    if (!video) return m.reply('Número inválido.')

    let cmd = ''
    if (tipo === 'a') cmd = `.play ${video.url}`
    else if (tipo === 'v') cmd = `.play2 ${video.url}`
    else if (tipo === 'd') {
      if (!formato) return m.reply('Falta el tipo: audio o video.')
      cmd = `.play4 ${video.url} ${formato}`
    } else return

    m.text = cmd
    conn.handleMessage(m, m)
  }
}

handler.customPrefix = /^(ytsearch|yts|a\s+\d+|v\s+\d+|d\s+\d+(\s+\w+)?)$/i
handler.command = new RegExp
export default handler
