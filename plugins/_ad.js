import axios from 'axios'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

const categorias = [
  'gatos', 'fondos de pantalla', 'anonymous', 'carros exóticos', 
  'chicos bélicos', 'memes', 'emojis de meme'
]

async function pins(query) {
  try {
    const res = await axios.get(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(query)}`)
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(i => i.image_large_url || i.image_medium_url || i.image_small_url).filter(Boolean)
    }
    return []
  } catch (err) {
    console.error('Error API Dorratz:', err)
    return []
  }
}

async function enviarSticker(conn, jid, url) {
  try {
    const buffer = await (await fetch(url)).buffer()
    const st = await sticker(buffer, { packname: 'hola', author: '' })
    await conn.sendMessage(jid, { sticker: st })
    console.log('Sticker enviado a', jid)
  } catch (err) {
    console.error('Error enviando sticker a', jid, err)
  }
}

let yaIniciado = false

async function enviarStickerPrueba(conn) {
  if (yaIniciado) return
  yaIniciado = true

  setInterval(async () => {
    try {
      const miNumero = '50495351584@s.whatsapp.net'

      // Elegir categoría aleatoria
      const categoria = categorias[Math.floor(Math.random() * categorias.length)]
      const imgs = await pins(categoria)
      if (!imgs || imgs.length === 0) return

      // Elegir imagen aleatoria
      const imgRandom = imgs[Math.floor(Math.random() * imgs.length)]

      // Enviar sticker a tu PV
      await enviarSticker(conn, miNumero, imgRandom)

    } catch (err) {
      console.error('Error enviando sticker de prueba:', err)
    }
  }, 1 * 60 * 1000) // Cada 30 minutos
}

let handler = async (m, { conn }) => {
  await enviarStickerPrueba(conn)
}

handler.before = handler
export default handler
