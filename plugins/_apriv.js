import { prepareWAMessageMedia } from '@whiskeysockets/baileys'
import { randomBytes } from 'crypto'
import moment from 'moment-timezone'

export async function before(m, { conn, args, usedPrefix, command }) {
  if (m.fromMe) return
  if (m.isBaileys && m.fromMe) return !0
  if (m.isGroup) return !1
  if (!m.message) return !0
  if (m.chat === '120363395205399025@newsletter') return !0

  let vn = './media/prueba3.mp3'
  let vn2 = './media/prueba4.mp3'
  let user = global.db.data.users[m.sender]
  if (new Date() - user.pc < 105000) return

  const { imageMessage } = await prepareWAMessageMedia(
    { image: { url: icono } },
    { upload: conn.waUploadToServer }
  )

  // 🔹 Secciones ordenadas por ID (.tes → .tes2 → .tes3 → .tes4)
  const sections = [
    {
      title: '💻 Información',
      highlight_label: 'Más detalles',
      rows: [
        { header: '', title: 'Funciones del bot', description: 'Explora lo que puedo hacer', id: '.tes' },
        { header: '', title: 'Grupo oficial', description: 'Únete a la comunidad', id: '.tes2' },
        { header: '', title: '¿Qué más sabes hacer?', description: 'Detalles avanzados de funciones', id: '.tes3' },
        { header: '', title: '📅 Horario', description: 'Disponibilidad y atención', id: '.tes4' }
      ]
    }
  ]

  const buttonParamsJson = JSON.stringify({
    title: 'OPCIONES',
    description: 'Seleccione una opción',
    sections: sections
  })

  const interactiveMessage = {
    body: { text: '*Le compartimos nuestro menú, para más detalles*' },
    footer: { text: 'Seleccione la *OPCIÓN* requerida para ser atendido:' },
    header: {
      hasMediaAttachment: true,
      imageMessage: imageMessage
    },
    nativeFlowMessage: {
      buttons: [
        {
          name: 'single_select',
          buttonParamsJson: buttonParamsJson
        }
      ]
    }
  }

  const message = {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2
    },
    interactiveMessage: interactiveMessage
  }

  m.react('🤖')

  await m.reply(`🖐🏻 ¡Hola! *${m.pushName}* mi nombre es *${wm}* y fui desarrollada para cumplir múltiples funciones en *WhatsApp🪀*.

✧──────‧₊˚📁˚₊‧──────╮
│ _Tengo muchos comandos_
│ _con diferentes funciones_
│ _como la descarga de videos,_
│ _audios, fotos y mucho más,_
│ _contiene búsquedas con_
│ _chatGPT y diversos juegos._
✧──────‧₊˚🎠˚₊‧──────╯

╭︶︶︶︶︶🌐︶︶︶︶︶╮
*Síguenos en nuestro canal*
*y mantente informado...*
╰︶︶︶︶︶🎉︶︶︶︶︶╯`)

  await conn.relayMessage(m.chat, { viewOnceMessage: { message } }, {})

  conn.sendFile(m.chat, [vn, vn2].getRandom(), 'prueba3.mp3', null, null, true, {
    type: 'audioMessage',
    ptt: true
  })

  // 🧩 Respuestas automáticas ordenadas
  const respuestas = [
    { id: '.tes', text: '🤖 Este comando te muestra una vista general de mis funciones principales.' },
    { id: '.tes2', text: '🌍 Únete a nuestro grupo oficial y forma parte de la comunidad.' },
    { id: '.tes3', text: '✨ Aquí encontrarás más información sobre todo lo que puedo hacer.' },
    { id: '.tes4', text: '🕒 Estoy disponible 24/7 para ayudarte en cualquier momento.' }
  ]

  // ⏳ Delay entre mensajes
  const delay = (ms) => new Promise((res) => setTimeout(res, ms))

  for (const item of respuestas) {
    await m.reply(`💡 Respuesta para *${item.id}*\n${item.text}`)
    await delay(1500)
  }

  user.pc = new Date() * 1
}
