import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const author = 'Ixumi' // Puedes cambiar el autor
  const username = m.pushName || 'Usuario'

  const basePrompt = `Tu nombre es IzuBot, una inteligencia artificial creada por ${author}.
Responde de forma natural, clara y sin exageraciones.
Habla de manera fluida, como una persona normal que conversa.
Usa español neutro y responde directamente sin tono teatral.
Separa bien las ideas con puntos y saltos de línea cuando sea necesario.`

  if (!text) return m.reply(`🧠 *Uso correcto:*\n> ${usedPrefix + command} ¿Qué es la inteligencia artificial?`)

  try {
    await m.react('💭')

    const prompt = `${basePrompt}\n\n${username} dice: ${text}\n\nResponde de forma natural.`

    const api = `https://api.dorratz.com/ai/gpt?prompt=${encodeURIComponent(prompt)}`
    const res = await fetch(api)

    if (!res.ok) throw new Error(`Error HTTP ${res.status}`)
    const json = await res.json()

    // La API devuelve {"creator":"DIEGO-OFC","result":"\"texto...\""}
    let respuesta = json?.result || 'No se obtuvo respuesta de la IA.'
    respuesta = respuesta.replace(/^"|"$/g, '') // quita comillas dobles si vienen dentro del string

    await m.reply(`🤖 *ChatGPT responde:*\n\n${respuesta}`, m, fake)
    await m.react('✅')

  } catch (e) {
    console.error('Error IA:', e)
    await m.react('❌')
    await m.reply('❌ Ocurrió un error al conectarse con la IA.', m, fake)
  }
}

handler.command = ['chatgpt', 'ia', 'bot']
handler.group = true

export default handler
