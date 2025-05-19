// plugins/reactch.js
import baileys from '@whiskeysockets/baileys'

/**
 * (.reactch <link>|<texto>)
 * Ej.: .reactch https://whatsapp.com/channel/abc/123|Hola a todos
 */
let handler = async (m, { conn, args }) => {
  try {
    // 1. Validaciones básicas
    if (!args[0]) {
      throw `Ejemplo:\n.reactch https://whatsapp.com/channel/abc/123|Hola a todos`
    }

    const [link, ...mensajeArr] = args.join(' ').split('|')
    const texto = mensajeArr.join('|').trim()

    if (!link || !texto) {
      throw `Debes separar el link y el texto con el carácter “|”\nEjemplo:\n.reactch https://whatsapp.com/channel/abc/123|Hola a todos`
    }

    const exp = /^https?:\/\/whatsapp\.com\/channel\/[A-Za-z0-9_\-]+\/\d+$/i
    if (!exp.test(link)) throw 'Enlace de canal no válido.'

    // 2. JID del canal
    const jid = baileys.jidDecode(link)?.id || baileys.jidNormalizedUser(link)

    // 3. Entramos al canal
    try { await conn.groupAcceptInviteV4(jid) } catch {}

    // 4. Enviamos el mensaje original
    const sent = await conn.sendMessage(jid, { text: texto })

    // 5. Añadimos reacción emoji (opcional)
    await conn.sendMessage(jid, {
      react: { text: '👍', key: sent.key }
    })

    // 6. Respondemos con el texto “decorativo”
    await conn.sendMessage(jid, {
      text: '🅜🅘 🅣🅔🅧🅣🅞',
      quoted: sent
    })

    // 7. Avisamos al usuario
    return conn.reply(m.chat, '✅ Mensaje enviado con reacción y texto decorativo', m)

  } catch (e) {
    return conn.reply(m.chat, `❌ Error: ${e}`, m)
  }
}

handler.command = ['reactch']
handler.owner = true
export default handler
