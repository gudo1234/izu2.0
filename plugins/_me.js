import { getDevice } from "@whiskeysockets/baileys"
import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
import axios from 'axios'
import fetch from 'node-fetch'
import path from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let delirius = await axios.get(`https://delirius-apiofc.vercel.app/tools/country?text=${PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')}`)
  let paisdata = delirius.data.result
  let mundo = paisdata ? `${paisdata.name} ${paisdata.emoji}\n│ 🗓️ *Fecha:* ${paisdata.date}\n│ 🕒 *Hora local:* ${paisdata.time12}` : 'Desconocido'

  let jpg = 'https://files.catbox.moe/rdyj5q.mp4'
  let jpg2 = 'https://files.catbox.moe/693ws4.mp4'
  let or = ['grupo', 'gif', 'anu']
  let media = or[Math.floor(Math.random() * or.length)]

  const thumbnail = await (await fetch(icono)).buffer()

  // Función que obtiene y formatea comandos con emoji
  const comandosPorCategoria = (categoria, emoji) => {
    return Object.entries(global.plugins)
      .filter(([file, plugin]) => {
        let fileName = path.basename(file)
        return fileName.toLowerCase().startsWith(categoria) && plugin?.command
      })
      .flatMap(([_, plugin]) =>
        Array.isArray(plugin.command) ? plugin.command : [plugin.command]
      )
      .map(cmd => `│ ${emoji} ➜ ${usedPrefix}${cmd}`)
      .sort()
      .join('\n') || '│ (No se encontraron comandos)'
  }

  // Generamos las listas con sus emojis
  const comandosAnime = comandosPorCategoria('anime', '😍')
  const comandosFun   = comandosPorCategoria('fun',   '🔥')
  const comandosNsfw  = comandosPorCategoria('nsfw',  '🥵')

  let txt = `🗣️ Hola, *🥀Buenos días🌅tardes🌇noches🌆*

⚡ \`izuBot:\` Es un sistema automático que responde a comandos para realizar ciertas acciones dentro del \`Chat\` como las descargas de videos de diferentes plataformas y búsquedas en la \`Web\`.

━━━━━━━━━━━━━
⁉ ᴄᴏɴᴛᴇxᴛ-ɪɴғᴏ☔
┌────────────
│ 🚩 Nombre: ${m.pushName}
│ 🌎 País: ${mundo}
│ 🗓 Fecha: ${moment.tz('America/Bogota').format('YYYY-MM-DD')}
│ 🕒 Hora local: ${moment.tz('America/Bogota').format('hh:mm:ss A')}
│ 📅 Fecha: ${moment.tz('America/Bogota').format('DD/MM/YY')}
└────────────

⁉ Comandos anime, fun y nsfw

┌───《 ANIME 》───
${comandosAnime}
├───《 FUN 》─────
${comandosFun}
└───《 NSFW 》────
${comandosNsfw}`

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
      video: { url: [jpg, jpg2].sort(() => Math.random() - 0.5)[0] },
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

handler.command = ['me']
handler.group = true
export default handler
