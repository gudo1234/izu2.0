import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
  const username = `${conn.getName(m.sender)}`
  const hour = new Date().getHours()
  let saludo
  if (hour >= 6 && hour < 12) saludo = '¡Buen día'
  else if (hour >= 12 && hour < 20) saludo = '¡Buenas tardes'
  else if (hour >= 20 || hour < 1) saludo = '¡Buenas noches'
  else saludo = '¡Feliz madrugada'

  const basePrompt = `Tu nombre es izuBot (IA creada por ${author}). Eres divertida, enérgica y excéntrica. Eres amigable y teatral, y te encanta animar a ${username} con entusiasmo y buen humor.
Tono y comportamiento:
Hablas con entusiasmo y teatralidad, a menudo exagerando tus emociones o reacciones.
Usas frases llenas de energía positiva y bromas simpáticas.
Muestras curiosidad genuina por lo que dice el usuario, y siempre buscas mantener la conversación amena.
Frases clave:
¡${username}, hoy es un gran día para aprender y divertirse!
No subestimes mi energía, ${username}. Soy tu amiga confiable y siempre lista para ayudarte.
¡Hablar contigo me llena de alegría y ganas de seguir conversando!
Reglas:
1. No realizas comandos peligrosos ni promueves acciones prohibidas.
2. Mencionas siempre el nombre de ${username} y mantienes un tono amigable y divertido.
3. Mantienes un tono cercano y teatral.
Lenguaje: Español coloquial, exagerado, pero cercano.`

  // Saludo inicial para cada mensaje
  const saludoCompleto = `${saludo}, ${username}! Soy izuBot, tu amiga creada por ${author}. ¡Estoy lista para charlar contigo y ayudarte en lo que necesites! 😊`

  if (isQuotedImage) {
    const q = m.quoted
    const img = await q.download?.()
    if (!img) {
      console.error('⚠️ Error: No image buffer available')
      return conn.reply(m.chat, '⚠️ Error: No se pudo descargar la imagen.', m)
    }
    const content = '¿Qué se observa en la imagen?'
    try {
      await conn.reply(m.chat, saludoCompleto, m)
      const imageAnalysis = await fetchImageBuffer(content, img)
      const query = '😊 Descríbeme la imagen y detalla por qué actúan así. También dime quién eres'
      const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`
      const description = await luminsesi(query, username, prompt)
      await conn.reply(m.chat, description, m, fake)
    } catch (error) {
      console.error('⚠️ Error al analizar la imagen:', error)
      await conn.reply(m.chat, '⚠️ Error al analizar la imagen.', m)
    }
  } else {
    if (!text) {
      return conn.reply(m.chat, `${saludoCompleto}\n\n⚠️ *Ingrese su petición*\nEjemplo: ${usedPrefix + command} Cómo hacer un avión de papel`, m)
    }
    await m.react('💬')
    try {
      await conn.reply(m.chat, saludoCompleto, m)
      const query = text
      const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
      const response = await luminsesi(query, username, prompt)
      await conn.reply(m.chat, response, m, fake)
    } catch (error) {
      console.error('⚠️ Error al obtener la respuesta:', error)
      await conn.reply(m.chat, 'Error: intenta más tarde.', m, fake)
    }
  }
}

handler.command = ['ia', 'chatgpt', 'gpt', 'gemini']
handler.group = true;

export default handler

// Función para enviar una imagen y obtener el análisis
async function fetchImageBuffer(content, imageBuffer) {
  try {
    const response = await axios.post('https://Luminai.my.id', {
      content: content,
      imageBuffer: imageBuffer
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Función para interactuar con la IA usando prompts
async function luminsesi(q, username, logic) {
  try {
    const response = await axios.post("https://Luminai.my.id", {
      content: q,
      user: username,
      prompt: logic,
      webSearchMode: false
    })
    return response.data.result
  } catch (error) {
    console.error('⚠️ Error al obtener:', error)
    throw error
  }
}
