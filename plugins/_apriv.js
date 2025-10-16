import { prepareWAMessageMedia } from '@whiskeysockets/baileys'
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

//const icono = 'https://i.imgur.com/JQp4d9A.jpeg' // imagen ejemplo
const { imageMessage } = await prepareWAMessageMedia({
image: { url: icono }
}, { upload: conn.waUploadToServer })

const sections = [
{
title: "💻Información",
highlight_label: "Más detalles",
rows: [
{ header: "", title: "¿Qué más sabes hacer?", description: "", id: ".tes" }
]
},
{
title: "🤖Servicio",
highlight_label: "ASESOR",
rows: [
{ header: "", title: "Hablar con su desarrollador", description: "", id: ".tes2" },
{ header: "", title: "📅Horario", description: "", id: ".tes4" }
]
},
{
title: "🌐Convivir",
highlight_label: "Únete a nuestra comunidad",
rows: [
{ header: "", title: "Grupo", description: "", id: ".tes3" }
]
}
]

const buttonParamsJson = JSON.stringify({
title: "OPCIONES",
description: "Seleccione una opción",
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
buttons: [{
name: "single_select",
buttonParamsJson: buttonParamsJson
}]
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
await m.reply(`🖐🏻 ¡Hola! ${m.pushName}, mi nombre es ${wm} y fui desarrollada para cumplir múltiples funciones en WhatsApp 🪀.

✧──────‧₊˚📁˚₊‧──────╮
│ Tengo muchos comandos
│ con diferentes funciones
│ como la descarga de videos,
│ audios, fotos y mucho más,
│ contiene búsquedas con
│ chatGPT y diversos juegos.
✧──────‧₊˚🎠˚₊‧──────╯

╭︶︶︶︶︶🌐︶︶︶︶︶╮
Síguenos en nuestro canal
y mantente informado....
╰︶︶︶︶︶🎉︶︶︶︶︶╯`)

await conn.relayMessage(m.chat, { viewOnceMessage: { message } }, {})
conn.sendFile(m.chat, [vn, vn2].getRandom(), 'prueba3.mp3', null, null, true, {
type: 'audioMessage',
ptt: true
})

user.pc = new Date * 1
}

// === COMANDOS TES ===
let handler = async (m, { conn, usedPrefix, command }) => {
if (command == 'tes') {
conn.reply(m.chat, `> 🤖 _Además te ofrecemos funciones necesarias para tus grupos, por ejemplo el antilink, antiárabe y bienvenida automática y muchos más, todo lo puedes encontrar en el .menu._`, m)
}

if (command == 'tes2') {
let teks = `🗿 *Hola creador* ⭐ El número Wa.me/${m.sender.split`@`[0]} quiere de tus servicios`
conn.reply('50492280729@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, { contextInfo: { mentionedJid: [m.sender] }})
conn.reply(m.chat, `⚖️ _Por favor espere, nuestro siguiente asesor disponible le atenderá en breve..._\n\nSerá atendido por @50492280729 *🖐🏻 Solo para asuntos importantes, no molestar.*`, m)
}

if (command == 'tes3') {
conn.reply(m.chat, `https://chat.whatsapp.com/Cy42GegnKSmCVA6zxWlxKU?mode=ac_t`, m)
}
}
handler.command = ['tes', 'tes2', 'tes3']
export default handler
