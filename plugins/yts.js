import Starlights from "@StarlightsTeam/Scraper"

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`Ejemplo: ${usedPrefix + command} Ricardo Arjona`)

  await m.react('🕓')
  try {
    const results = await Starlights.ytsearch(text)
    if (!results || !results.length) return m.reply('No se encontraron resultados.')

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

    // Guardar resultados para respuestas
    conn.ytsearch = conn.ytsearch || {}
    conn.ytsearch[m.chat] = results

    await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m)
    await m.react('✅')
  } catch (err) {
    console.error(err)
    await m.react('✖️')
    m.reply('Ocurrió un error al buscar en YouTube.')
  }
}

handler.command = ['ytsearch', 'yts']
handler.group = true
export default handler
