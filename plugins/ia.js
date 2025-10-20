import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🧠 *Uso correcto:*\n> ${usedPrefix + command} ¿Qué es la inteligencia artificial?`)

  try {
    m.react('💭')
    const api = `https://api.dorratz.com/ai/gpt?prompt=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const data = await res.text()

    await m.reply(`🤖 *ChatGPT responde:*\n\n${data.trim()}`)
    m.react('✅')
  } catch (e) {
    console.error(e)
    m.react('❌')
    await m.reply('❌ Ocurrió un error al conectarse con la IA.')
  }
}

handler.command = ['chatgpt', 'ia', 'bot']
handler.group = true
export default handler
