let handler = async (m, { conn }) => {
  let txt = ''
  if (/^e$/i.test(m.text)) {
    txt = 'eva'
  } else if (/^a$/i.test(m.text)) {
    txt = 'rroz'
  } else if (/^(que|qe|ke|qe|k|ke|kee|quee)$/i.test(m.text)) {
    txt = 'zo🧀'
  }

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

handler.customPrefix = /^(e|a|que|qe|ke|Qe|k|Ke|Kee|Quee)$/i
handler.command = new RegExp
export default handler
