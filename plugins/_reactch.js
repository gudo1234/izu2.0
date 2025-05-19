import baileys from '@whiskeysockets/baileys'

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0])
      throw `Ejemplo:\n.reactch https://whatsapp.com/channel/123456789012345|Hola a todos`

    const [link, ...mensajeArr] = args.join(' ').split('|')
    const texto = mensajeArr.join('|').trim()

    if (!link || !texto)
      throw `Debes separar link y texto con “|”\nEj.:\n.reactch https://whatsapp.com/channel/123456789012345|Hola`

    // ⬇️ Nuevo patrón
    const exp = /^https?:\/\/whatsapp\.com\/channel\/([0-9]{14,})\/?[A-Za-z0-9_-]*$/i
    const [, channelId] = link.match(exp) || []
    if (!channelId) throw 'Enlace de canal no válido.'

    // JID de canal
    const jid = `${channelId}@broadcast`

    // Entrar al canal
    try { await conn.groupAcceptInviteV4(jid) } catch {}

    // Enviar mensaje
    const sent = await conn.sendMessage(jid, { text: texto })

    // Reacción emoji (no se puede texto)
    await conn.sendMessage(jid, { react: { text: '👍', key: sent.key } })

    // “Reacción” estilizada como respuesta
    await conn.sendMessage(jid, { text: '🅜🅘 🅣🅔🅧🅣🅞', quoted: sent })

    return conn.reply(m.chat, '✅ Mensaje enviado y “reaccionado”', m)

  } catch (e) {
    return conn.reply(m.chat, `❌ Error: ${e}`, m)
  }
}

handler.command = ['reactch']
handler.owner = true
export default handler
