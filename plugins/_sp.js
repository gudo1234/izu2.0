import Starlights from '@StarlightsTeam/Scraper'
import fetch from 'node-fetch'

const resultadosSpotify = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `✳️ Ingresa el título de un artista o canción de Spotify.`, m)
  await m.react('🕓')

  try {
    const res = await Starlights.spotifySearch(text)
    if (!res || res.length === 0) return conn.reply(m.chat, `✖️ No se encontraron resultados.`, m)

    const img = await (await fetch(res[0].thumbnail)).buffer()
    let txt = `*乂  S P O T I F Y  -  S E A R C H*\n\n`
    for (let i = 0; i < res.length; i++) {
      txt += `*${i + 1}.* ${res[i].title}\n    ◦ Artista: ${res[i].artist}\n`
    }
    txt += `\nResponde con el número de la canción para descargar.`
    await conn.sendFile(m.chat, img, 'spotify.jpg', txt, m)

    // Guardamos los resultados asociados al mensaje para detectar la respuesta
    resultadosSpotify[m.chat] = {
      results: res,
      timestamp: +new Date(),
      quotedId: m.id,
      sender: m.sender
    }

    await m.react('✅')
  } catch (err) {
    console.error(err)
    await m.react('✖️')
  }
}

handler.customPrefix = /^[0-9]+$/
handler.before = async (m, { conn }) => {
  const data = resultadosSpotify[m.chat]
  if (!data) return
  if (m.quoted?.id !== data.quotedId) return
  if (m.sender !== data.sender) return

  const num = parseInt(m.text)
  if (isNaN(num) || num < 1 || num > data.results.length) {
    return conn.reply(m.chat, `✖️ Número inválido. Responde con un número entre 1 y ${data.results.length}.`, m)
  }

  const selected = data.results[num - 1]
  delete resultadosSpotify[m.chat]

  await m.react('🎶')
  try {
    const { title, artist, album, thumbnail, dl_url } = await Starlights.spotifydl(selected.url)
    const img = await (await fetch(thumbnail)).buffer()

    const info = `*乂  S P O T I F Y  -  D O W N L O A D*\n\n`
      + `    ✩  *Título* : ${title}\n`
      + `    ✩  *Álbum* : ${album}\n`
      + `    ✩  *Artista* : ${artist}\n\n`
      + `*- ↻ Enviando audio...*`

    await conn.sendFile(m.chat, img, 'cover.jpg', info, m)
    await conn.sendMessage(m.chat, {
      audio: { url: dl_url },
      fileName: `${title}.mp3`,
      mimetype: 'audio/mp4'
    }, { quoted: m })

    await m.react('✅')
  } catch (err) {
    console.error(err)
    await m.react('✖️')
    conn.reply(m.chat, `✖️ Ocurrió un error al descargar la canción.`, m)
  }
}

handler.command = ['sp']
handler.group = true

export default handler
