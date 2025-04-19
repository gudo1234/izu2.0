import axios from 'axios'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const quoted = m.quoted || m
  const isImage = quoted.mimetype?.startsWith('image/')
  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Tu nombre es ${wm}, creado por ${author}. Hablas en Español, te gusta bromear y no soportas estar sin hacer nada. Sé amigable con ${username}.`

  if (isImage) {
    try {
      const imgBuffer = await quoted.download?.()
      if (!imgBuffer) {
        return conn.reply(m.chat, '❤️‍🔥 Error: No se pudo descargar la imagen.', m)
      }

      const description = await openaiImageAnalysis(imgBuffer, basePrompt)
      return await conn.reply(m.chat, description, m)
    } catch (err) {
      console.error('🔥 Error al analizar la imagen:', err)
      return await conn.reply(m.chat, '🦋 Ocurrió un error analizando la imagen.', m)
    }
  }

  if (!text) {
    return conn.reply(m.chat, `${usedPrefix + command} ¿qué es un bot?`, m)
  }

  try {
    await m.react('💬')
    const prompt = `${basePrompt}. Responde lo siguiente: ${text}`
    const reply = await openaiText(prompt)
    return await conn.reply(m.chat, reply, m)
  } catch (err) {
    console.error('Error al obtener la respuesta:', err)
    return await conn.reply(m.chat, 'Error: intenta más tarde.', m)
  }
}

handler.help = ['chatgpt <texto>', 'ia <texto>']
handler.tags = ['ai']
handler.command = ['ia', 'chatgpt', 'izumi']
handler.register = false

export default handler

// FUNCIONES DE OPENAI

const OPENAI_API_KEY = 'tu_api_key_aquí'

async function openaiText(prompt) {
  const res = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })

  return res.data.choices[0].message.content.trim()
}

async function openaiImageAnalysis(imageBuffer, promptText) {
  const base64Image = imageBuffer.toString('base64')
  const res = await axios.post('https://api.openai.com/v1/chat/completions', {
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

  return res.data.choices[0].message.content.trim()
}
