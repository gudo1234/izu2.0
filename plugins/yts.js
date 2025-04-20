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
    txt += '*Video* ➠ Responde con `v número`\n'
    txt += '*Documento* ➠ Responde con `d número tipo`\n'

    const sentMsg = await conn.sendFile(m.chat, img, 'yt.jpg', txt, m)
    conn.ytsearch = conn.ytsearch || {}
    conn.ytsearch[m.chat] = conn.ytsearch[m.chat] || {}
    conn.ytsearch[m.chat][sentMsg.key.id] = results

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('Ocurrió un error.')
  }
}

handler.command = ['ytsearch', 'yts']
export default handler
