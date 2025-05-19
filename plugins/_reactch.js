import baileys from '@whiskeysockets/baileys'

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) {
      throw `Ejemplo:\n.reactch https://whatsapp.com/channel/0029VaXHNMZL7UVTeseuqw3H|Hola`
    }

    const [link, ...mensajeArr] = args.join(' ').split('|')
    const texto = mensajeArr.join('|').trim()

    if (!link || !texto) {
      throw `Debes separar el link y el texto con “|”`
    }

    // 1️⃣ Nuevo patrón que acepta letras y números
    const exp = /^https?:\/\/whatsapp\.com\/channel\/([A-Za-z0-9]{20,})\/?$/i
    const [, channelId] = link.match(exp) || []
    if (!channelId) throw 'Enlace de canal no válido.'

    // 2️⃣ JID de canal
    const jid = `${channelId}@broadcast`

    // 3️⃣ Entrar al canal (opcional; falla silencioso si ya estás dentro)
    try { await conn.groupAcceptInviteV4(jid) } catch {}

    // 4️⃣ Enviar el mensaje
    const sent = await conn.sendMessage(jid, { text: texto })

    // 5️⃣ Reaccionar con emoji (WhatsApp solo permite un emoji)
    await conn.sendMessage(jid, { react: { text: '👍', key: sent.key } })

    // 6️⃣ Simular reacción de texto respondiendo
    await conn.sendMessage(jid, { text: '🅜🅘 🅣🅔🅧🅣🅞', quoted: sent })

    return conn.reply(m.chat, '✅ Mensaje enviado y “reaccionado”', m)

  } catch (e) {
    return conn.reply(m.chat, `❌ Error: ${e}`, m)
  }
}

handler.command = ['reactch']
handler.owner = true
export default handler
