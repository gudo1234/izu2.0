import { prepareWAMessageMedia } from '@whiskeysockets/baileys'
import moment from 'moment-timezone'
import { randomBytes } from 'crypto'

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

// IMAGEN DEL MENÚ
const icono = 'https://i.imgur.com/ivz6Mug.jpeg' // puedes cambiarla
const { imageMessage } = await prepareWAMessageMedia({
  image: { url: icono }
}, { upload: conn.waUploadToServer })

// SECCIONES INTERACTIVAS
const sections = [
  {
    title: "💻Información",
    highlight_label: "Más detalles",
    rows: [
      { header: "", title: "¿Qué más sabes hacer?", description: "", id: `.tes` }
    ]
  },
  {
    title: "🤖Servicio",
    highlight_label: "ASESOR",
    rows: [
      { header: "", title: "Hablar con su desarrollador", description: "", id: `.tes2` },
      { header: "", title: "📅Horario", description: "", id: `.tes2` }
    ]
  },
  {
    title: "🌐Convivir",
    highlight_label: "Únete a nuestra comunidad",
    rows: [
      { header: "", title: "Grupo", description: "", id: `.tes3` }
    ]
  }
]

// BOTONES Y MENSAJE INTERACTIVO
const buttonParamsJson = JSON.stringify({
  title: "OPCIONES",
  description: "Seleccione una opción",
  sections
})

const interactiveMessage = {
  body: { text: '*Le compartimos nuestro menú, para más detalles*' },
  footer: { text: 'Seleccione la *OPCIÓN* requerida para ser atendido:' },
  header: {
    hasMediaAttachment: true,
    imageMessage
  },
  nativeFlowMessage: {
    buttons: [{
      name: "single_select",
      buttonParamsJson
    }]
  }
}

const message = {
  messageContextInfo: {
    deviceListMetadata: {},
    deviceListMetadataVersion: 2
  },
  interactiveMessage
}

// RESPUESTA PRINCIPAL
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
*y mantente informado....*
╰︶︶︶︶︶🎉︶︶︶︶︶╯`)
await conn.relayMessage(m.chat, { viewOnceMessage: { message } }, {})

// ENVÍA AUDIO DE PRESENTACIÓN
conn.sendFile(m.chat, [vn, vn2].getRandom(), 'prueba.mp3', null, null, true, { 
  type: 'audioMessage', 
  ptt: true 
})

user.pc = new Date * 1
}


// FUNCIONES RESPUESTA AUTOMÁTICA
export async function handler(m, { conn, command }) {
if (command == 'tes') {
  await conn.reply(m.chat, `🎧 Descargar música`, m)
}

if (command == 'tes2') {
  let teks = `🗿 *Hola creador*\n⭐El número Wa.me/${m.sender.split`@`[0]} quiere de tus servicios`
  await conn.reply('50492280729@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, { contextInfo: { mentionedJid: [m.sender] } })
  await conn.reply(m.chat, `⚖️ _Por favor espere, nuestro siguiente asesor disponible le atenderá en breve..._\n\nSerá atendido por @50492280729 *🖐🏻Solo para asuntos importantes, no molestar.*`, m)
}

if (command == 'tes3') {
  await conn.reply(m.chat, `🌐 Únete a nuestro grupo: \nhttps://chat.whatsapp.com/Cy42GegnKSmCVA6zxWlxKU?mode=ac_t`, m)
}
}
handler.command = /^tes|tes2|tes3$/i
