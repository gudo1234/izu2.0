const handler = async (m, { conn, args, usedPrefix, command }) => {
  const cleanCommand = command.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  if (!args.length)
    return m.reply(`${e} Uso correcto:\n\n• *${usedPrefix + command}* nombre o link de YouTube`)

  const text = args.join(' ')
  let video

  if (text.includes('youtube.com') || text.includes('youtu.be')) {
    video = { url: text }
  } else {
    const search = await yts(text)
    if (!search.videos.length) return m.reply('❌ No se encontraron resultados.')
    video = search.videos[0]
  }

  const fo = cleanCommand === 'audio' ? 2 : 1
  const quality = '360'
  const apiURL = `${BASE_API}?url=${video.url}&fo=${fo}&qu=${quality}&apiKey=${API_KEY}`

  m.react('⬆️')
  try {
    const res = await fetch(apiURL)
    if (!res.ok) throw new Error(`Error API: ${res.status}`)

    const textData = await res.text()
    const urlMatch = textData.match(/https?:\/\/[^\s"']+/)
    if (!urlMatch) return m.reply(`${e} No se pudo extraer el enlace de descarga.`)

    const downloadUrl = urlMatch[0]
    m.react('⬇️')

    const rawThumb = await (await fetch(video.thumbnail)).buffer()
    const jpegThumb = await sharp(rawThumb)
      .resize(400, 250, { fit: 'cover' })
      .jpeg()
      .toBuffer()

    const isAudio = cleanCommand === 'audio'

    await conn.sendMessage(
      m.chat,
      {
        [isAudio ? 'audio' : 'document']: { url: downloadUrl },

        mimetype: isAudio ? 'audio/mpeg' : 'video/mp4',
        fileName: `${video.title}.${isAudio ? 'mp3' : 'mp4'}`,
        jpegThumbnail: jpegThumb,
        contextInfo: {
          externalAdReply: {
            title: isAudio ? video.title : wm,
            body: textbot,
            thumbnailUrl: redes,
            thumbnail: isAudio ? jpegThumb : await (await fetch(icono)).buffer(),
            sourceUrl: redes,
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      },
      { quoted: m }
    )

  } catch (err) {
    console.error(err)
    m.reply(`${e} Error al procesar la descarga. Verifica que la API esté activa.`)
  }
}

handler.command = ['video', 'vídeo', 'audio']
handler.group = true
export default handler
