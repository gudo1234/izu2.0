import axios from "axios"

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `❗ Ingresa el nombre de una canción para buscar en Spotify.`, m)

  try {
    await m.react('🎧')

    const res = await axios.get(`https://velyn.biz.id/api/search/spotify?query=${encodeURIComponent(text)}`)
    const data = res.data

    if (!data?.status || !Array.isArray(data.data) || data.data.length === 0) {
      await m.react('❌')
      return conn.reply(m.chat, '❌ No se encontraron canciones.', m)
    }

    let listado = data.data.slice(0, 10).map((track, i) => {
      let dur = track.duration_ms || 0
      let seg = Math.floor(dur / 1000)
      let min = Math.floor(seg / 60)
      let rem = seg % 60
      let duracion = `${min}:${rem.toString().padStart(2, '0')}`
      return `*${i + 1}.* 🎧 *${track.name}*\n🎤 ${track.artists}\n⏱ ${duracion}\n🔗 ${track.link}`
    }).join('\n\n')

    let image = data.data[0].image
    let caption = `🎶 *Resultados de Spotify para:* _${text}_\n\n${listado}`

    await conn.sendFile(m.chat, image, 'spotify.jpg', caption, m)
    await m.react('✅')

  } catch (e) {
    console.error('[❌ ERROR EN SPOTIFY]', e)
    await m.react('⚠️')
    return conn.reply(m.chat, '❌ Ocurrió un error al buscar la canción.', m)
  }
}

handler.command = ['spotify']
handler.group = true
export default handler
