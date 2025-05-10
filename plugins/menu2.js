import { getDevice } from "@whiskeysockets/baileys"
import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'
import axios from 'axios'

// Detectar comandos desde los archivos en /plugins
const obtenerComandos = () => {
  const pluginFolder = './plugins'
  let comandos = []

  fs.readdirSync(pluginFolder).forEach(file => {
    const filePath = path.join(pluginFolder, file)
    if (fs.lstatSync(filePath).isFile() && file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8')
      const match = content.match(/handler\.command\s*=\s*([^]*)/)
      if (match) {
        const arrayContent = match[1]
        const extraidos = arrayContent
          .split(',')
          .map(c => c.trim().replace(/^['"`]|['"`]$/g, ''))
          .filter(c => c.length > 0)
        comandos.push(...extraidos)
      }
    }
  })

  return [...new Set(comandos)].sort()
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let delirius = await axios.get(`https://delirius-apiofc.vercel.app/tools/country?text=${PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')}`)
  let paisdata = delirius.data.result
  let mundo = paisdata ? `${paisdata.name} ${paisdata.emoji}\n│ 🗓️ *Fecha:* ${paisdata.date}\n│ 🕒 *Hora local:* ${paisdata.time12}` : 'Desconocido'
  let jpg = 'https://files.catbox.moe/rdyj5q.mp4'
  let jpg2 = 'https://files.catbox.moe/693ws4.mp4'
  let or = ['grupo', 'gif', 'anu']
  let media = or[Math.floor(Math.random() * or.length)]
  const thumbnail = await (await fetch(icono)).buffer()

  // Obtener comandos desde la carpeta plugins
  const listaComandos = obtenerComandos().map(c => `│ ➜ ${usedPrefix}${c}`).join('\n')

  let txt = `🗣️ Hola, *🥀Buenos días🌅tardes🌇noches🌆*

⚡ \`izuBot:\` Es un sistema automático que responde a comandos para realizar ciertas acciones dentro del \`Chat\` como las descargas de videos de diferentes plataformas y búsquedas en la \`Web\`.

━━━━━━━━━━━━━
⁉ ᴄᴏɴᴛᴇxᴛ-ɪɴғᴏ☔
┌────────────
│ 🚩 Nombre: ${m.pushName}
│ 🌎 País: ${mundo}
│ 🗓 Fecha: ${moment.tz('America/Bogota').format('DD/MM/YY')}
└────────────

⁉ todos los comandos
┌────────────
${listaComandos}
└────────────`

  m.react('🏖️')

  if (media === 'grupo') {
    await conn.sendMessage(m.chat, {
      text: txt,
      contextInfo: {
        externalAdReply: {
          title: wm,
          body: textbot,
          thumbnailUrl: redes,
          thumbnail,
          sourceUrl: redes,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
  }

  if (media === 'gif') {
    await conn.sendMessage(m.chat, {
      video: { url: [jpg, jpg2].getRandom() },
      gifPlayback: true,
      caption: txt,
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
          thumbnailUrl: redes,
          thumbnail,
          sourceUrl: redes,
          mediaType: 1,
          showAdAttribution: true
        },
      },
    }, { quoted: m })
  }

  if (media === 'anu') {
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
          thumbnailUrl: redes,
          thumbnail,
          sourceUrl: redes,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: m })
  }
}

handler.command = ['menurandom', 'menu2']
handler.group = true
export default handler
