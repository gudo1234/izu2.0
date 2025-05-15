import Starlights from '@StarlightsTeam/Scraper'
import fetch from 'node-fetch'

let tempSpotifyResults = {}

let handler = async (m, { conn, command, args, usedPrefix }) => {
  let text = args.join(' ')
  if (!text) return m.reply(`✳️ Ingresa el título de una canción o artista en Spotify.\n\n*Ejemplo:* ${usedPrefix + command} The Weeknd`)

  await m.react('🕓')

  try {
    const results = await Starlights.spotifySearch(text)
    if (!results || !results.length) return m.reply('❌ No se encontraron resultados.')

    let caption = `╭───── • ─────╮
✩ \`Spotify Search \` ✩

🔍 *Consulta:* ${text}
🎧 *Resultados:* ${results.length}
╰───── • ─────╯

📌 *¿Cómo descargar?*
${e} Cada resultado tiene un número (#1, #2, #3...).  
Responde a este mensaje usando ese número para elegir qué descargar:

━━━━━━━━━━━━━
✦ \`s 1\` o \`descargar 1\` → Audio  
✦ \`doc 1\` o \`documento 1\` → Audio como documento  
━━━━━━━━━━━━━`

    for (let i = 0; i < results.length; i++) {
      caption += `\n\n*#${i + 1}.* _${results[i].title}_  
👤 ${results[i].artist}  
🔗 ${results[i].url}\n_______________`
    }

    const thumb = await (await fetch(results[0].thumbnail)).buffer()

    const sentMsg = await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: wm,
          body: textbot,
          thumbnailUrl: redes,
          thumbnail: thumb,
          sourceUrl: redes,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    tempSpotifyResults[sentMsg.key.id] = {
      results,
      _msg: sentMsg
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.reply(`❌ Error en la búsqueda:\n${e.message}`)
    await m.react('✖️')
  }
}

handler.before = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.id) return

  const data = tempSpotifyResults[m.quoted.id]
  if (!data) return

  const match = m.text.trim().toLowerCase().match(/^(s|descargar|doc|documento)\s*#?\s*(\d+)$/i)
  if (!match) return

  const [__, type, number] = match
  const index = parseInt(number) - 1
  const selected = data.results[index]
  if (!selected) return m.reply('❌ Número inválido.')

  const quotedMsg = data._msg || m.quoted
  const asDocument = ['doc', 'documento'].includes(type)

  await m.react('🎧')

  try {
    const { title, artist, album, thumbnail, dl_url } = await Starlights.spotifydl(selected.url)
    const img = await (await fetch(thumbnail)).buffer()

    /*const info = `*乂  S P O T I F Y  -  D O W N L O A D*\n\n`
      + `✦ *Título:* ${title}\n`
      + `✦ *Álbum:* ${album}\n`
      + `✦ *Artista:* ${artist}\n\n`
      + `✦ Enviando ${asDocument ? 'audio como documento' : 'audio'}...`*/
conn.reply(m.chat, `Enviando ✑ *${title}* ${asDocument ? 'audio como documento' : 'audio'}...`, quotedMsg)
    // Enviar imagen como respuesta al mensaje de búsqueda
    //await conn.sendFile(m.chat, img, 'cover.jpg', info, quotedMsg)

    // Enviar audio o documento como respuesta al mensaje del usuario
    await conn.sendMessage(m.chat, {
      [asDocument ? 'document' : 'audio']: { url: dl_url },
      fileName: `${title}.mp3`,
      mimetype: 'audio/mpeg'
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.reply(`❌ Error al descargar:\n${e.message}`)
    await m.react('✖️')
  }
}

handler.command = ['sp']
handler.group = true

export default handler
