let handler = async (m, { args, conn }) => {
  let url = args[0]
  if (!url) return m.reply('⚠️ Ingresa un enlace de Alphacoders')

  let direct
  try {
    // intentar detectar si es página o archivo
    const res = await fetch(url, { method: 'HEAD' })
    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      // Transformar URL si es del tipo: gifs.alphacoders.com/229/229122.mp4
      const match = url.match(/(\d{3})\/(\d+)\.mp4$/)
      if (!match) throw '⚠️ No pude convertir el enlace.'
      direct = `https://giffiles.alphacoders.com/${match[1]}/${match[2]}.mp4`
    } else {
      direct = url
    }

    await conn.sendFile(m.chat, direct, 'video.mp4', '🎬 Aquí está tu video.', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ No se pudo descargar el video.')
  }
}

handler.command = ['alphacoders']
export default handler
