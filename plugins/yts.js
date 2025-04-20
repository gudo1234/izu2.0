import Starlights from "@StarlightsTeam/Scraper"

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`Ejemplo: ${usedPrefix + command} Ricardo Arjona`)
  await m.react('🕓')

  try {
    const results = await Starlights.ytsearch(text)
    if (!results?.length) return m.reply('No se encontraron resultados.')

    const img = await (await fetch(results[0].thumbnail)).buffer()
    let txt = '*乂  Y T  -  R E S U L T A D O S*\n\n'

    results.forEach((v, i) => {
      txt += `*${i + 1}.* ${v.title}\n`
      txt += `   Duración: ${v.duration}\n`
      txt += `   Autor: ${v.author}\n\n`
    })

    txt += '───────────────\n'
    txt += '*Audio* ➠ `a número`\n'
    txt += '*Video* ➠ `v número`\n'
    txt += '*Documento* ➠ `d número tipo`\n'
    txt += '───────────────'

    const msg = await conn.sendFile(m.chat, img, 'yt.jpg', txt.trim(), m)
    
    // Guardar resultados
    conn.ytsearch = conn.ytsearch || {}
    conn.ytsearch[m.chat] = {
      key: msg.key.id,
      results
    }

    await m.react('✅')
  } catch (err) {
    console.error(err)
    m.reply('Ocurrió un error buscando.')
    await m.react('❌')
  }
}

handler.command = ['ytsearch', 'yts']
export default handler
