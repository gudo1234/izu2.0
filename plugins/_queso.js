let handler = async (m, { conn, text }) => {
  const lower = text?.toLowerCase()
  let txt

  if (lower === 'a') {
    txt = 'arroz'
  } else if (/^(q|k|qe+|ke+|que+|k+e+)$/i.test(lower)) {
    txt = 'queso'
  } else {
    txt = '🧀zo'
  }

  await conn.sendMessage(m.chat, { text: txt }, { quoted: m})
}

export default handler
