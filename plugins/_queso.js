let handler = async (m, { conn }) => {
  let txt = /^(a)$/i.test(m.text) ? 'arroz' : 'zoo🧀'
  await conn.sendMessage(
    m.chat,
    { text: txt },
    {
      quoted: m,
      ephemeralExpiration: 24 * 60 * 100, // 24 horas
      disappearingMessagesInChat: 24 * 60 * 100 // 24 horas
    }
  )
}

handler.customPrefix = /^(Que|que|qe|ke|Qe|k|Ke|Kee|Quee|a)$/i
handler.command = new RegExp
export default handler
