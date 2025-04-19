import axios from 'axios'
import fs from 'fs'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Tu nombre es ${wm}, creado por ${author}. Hablas en Español, te gusta bromear y no soportas estar sin hacer nada. Sé amigable con ${username}.`

  if (isQuotedImage) {
    const q = m.quoted
    const img = await q.download?.()
    if (!img) return conn.reply(m.chat, '❤️‍🔥 Error: No se pudo descargar la imagen.', m, fake)

    try {
      const description = await openaiImageAnalysis(img, basePrompt)
      await conn.reply(m.chat, description, m, fake)
    } catch (error) {
      console.error('🔥 Error al analizar la imagen:', error)
      await conn.reply(m.chat, '🦋 Error al analizar la imagen.', m, fake)
    }
  } else {
    if (!text) return conn.reply(m.chat, `${e} *Ejemplo:* ${usedPrefix + command} ¿qué es un bot?`, m, rcanal)
    await m.react('💬')
    try {
      const prompt = `${basePrompt}. Responde lo siguiente: ${text}`
      const response = await openaiText(prompt)
      await conn.reply(m.chat, response, m, fake)
    } catch (error) {
      console.error('Error al obtener la respuesta:', error)
      await conn.reply(m.chat, 'Error: intenta más tarde.', m, fake)
    }
  }
}

handler.help = ['chatgpt <texto>', 'ia <texto>']
handler.tags = ['ai']
handler.command = ['ia', 'chatgpt', 'izumi']
handler.register = false

export default handler

// FUNCIONES PARA OPENAI API
const OPENAI_API_KEY = 'tu_api_key_aquí'

// Texto
async function openaiText(prompt) {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  return response.data.choices[0].message.content.trim()
}

// Imagen (requiere GPT-4o o GPT-4 con visión)
async function openaiImageAnalysis(imageBuffer, promptText) {
  const base64Image = imageBuffer.toString('base64')
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: `${promptText}. ¿Qué ves en esta imagen?` },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      }
    ],
    max_tokens: 1000
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  return response.data.choices[0].message.content.trim()
}
