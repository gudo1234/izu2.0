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

  // 🔹 MENÚ DE LISTA
  if (!m.message?.listResponseMessage) {
    const listMessage = {
      text: '*Le compartimos nuestro menú*',
      footer: 'Seleccione la opción requerida',
      title: 'OPCIONES',
      buttonText: 'Abrir menú',
      sections: [
        {
          title: '💻 Información',
          rows: [
            { title: 'Funciones del bot', rowId: 'tes', description: 'Explora lo que puedo hacer' },
            { title: 'Grupo oficial', rowId: 'tes2', description: 'Únete a la comunidad' },
            { title: '¿Qué más sabes hacer?', rowId: 'tes3', description: 'Detalles avanzados de funciones' },
            { title: 'Horario', rowId: 'tes4', description: 'Disponibilidad y atención' }
          ]
        }
      ]
    }

    await conn.sendMessage(m.chat, listMessage, { quoted: m })
    await m.reply(`🖐🏻 ¡Hola! *${m.pushName}* mi nombre es *${wm}* y fui desarrollada para cumplir múltiples funciones en WhatsApp🪀`)
    user.pc = new Date() * 1
    return
  }

  // 🔹 RESPUESTAS AUTOMÁTICAS DE LA LISTA
  const selectedId = m.message?.listResponseMessage?.singleSelectReply?.selectedRowId
  if (!selectedId) return

  if (selectedId === 'tes') {
    await conn.reply(m.chat, '🤖 Este comando te muestra una vista general de mis funciones principales.', m)
  } else if (selectedId === 'tes2') {
    await conn.reply(m.chat, '🌍 Únete a nuestro grupo oficial y forma parte de la comunidad.', m)
  } else if (selectedId === 'tes3') {
    await conn.reply(m.chat, '✨ Aquí encontrarás más información sobre todo lo que puedo hacer.', m)
  } else if (selectedId === 'tes4') {
    await conn.reply(m.chat, '🕒 Estoy disponible 24/7 para ayudarte en cualquier momento.', m)
  }
}
