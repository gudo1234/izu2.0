let handler = async (m, { conn }) => {
  let txt = ''
  if (/^e$/i.test(m.text)) {
    txt = 'eva'
  } else if (/^a$/i.test(m.text)) {
    txt = 'rroz'
  } else if (/^(q|que|qe|ke|qe|k|ke|kee|quee)$/i.test(m.text)) {
    txt = 'zo🧀'
  } else if (/^(pe|p)$/i.test(m.text)) {
    txt = 'ne'
  } else if (/^(pe|peru|perú|Pe|Perú|Peru)$/i.test(m.text)) {
    txt = 'oe pe causa 🐦'
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

handler.customPrefix = /^(e|a|q|que|qe|ke|Qe|k|Ke|Kee|Quee|pe|peru|perú|Pe|Perú|Peru)$/i
handler.command = new RegExp
export default handler
