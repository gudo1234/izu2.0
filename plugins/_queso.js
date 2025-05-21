let handler = async (m, { conn }) => {
  const lower = m.text?.toLowerCase()?.trim()
  let response

  if (/^a+$/i.test(lower)) {
    response = 'arroz'
  } else (/^(q+|k+|qe+|ke+|que+|k+e+|keso+|queso+)$/i.test(lower)) {
    response = 'queso'
  } else {
    response = '🧀zo'
  }

  await conn.sendMessage(m.chat, { text: response }, { quoted: m, ...rcanal })
}

handler.customPrefix = /^(a+|que+|qe+|ke+|k+|q+)$/i
handler.command = new RegExp // necesario aunque no se use directamente
export default handler
