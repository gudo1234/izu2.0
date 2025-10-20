import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  const author = 'Ixumi'
  const username = m.pushName || 'Usuario'
  const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')

  const basePrompt = `Tu nombre es IzuBot, una inteligencia artificial creada por ${author}.
Responde de forma natural, clara y sin exageraciones.
Habla de manera fluida, como una persona normal que conversa.
Usa español neutro y responde directamente sin tono teatral.
Separa bien las ideas con puntos y saltos de línea cuando sea necesario.`

  // 📸 Si responde a una imagen
  if (isQuotedImage) {
    const q = m.quoted
    const img = await q.download?.()
    if (!img) return conn.reply(m.chat, '❌ No se pudo obtener la imagen.', m)

    await conn.reply(m.chat, '🖼️ Analizando la imagen...', m)

    try {
      const prompt = `${basePrompt}\n\nDescribe brevemente la imagen enviada por ${username}.`
      let result = await dorratzAI(prompt)
      result = formatResponse(result)
      await conn.reply(m.chat, result, m, fake)
    } catch (error) {
      console.error('Error al procesar imagen:', error)
      await conn.reply(m.chat, '❌ Error al analizar la imagen.', m)
    }
    return
  }

  // 💬 Si no hay texto
  if (!text) {
    return conn.reply(m.chat, `👋 Hola ${username}, ¿en qué puedo ayudarte hoy?`, m)
  }

  try { await m.react && m.react('💬') } catch {}

  try {
    const prompt = `${basePrompt}\n\n${username} dice: ${text}\n\nResponde de forma natural.`
    let result = await dorratzAI(prompt)
    result = formatResponse(result)
    await conn.reply(m.chat, result, m, fake)
    m.react('✅')
  } catch (error) {
    console.error('Error al obtener respuesta IA:', error)
    await conn.reply(m.chat, '❌ Error al procesar la solicitud.', m)
  }
}

handler.command = ['ia', 'chatgpt', 'gpt', 'gemini', 'bot', 'meta']
handler.group = true
export default handler

// ⚙️ Llamado correcto a la API de Dorratz
async function dorratzAI(prompt) {
  try {
    const api = `https://api.dorratz.com/ai/gpt?prompt=${encodeURIComponent(prompt)}`
    const res = await fetch(api)

    if (!res.ok) throw new Error(`Error HTTP ${res.status}`)
    const text = await res.text()

    // La API devuelve texto plano
    return text.trim() || 'No se obtuvo respuesta de la IA.'
  } catch (err) {
    console.error('Error en Dorratz API:', err.message)
    throw err
  }
}

// 🧩 Limpieza de texto
function formatResponse(text) {
  if (!text) return ''
  return text
    .replace(/([.!?])\s*(?=[A-ZÁÉÍÓÚÑ])/g, '$1\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
