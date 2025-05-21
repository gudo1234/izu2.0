let handler = async (m, { conn, text }) => {
  const lower = text?.toLowerCase()
  let response

  if (lower === 'a') {
    response = 'arroz'
  } else if (/^(q|k|qe+|ke+|que+|k+e+)$/i.test(lower)) {
    response = 'queso'
  } else {
    response = '🧀zo'
  }

  await conn.sendMessage(m.chat, { text: response }, { quoted: m, ...rcanal })
}

export default handler
