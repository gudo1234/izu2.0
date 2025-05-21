/*let handler = async (m, { conn }) => {
  let txt = /^(a)$/i.test(m.text) ? 'arroz' : 'zoo🧀'
  await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
}

handler.customPrefix = /^(Que|que|qe|ke|Qe|k|Ke|Kee|Quee|a)$/i
handler.command = new RegExp
export default handler*/
let handler = async (m, { conn }) => {
  const text = m.text?.toLowerCase()

  if (!text) return

  // Lista de palabras clave que quieres detectar
  const palabrasClave = ['que', 'qe', 'ke', 'qe', 'k', 'ke', 'kee', 'quee']

  if (text === 'a') {
    await conn.sendMessage(m.chat, { text: 'arroz' }, { quoted: m })
  } else if (palabrasClave.includes(text)) {
    await conn.sendMessage(m.chat, { text: 'zoo🧀' }, { quoted: m })
  }
}

handler.command = () => false // Esto evita que lo detecte como comando tradicional

export default handler
