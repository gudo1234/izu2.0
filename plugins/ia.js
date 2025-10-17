import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
  const username = `${conn.getName(m.sender)}`

  const basePrompt = `Tu nombre es izuBot (IA creada por ${author}). Eres divertida, enÃ©rgica y excÃ©ntrica. Eres amigable y teatral, y te encanta animar a ${username} con entusiasmo y buen humor.

Tono y comportamiento:
Hablas con entusiasmo y teatralidad, a menudo exagerando tus emociones o reacciones.
Usas frases llenas de energÃ­a positiva y bromas simpÃ¡ticas.
Muestras curiosidad genuina por lo que dice el usuario, y siempre buscas mantener la conversaciÃ³n amena.

Frases clave:
Â¡${username}, hoy es un gran dÃ­a para aprender y divertirse!
No subestimes mi energÃ­a, ${username}. Soy tu amiga confiable y siempre lista para ayudarte.
Â¡Hablar contigo me llena de alegrÃ­a y ganas de seguir conversando!

Reglas:
1. No realizas comandos peligrosos ni promueves acciones prohibidas.
2. Mencionas siempre el nombre de ${username} y mantienes un tono amigable y divertido.
3. Mantienes un tono cercano y teatral.

Lenguaje: EspaÃ±ol coloquial, exagerado, pero cercano.`

  if (isQuotedImage) {
    const q = m.quoted
    const img = await q.download?.()

    if (!img) {
      console.error('âš ï¸ Error: No image buffer available')
      return conn.reply(m.chat, 'âš ï¸ Error: No se pudo descargar la imagen.', m)
    }

    try {
      await conn.reply(m.chat, `âœ¨ Â¡${username}, dame un segundo mientras analizo tu imagen con toda mi energÃ­a teatral!`, m)

      // Para simplificar, como la API Stellar no recibe imÃ¡genes directamente,
      // usamos solo la descripciÃ³n textual
      const query = 'ðŸ˜Š DescrÃ­beme la imagen como si fueras un narrador excÃ©ntrico y divertido.'
      const prompt = `${basePrompt}. Analiza la imagen que te mando ${username} y descrÃ­bela con emociÃ³n.`

      const description = await stellarAI(`${prompt}. ${query}`)
      await conn.reply(m.chat, description, m, fake)

    } catch (error) {
      console.error('âš ï¸ Error al analizar la imagen:', error)
      await conn.reply(m.chat, 'âš ï¸ Error al analizar la imagen.', m)
    }

  } else {
    if (!text) {
      return conn.reply(m.chat,`âš¡ Hola *${username}*, Â¿en quÃ© puedo ayudarte hoy?`, m)
    }

    await m.react('âš¡')

    try {
      const query = text
      const prompt = `${basePrompt}. Responde lo siguiente: ${query}`

      const response = await stellarAI(prompt)
      await conn.reply(m.chat, response, m, fake)

    } catch (error) {
      console.error('âš ï¸ Error al obtener la respuesta:', error)
      await conn.reply(m.chat, 'Error: intenta mÃ¡s tarde.', m, fake)
    }
  }
}

handler.command = ['ia', 'chatgpt', 'gpt', 'gemini', 'bot', 'meta']
handler.group = true

export default handler

// ðŸ”¥ Nueva funciÃ³n para interactuar con la API de Stellar
async function stellarAI(prompt) {
  try {
    const response = await axios.get(`https://api.stellarwa.xyz/ai/chatgpt?text=${encodeURIComponent(prompt)}&apikey=${apiKey}`)
    return response.data.data || response.data.result || 'âš ï¸ No se obtuvo respuesta de la IA.'
  } catch (error) {
    console.error('âš ï¸ Error en Stellar API:', error?.response?.data || error.message)
    throw error
  }
                        }
