let handler = async (m, { conn, text }) => {
  const lower = text?.toLowerCase()?.trim()
  let response

  if (/^a+$/.test(lower)) {
    response = 'arroz'
  } else if (/^(q+|k+|qe+|ke+|que+|k+e+|keso+|queso+)$/i.test(lower)) {
    response = 'queso'
  } else {
    response = '🧀zo'
  }

  await conn.sendMessage(m.chat, { text: response }, { quoted: m})
}

// Se activa con mensajes que comienzan con cualquiera de estos patrones
handler.customPrefix = /^(a+|que+|qe+|ke+|k+|q+)$/i
handler.command = new RegExp // necesario para handlers con customPrefix
export default handler
