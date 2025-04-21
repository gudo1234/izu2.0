import os from 'os'
import { getDevice } from "@whiskeysockets/baileys"
import moment from 'moment-timezone'
import util from 'util'
import ws from 'ws';
import sizeFormatter from 'human-readable'
let MessageType =  (await import(global.baileys)).default
let handler = async (m, { conn, text, command }) => {
const fechahon = moment().tz('America/Tegucigalpa').format('DD/MM HH:mm')
let id = text ? text : m.chat
let txt = `${e} _Los recursos se an agotado para este grupo, comuniquese con mi propietario para reactivar._\n\n*Fecha de Salida:* ${fechahon}\n*ID*: ${await conn.getName(m.chat)}`
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
              //thumbnail: redes,
              sourceUrl: redes,
              mediaType: 1,
              showAdAttribution: true,
              //renderLargerThumbnail: true,
          },
      },
  }, { quoted: null })};
await conn.groupLeave(id)}

handler.customPrefix = /^(♻️|.salir)$/i
handler.command = new RegExp
handler.group = true
handler.owner = true

export default handler
