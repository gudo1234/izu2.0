import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const apiKey = 'stellar-LgIsemtM' // tu API Key Stellar

  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `${e} Necesito un enlace de *MediaFire*.\n\nEjemplo:\n> *${usedPrefix + command} https://www.mediafire.com/file/xxxx*`
    }, { quoted: m })
  }

  // Validación de enlace MediaFire
  const mediafireRegex = /https?:\/\/(www\.)?mediafire\.com\/file\/[a-zA-Z0-9]+/i
  if (!mediafireRegex.test(text)) {
    return conn.sendMessage(m.chat, {
      text: `⚠️ El enlace proporcionado no parece ser de *MediaFire*.\nPor favor, revisa el formato.`
    }, { quoted: m })
  }

  try {
    m.react('🕒')

    // 📡 Petición a la API Stellar
    const url = `https://api.stellarwa.xyz/dow/mediafire?url=${encodeURIComponent(text)}&apikey=${apiKey}`
    const { data: res } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 20000
    })

    // 🧩 Validar estructura
    if (!res || !res.status || !res.data || !res.data.dl) {
      console.log('[API STELLAR RESPUESTA]', res)
      throw new Error('La API no devolvió información válida del archivo.')
    }

    const file = res.data
    const extMatch = file.title.match(/\.(\w+)$/i)
    const ext = extMatch ? extMatch[1].toLowerCase() : 'bin'
    const mime = file.tipo || `application/${ext}`

    // 📝 Descripción
    const caption = `📦 *Archivo encontrado*\n\n` +
                    `*📄 Nombre:* ${file.title}\n` +
                    `*📁 Peso:* ${file.peso}\n` +
                    `*📅 Fecha:* ${file.fecha}\n` +
                    `*📑 Tipo:* ${ext.toUpperCase()}`

    // 📄 Enviar archivo como documento
    await conn.sendMessage(m.chat, {
      document: { url: file.dl },
      fileName: file.title,
      mimetype: mime,
      caption
    }, { quoted: m })

    m.react('✅')

  } catch (err) {
    console.error('[❌ ERROR EN MEDIAFIRE]', err)
    m.react('❌')

    let msg = '⚠️ *Error al procesar el enlace de MediaFire.*'
    if (err.response) msg += `\n\n📡 *Estado HTTP:* ${err.response.status}`
    if (err.message) msg += `\n📄 *Detalle:* ${err.message}`

    return conn.sendMessage(m.chat, { text: msg }, { quoted: m })
  }
}

handler.command = ['mf', 'mediafire']
handler.group = true

export default handler
