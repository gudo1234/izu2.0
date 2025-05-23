import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  const res = await fetch('https://instasuperscraper.vercel.app/api/posts?user=fcbarcelona')
  const json = await res.json()

  if (!json.ok || !json.data.length) return m.reply('No se pudo obtener la última publicación de Instagram del Barça.')

  const post = json.data[0]
  const caption = post.caption?.slice(0, 200) || 'Publicación reciente'
  const media = post.media

  await conn.sendMessage(m.chat, {
    image: media.includes('.jpg') ? { url: media } : undefined,
    video: media.includes('.mp4') ? { url: media } : undefined,
    caption: `*${caption}*\n\nhttps://www.instagram.com/p/${post.shortcode}`
  }, { quoted: m })
}

handler.command = ['noticiasbarca', 'barcanews', 'barca']
export default handler
