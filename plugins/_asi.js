import fetch from 'node-fetch'

const handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text)
    return m.reply(`🧷 Ingresa una palabra clave para buscar en TikTok.\n\nEjemplo:\n${usedPrefix + command} shakira`)

  try {
    const apiUrl = `https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.result?.data?.length)
      return m.reply('⚠️ No se encontraron resultados para esa búsqueda.')

    // Elegir 5 videos aleatorios del resultado
    const randomVideos = json.result.data.sort(() => 0.5 - Math.random()).slice(0, 5)

    // Enlaces de contacto y redes
    const contact = 'https://wa.me/50492280729?text=aqui+está+mi+pack🔥'
    const contact2 = 'https://wa.me/50492280729?text=https://chat.whatsapp.com/LTxRo0FxlZi6OSC8BHjUxc'
    const channel = 'https://youtube.com/@edar504'

    // Crear los slides del carrusel
    const messages = randomVideos.map((video, index) => [
      `🎬 TikTok #${index + 1}`,
      `${video.title || 'Sin título'}\n👤 ${video.author?.nickname || 'Desconocido'}\n❤️ ${video.stats?.diggCount || 0} Likes\n💬 ${video.stats?.commentCount || 0} Comentarios\n🔗 ${video.id || ''}`,
      video.cover || video.origin_cover || video.dynamic_cover,
      [],
      [],
      [
        [],
        ['📺 Ver Video', video.play],
        ['📩 Descargar sin marca de agua', video.nowm || video.play],
        ['🌎 Canal', channel]
      ],
      []
    ])

    // Enviar carrusel
    await conn.sendCarousel(m.chat, `🎵 Resultados de TikTok para: *${text}*`, null, null, messages)
  } catch (e) {
    console.error(e)
    m.reply('❌ Error al obtener los TikToks. Intenta nuevamente más tarde.')
  }
}

//handler.command = ['tiktokbaila', 'tiktoksearch', 'ttsearch', 'tiktokvids']
handler.command = ['si']
export default handler
