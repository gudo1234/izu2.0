let handler = async (m, { conn }) => {
  const text = m.text?.toLowerCase()?.trim()
  let response = '🧀zo'

  switch (true) {
    case /^a+$/.test(text):
      response = 'arroz'
      break

    case /^(q+|k+|qe+|ke+|que+|k+e+|keso+|queso+)$/.test(text):
      response = 'queso'
      break
  }

  await conn.sendMessage(m.chat, { text: response }, { quoted: m, ...rcanal })
}

// customPrefix general que activa el handler, sin contener exactamente los comandos finales
handler.customPrefix = /^[a-z]{1,5}$/i
handler.command = new RegExp
export default handler
