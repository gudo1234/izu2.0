import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

export async function before(m, { conn }) {
  if (m.fromMe) return
  if (m.isGroup) return
  if (!m.message) return
  if (m.chat === '120363395205399025@newsletter') return

  let user = global.db.data.users[m.sender]
  if (!user.pc) user.pc = 0
  if (new Date() - user.pc < 105000) return

  const { imageMessage } = await prepareWAMessageMedia(
    { image: { url: icono } },
    { upload: conn.waUploadToServer }
  )

  // 🔹 MENÚ INTERACTIVO TIPO BUTTONS (template)
  if (!m.message?.buttonsResponseMessage) {
    const template = generateWAMessageFromContent(
      m.chat,
      {
        templateMessage: {
          hydratedTemplate: {
            imageMessage: imageMessage,
            hydratedContentText: '*Le compartimos nuestro menú*',
            hydratedFooterText: 'Seleccione la *OPCIÓN* requerida',
            hydratedButtons: [
              { quickReplyButton: { displayText: 'Funciones del bot', id: '.tes' } },
              { quickReplyButton: { displayText: 'Grupo oficial', id: '.tes2' } },
              { quickReplyButton: { displayText: '¿Qué más sabes hacer?', id: '.tes3' } },
              { quickReplyButton: { displayText: 'Horario', id: '.tes4' } }
            ]
          }
        }
      },
      { userJid: m.sender, quoted: m }
    )

    await conn.relayMessage(m.chat, template.message, { messageId: template.key.id })
    await m.reply(`🖐🏻 ¡Hola! puta *${m.pushName}* mi nombre es *${wm}* y fui desarrollada para cumplir múltiples funciones en WhatsApp🪀`)
    user.pc = new Date() * 1
    return
  }

  // 🔹 RESPUESTAS AUTOMÁTICAS DE BOTONES
  const id = m.message?.buttonsResponseMessage?.selectedButtonId
  if (!id) return

  if (id === '.tes') {
    await conn.reply(m.chat, '🤖 Este comando te muestra una vista general de mis funciones principales.', m)
  } else if (id === '.tes2') {
    await conn.reply(m.chat, '🌍 Únete a nuestro grupo oficial y forma parte de la comunidad.', m)
  } else if (id === '.tes3') {
    await conn.reply(m.chat, '✨ Aquí encontrarás más información sobre todo lo que puedo hacer.', m)
  } else if (id === '.tes4') {
    await conn.reply(m.chat, '🕒 Estoy disponible 24/7 para ayudarte en cualquier momento.', m)
  }
}
