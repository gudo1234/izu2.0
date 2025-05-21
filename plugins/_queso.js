let handler = async (m, { conn, text }) => {
  const lower = text?.toLowerCase()?.trim()
  let response

  if (lower === 'a') {
    response = 'arroz'
  } else if ([
    'q', 'k', 'qe', 'ke', 'que', 'keso', 'queso',
    'quee', 'kee', 'qe', 'queee', 'keee', 'kso', 'ksooo', 'ksooo'
  ].includes(lower)) {
    response = 'queso'
  } else {
    response = '🧀zo'
  }

  await conn.sendMessage(m.chat, { text: response }, { quoted: m, ...rcanal })
}

export default handler
