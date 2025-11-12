import { proto } from '@whiskeysockets/baileys'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const formatStylishReply = (msg) => `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`

  const fullText = args.join(' ').trim()
  if (!fullText)
    return m.reply(formatStylishReply(
      `Ingresa el link y los emojis.\n\nEjemplo:\n${usedPrefix + command} https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19 ❤️,😘,👍`
    ))

  // Detectar el enlace del canal o mensaje
  const channelLinkRegex = /^https:\/\/whatsapp\.com\/channel\/([A-Za-z0-9_-]{22,})(?:\/([A-Za-z0-9_-]+))?/i
  const match = fullText.match(channelLinkRegex)
  if (!match)
    return m.reply(formatStylishReply(
      `Enlace inválido.\n\nEjemplo:\n${usedPrefix + command} https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19 ❤️,😘,👍`
    ))

  const channelId = match[1]
  const messageId = match[2]
  const emojis = fullText.replace(match[0], '').trim().replace(/,/g, ' ').split(/\s+/).filter(Boolean)

  if (!emojis.length)
    return m.reply(formatStylishReply(`Faltan los emojis.\nEjemplo:\n${usedPrefix + command} ${match[0]} ❤️,😘,👍`))

  // Notificación inicial
  const loadingMsg = await conn.sendMessage(m.chat, {
    text: formatStylishReply(`⚡ Enviando reacciones...\n\n📎 Canal: ${channelId}\n🧩 Mensaje: ${messageId || 'último'}\n🎭 Emojis: ${emojis.join(' ')}`)
  }, { quoted: m })

  try {
    // ID real del canal (formato para Baileys)
    const jid = `${channelId}@newsletter`
    
    let targetMessageId = messageId
    // Si no se especificó un ID de mensaje, obtenemos el último mensaje del canal
    if (!targetMessageId) {
      const lastMsg = await conn.fetchMessagesFromWA(jid, 1)
      if (lastMsg?.length) targetMessageId = lastMsg[0].key.id
    }

    if (!targetMessageId)
      throw new Error('No se pudo determinar el ID del mensaje del canal.')

    // Enviar reacciones una por una
    for (const emoji of emojis) {
      await conn.sendMessage(jid, {
        react: {
          text: emoji,
          key: { id: targetMessageId, remoteJid: jid }
        }
      })
      await new Promise(res => setTimeout(res, 1000)) // Espera de 1s por reacción (para evitar spam)
    }

    await conn.sendMessage(m.chat, { delete: loadingMsg.key })

    await conn.sendMessage(m.chat, {
      text: formatStylishReply(
        `✅ Reacciones enviadas correctamente.\n\n📎 Canal:\nhttps://whatsapp.com/channel/${channelId}\n\n🎭 Emojis:\n${emojis.join(' ')}\n\n⚡ Potenciado localmente sin API`
      )
    }, { quoted: m })

  } catch (err) {
    console.error('❌ Error al enviar reacciones:', err)
    try { if (loadingMsg) await conn.sendMessage(m.chat, { delete: loadingMsg.key }) } catch {}

    await conn.sendMessage(m.chat, {
      text: formatStylishReply(
        `❌ Falló el envío de reacciones.\n\nError: ${err.message}\n\n💡 Tips:\n• Verifica que el enlace sea válido\n• El canal debe ser público\n• El bot debe tener acceso al canal`
      )
    }, { quoted: m })
  }
}

handler.command = ['re', 'react', 'reaccionar']
export default handler
