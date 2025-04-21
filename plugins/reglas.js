import { getDevice } from "@whiskeysockets/baileys"
import PhoneNumber from 'awesome-phonenumber'
let handler = async (m, { conn, args, usedPrefix, command }) => {

m.react('🍉')
let txt = `_Hola *${m.pushName}* ¿Cómo estás?_\n\n\`⚖️TÉRMINOS Y CONDICIONES DEL SERVICIO\`\n> ${e} IZUBOT y su desarrollador no se hacen responsables por el uso, gestión, contenido compartido, privacidad ni por los números involucrados en las interacciones con el bot.\n\nEl uso del bot es completamente bajo tu propia responsabilidad. Te recomendamos usarlo de forma consciente y segura.\n.*[🗓]Fecha:* _${moment.tz('America/Bogota').format('DD/MM/YY')}_`
await conn.sendMessage(m.chat, {
      text: txt,
      footer: textbot,
      contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
              newsletterJid: channelRD.id,
              newsletterName: channelRD.name,
              serverMessageId: -1,
          },
          forwardingScore: false,
          externalAdReply: {
              title: botname,
              body: textbot,
              thumbnailUrl: icono,
              mediaType: 1,
              showAdAttribution: true,
              renderLargerThumbnail: true,
          },
      },
  }, { quoted: m });
    }
handler.command = ['reglas', 'términos', 'condiciones']
export default handler
