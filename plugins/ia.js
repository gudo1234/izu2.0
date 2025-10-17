import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')

  const basePrompt = `Tu nombre es ${wm}, una inteligencia artificial creada por ${author}. 
Responde de forma natural, clara y sin exageraciones. 
Habla de manera fluida, como una persona normal que conversa. 
Usa español neutro y responde directamente sin tono teatral.`

  if (isQuotedImage) {
    const q = m.quoted
    const img = await q.download?.()
    if (!img) return conn.reply(m.chat, 'No se pudo obtener la imagen.', m)

    await conn.reply(m.chat, `Analizando la imagen...`, m)

    try {
      const prompt = `${basePrompt}\n\nDescribe brevemente la imagen enviada por ${username}.`
      const result = await stellarAI(prompt, apiKey)
      await conn.reply(m.chat, result, m, fake)
    } catch (error) {
      console.error('Error al procesar imagen:', error)
      await conn.reply(m.chat, 'Error al analizar la imagen.', m)
    }
    return
  }

  if (!text) {
    return conn.reply(m.chat, `Hola ${m.pushName}, ¿en qué puedo ayudarte?`, m)
  }

  await m.react('💬')

  try {
    const prompt = `${basePrompt}\n\n${username} dice: ${text}\n\nResponde de forma natural.`
    const result = await stellarAI(prompt, apiKey)
    await conn.reply(m.chat, result, m, fake)
  } catch (error) {
    console.error('Error al obtener respuesta IA:', error)
    await conn.reply(m.chat, 'Error al procesar la solicitud.', m)
  }
}

handler.command = ['ia', 'chatgpt', 'gpt', 'gemini', 'bot', 'meta']
handler.group = true
export default handler

async function stellarAI(prompt, apiKey) {
  try {
    const res = await axios.get(`https://api.stellarwa.xyz/ai/chatgpt?text=${encodeURIComponent(prompt)}&apikey=${apiKey}`)
    return res.data.data || res.data.result || 'No se obtuvo respuesta de la IA.'
  } catch (err) {
    console.error('Error en Stellar API:', err?.response?.data || err.message)
    throw err
  }
}
