import { getDevice } from "@whiskeysockets/baileys"
import PhoneNumber from 'awesome-phonenumber'
let handler = async (m, { conn, args, usedPrefix, command }) => {

let name = await conn.getName(m.sender)
m.react('🍉')
let txt = `_Hola *${m.pushName}* ¿Cómo estás?_\n\n\`⚖️TÉRMINOS Y CONDICIONES DEL SERVICIO\`\n> ${e} IZUBOT, NI EL DESARROLLADOR NO SE HACE RESPONSABLE DEL USO, NÚMERO, PRIVACIDAD Y CONTENIDO MANDADO, O USADO O GESTIONADO POR USTEDES O EL BOT (usarlo bajo tu responsabilidad)\n.*[🗓]Fecha:* _${moment.tz('America/Bogota').format('DD/MM/YY')}_`
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
