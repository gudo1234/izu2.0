import axios from 'axios'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let yaIniciado = false

// Categorías de stickers
const categorias = [
  'gatos', 'fondos de pantalla', 'anonymous', 'carros exóticos', 
  'chicos bélicos', 'memes', 'emojis de meme'
]

// Función para obtener imágenes de Pinterest (Dorratz API)
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

// Función para enviar un sticker a un grupo
async function enviarSticker(conn, jid, url) {
  try {
    const buffer = await (await fetch(url)).buffer()
    const st = await sticker(buffer, { packname: 'hola', author: '' })
    await conn.sendMessage(jid, { sticker: st })
  } catch (err) {
    console.error('Error enviando sticker a', jid, err)
  }
}

// Función principal de envío automático
async function enviarStickersAutomaticos(conn) {
  if (yaIniciado) return
  yaIniciado = true

  setInterval(async () => {
    try {
      const grupos = Array.from(conn.chats.keys()).filter(jid => jid.endsWith('@g.us'))

      for (const jid of grupos) {
        // Elegir categoría aleatoria
        const categoria = categorias[Math.floor(Math.random() * categorias.length)]
        const imgs = await pins(categoria)
        if (!imgs || imgs.length === 0) continue

        // Elegir una imagen aleatoria
        const imgRandom = imgs[Math.floor(Math.random() * imgs.length)]

        // Enviar sticker
        await enviarSticker(conn, jid, imgRandom)

        // Pausa de 2 minutos antes de enviar al siguiente grupo
        await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000))
      }

    } catch (err) {
      console.error('Error enviando stickers automáticos:', err)
    }
  }, 5 * 60 * 1000) // Ejecuta cada 30 minutos
}

// Exportar handler que inicializa la función
let handler = async (m, { conn }) => {
  await enviarStickersAutomaticos(conn)
}

handler.before = handler
export default handler
