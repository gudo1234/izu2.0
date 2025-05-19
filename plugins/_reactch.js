import baileys from '@whiskeysockets/baileys'

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0])
      throw `Ejemplo:\n.reactch https://whatsapp.com/channel/<ID>|Hola`

    const [link, ...mensajeArr] = args.join(' ').split('|')
    const texto = mensajeArr.join('|').trim()
    if (!link || !texto)
      throw `Debes separar link y texto con “|”`

    // Patrón ultra-flexible: captura lo que haya tras /channel/
    const exp = /\/channel\/([^\/?#]+)/i
    const match = link.match(exp)
    if (!match) throw 'Enlace de canal no válido.'
    const channelId = match[1]               // «0029VaXHNMZL7UVTeseuqw3H»

    const jid = `${channelId}@broadcast`

    // Entrar al canal
    try { await conn.groupAcceptInviteV4(jid) } catch {}

    // Enviar mensaje
    const sent = await conn.sendMessage(jid, { text: texto })

    // Reacción emoji (WhatsApp solo permite uno)
    await conn.sendMessage(jid, { react: { text: '👍', key: sent.key } })

    // “Reacción” simulada con texto
    await conn.sendMessage(jid, { text: '🅜🅘 🅣🅔🅧🅣🅞', quoted: sent })

    return conn.reply(m.chat, '✅ Mensaje enviado y “reaccionado”', m)

  } catch (e) {
    return conn.reply(m.chat, `❌ Error: ${e}`, m)
  }
}

handler.command = ['reactch']
handler.owner = true
export default handler
