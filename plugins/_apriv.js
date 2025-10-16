import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

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

  // 🔹 MENÚ INTERACTIVO (solo si es mensaje nuevo)
  if (!m.message?.buttonsResponseMessage) {
    const sections = [
      {
        title: '💻 Información',
        highlight_label: 'Más detalles',
        rows: [
          { header: '', title: 'Funciones del bot', description: '', id: '.tes' },
          { header: '', title: 'Grupo oficial', description: '', id: '.tes2' },
          { header: '', title: '¿Qué más sabes hacer?', description: '', id: '.tes3' },
          { header: '', title: '📅 Horario', description: '', id: '.tes4' }
        ]
      }
    ]

    const buttonParamsJson = JSON.stringify({
      title: 'OPCIONES',
      description: 'Seleccione una opción',
      sections
    })

    const interactiveMessage = {
      body: { text: '*Le compartimos nuestro menú*' },
      footer: { text: 'Seleccione la *OPCIÓN* requerida' },
      header: { hasMediaAttachment: true, imageMessage },
      nativeFlowMessage: { buttons: [{ name: 'single_select', buttonParamsJson }] }
    }

    await m.reply(`🖐🏻 ¡Hola! *${m.pushName}* mi nombre es *${wm}* y fui desarrollada para cumplir múltiples funciones en WhatsApp🪀`)
    await conn.relayMessage(
      m.chat,
      { viewOnceMessage: { message: { interactiveMessage } } },
      {}
    )
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
