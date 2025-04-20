import Starlights from "@StarlightsTeam/Scraper"

let handler = async (m, { conn, usedPrefix, command, text }) => {
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
    txt += '*Ejemplo:* `a 1`\n\n'
    txt += '*Video* ➠ Responde a este mensaje escribiendo `v número`\n'
    txt += '*Ejemplo:* `v 1`\n\n'
    txt += '*Documento* ➠ Responde con `d número tipo`\n'
    txt += '*Ejemplo:* `d 1 audio`\n'

    // Enviar mensaje y guardar resultados por ID del mensaje
    const sent = await conn.sendFile(m.chat, img, 'thumb.jpg', txt, m)
    conn.ytsearch = conn.ytsearch || {}
    conn.ytsearch[sent.key.id] = results

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('✖️')
    m.reply('Error al realizar la búsqueda.')
  }
}

handler.command = ['ytsearch', 'yts']
handler.group = true
export default handler
