import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''
  const isMedia = /image|video/.test(mime)
  const url = (args[0] || '').trim()

  // Detectar variante visual
  const style = args[0]?.toLowerCase() || ''
  const stickerOptions = {
    packname: global.packname,
    author: global.author,
    quality: 75,
    background: 'transparent',
    circle: style === '-c',
    type: ['-v', '-a'].includes(style) ? 'crop' : 'full',
    effect: style === '-a' ? 'aqua' : style === '-f' ? 'fire' : '',
    keepScale: true,
  }

  // Validación de entrada
  if (!isMedia && !/^https?:\/\//i.test(url)) {
    throw `
✳️ Envía o responde a una imagen, video/gif (≤10s) o enlace directo.

🎨 *Variantes disponibles:*
- \`${usedPrefix + command} -v\` → Crop (recorte cuadrado)
- \`${usedPrefix + command} -c\` → Circular
- \`${usedPrefix + command} -a\` → Efecto aqua
- \`${usedPrefix + command} -f\` → Efecto fuego

🧩 También puedes usar sin variantes para sticker normal.
`.trim()
  }

  // Obtener media
  let media
  if (isMedia) {
    media = await q.download()
  } else {
    media = url
  }

  try {
    const stiker = await sticker(media, m, stickerOptions)
    if (!stiker) throw '⚠️ No se pudo generar el sticker.'

    await conn.sendMessage(m.chat, {
      sticker: stiker,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: false,
          title: m.pushName,
          body: global.botname,
          mediaType: 1,
          sourceUrl: global.redes,
          thumbnailUrl: global.imagen1,
          thumbnail: global.imagen1,
        },
      }
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    throw '❗ Error al crear el sticker. Asegúrate de que el archivo sea válido.'
  }
}

handler.help = [
  's', 's -v', 's -c', 's -a', 's -f'
]
handler.tags = ['sticker']
handler.command = ['s', 'sticker']

export default handler
