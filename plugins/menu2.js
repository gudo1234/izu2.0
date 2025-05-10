import fs from 'fs'
import path from 'path'
import { getDevice } from "@whiskeysockets/baileys"
import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
import fetch from 'node-fetch'
import axios from 'axios'

// Función para extraer comandos desde un archivo
const extractCommands = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const match = content.match(/handler\.command\s*=\s*([^]+)/)
    if (match) {
      const commandsArray = eval(match[1])
      return Array.isArray(commandsArray) ? commandsArray.map(cmd => cmd.trim().replace(/['"`]/g, '')) : []
    }
  } catch (err) {
    console.error(`Error leyendo ${filePath}:`, err)
  }
  return []
}

const getCommandsFromDir = (dir, prefix) => {
  try {
    const files = fs.readdirSync(dir).filter(file => file.startsWith(prefix) && file.endsWith('.js'))
    let allCommands = []
    for (const file of files) {
      const commands = extractCommands(path.join(dir, file))
      allCommands.push(...commands)
    }
    return allCommands
  } catch (e) {
    console.error(`Error leyendo directorio ${dir}:`, e)
    return []
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let delirius = await axios.get(`https://delirius-apiofc.vercel.app/tools/country?text=${PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')}`)
  let paisdata = delirius.data.result
  let mundo = paisdata ? `${paisdata.name} ${paisdata.emoji}\n│ 🗓️ *Fecha:* ${paisdata.date}\n│ 🕒 *Hora local:* ${paisdata.time12}` : 'Desconocido'

  let jpg = 'https://files.catbox.moe/rdyj5q.mp4'
  let jpg2 = 'https://files.catbox.moe/693ws4.mp4'
  let or = ['grupo', 'gif', 'anu']
  let media = or[Math.floor(Math.random() * 3)]

  const thumbnail = await (await fetch(icono)).buffer()

  // Lee comandos desde archivos en ./plugins
  let anime = getCommandsFromDir('../plugins', 'anime-sexo.js').join('\n│ ') || 'Sin comandos disponibles'
  let fun = getCommandsFromDir('../plugins', 'fun-').join('\n│ ') || 'Sin comandos disponibles'
  let nsfw = getCommandsFromDir('../plugins', 'nsfw-').join('\n│ ') || 'Sin comandos disponibles'

  let txt = `🗣️ Hola, *🥀Buenos días🌅tardes🌇noches🌆*\n\n⚡ \`izuBot:\` Es un sistema automático que responde a comandos para realizar ciertas acciones dentro del \`Chat\`.

━━━━━━━━━━━━━
⁉ ᴄᴏɴᴛᴇxᴛ-ɪɴғᴏ☔
┌────────────
│ 🚩 Nombre: ${m.pushName}
│ 🌎 País: ${mundo}
│ 🗓 Fecha: ${moment.tz('America/Bogota').format('DD/MM/YY')}
└────────────

⁉ anime
┌────────────
│ ${anime}
└────────────

⁉ fun
┌────────────
│ ${fun}
└────────────

⁉ nsfw
┌────────────
│ ${nsfw}
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
          showAdAttribution: true,
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
