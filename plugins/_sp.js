import Starlights from '@StarlightsTeam/Scraper'
import fetch from 'node-fetch'

let tempSpotifyResults = {}

let handler = async (m, { conn, command, args, usedPrefix }) => {
  let text = args.join(' ')
  if (!text) return m.reply(`✳️ Ingresa el título de una canción o artista en Spotify.\n\n*Ejemplo:* ${usedPrefix + command} The Weeknd`)

  await m.react('🕓')

  try {
    const res = await Starlights.spotifySearch(text)
    if (!res || !res.length) return m.reply('❌ No se encontraron resultados.')

    let caption = `╭───── • ─────╮
✩ \`Spotify Search\` ✩

🔍 *Consulta:* ${text}
🎧 *Resultados:* ${res.length}
╰───── • ─────╯

📌 *¿Cómo descargar?*
✑ \`s 1\` o \`descargar 1\` → Audio normal  
⁌ \`doc 1\` o \`documento 1\` → Audio como documento

━━━━━━━━━━━━━`

    for (let i = 0; i < res.length; i++) {
      caption += `\n\n*#${i + 1}.* _${res[i].title}_
👤 ${res[i].artist}
🔗 ${res[i].url}`
    }

    const thumb = await (await fetch(res[0].thumbnail)).buffer()

    const sentMsg = await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: 'Spotify Downloader',
          body: 'Resultados encontrados',
          thumbnail: thumb,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: res[0].url
        }
      }
    }, { quoted: m })

    tempSpotifyResults[sentMsg.key.id] = {
      results: res,
      _msg: sentMsg
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.reply(`❌ Error en la búsqueda:\n${e.message}`)
    await m.react('✖️')
  }
}

// Detección de respuestas
handler.before = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.id) return

  const data = tempSpotifyResults[m.quoted.id]
  if (!data) return

  const match = m.text.trim().toLowerCase().match(/^(s|descargar|d|doc|documento)\s*#?\s*(\d+)$/i)
  if (!match) return

  const [__, type, numStr] = match
  const index = parseInt(numStr) - 1
  const selected = data.results[index]
  if (!selected) return m.reply('❌ Número inválido.')

  const quotedMsg = data._msg || m.quoted
  const asDocument = ['doc', 'documento'].includes(type)

  await m.react('🎧')

  try {
    const { title, artist, album, thumbnail, dl_url } = await Starlights.spotifydl(selected.url)
    const img = await (await fetch(thumbnail)).buffer()

    const info = `*乂  S P O T I F Y  -  D O W N L O A D*\n\n`
      + `    ✩  *Título* : ${title}\n`
      + `    ✩  *Álbum* : ${album}\n`
      + `    ✩  *Artista* : ${artist}\n\n`
      + `*- Enviando audio...*`

    await conn.sendFile(m.chat, img, 'cover.jpg', info, m)
    await conn.sendMessage(m.chat, {
      [asDocument ? 'document' : 'audio']: { url: dl_url },
      fileName: `${title}.mp3`,
      mimetype: 'audio/mpeg'
    }, { quoted: quotedMsg })

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
