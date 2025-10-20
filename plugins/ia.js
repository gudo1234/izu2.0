import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`🧠 *Uso correcto:*\n> ${usedPrefix + command} ¿Qué es la inteligencia artificial?`)
  }

  try {
    await m.react('💭')

    const prompt = `Responde en español de forma natural, breve y clara, como una inteligencia artificial que conversa normalmente.\n\nPregunta: ${text}`
    const api = `https://api.dorratz.com/ai/gpt?prompt=${encodeURIComponent(prompt)}`
    const res = await fetch(api)
    const json = await res.json()

    // limpiar comillas dobles extra dentro del result
    let respuesta = json.result
    if (typeof respuesta === 'string') {
      respuesta = respuesta.replace(/^"|"$/g, '') // quita comillas al inicio y fin
    }

    //await m.reply(`🤖 *ChatGPT responde:*\n\n${respuesta}`, m, fake)
    await conn.reply(m.chat, respuesta, m, fake)
    m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    await m.reply('❌ Ocurrió un error al conectarse con la IA.')
  }
}

handler.command = ['chatgpt', 'ia', 'bot']
handler.group = true
export default handler
