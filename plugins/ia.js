import fetch from 'node-fetch'

const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) return m.reply(`🧠 *Uso correcto:*\n> ${usedPrefix + command} ¿Qué es la inteligencia artificial?`, m, fake)

  try {
    m.react('💭')

    const api = `https://api.dorratz.com/ai/gpt?prompt=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const data = await res.text()

    const respuesta = data.trim()

    await m.reply(`🤖 *ChatGPT responde:*\n\n${respuesta}`, m, fake)
    m.react('✅')

  } catch (e) {
    console.error(e)
    m.react('❌')
    await m.reply('❌ Ocurrió un error al conectarse con la IA.', m, fake)
  }
}

handler.command = ['chatgpt', 'ia', 'bot']
handler.group = true

export default handler
