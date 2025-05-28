import { getDevice } from "@whiskeysockets/baileys"
import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
import axios from 'axios'
import fetch from 'node-fetch'
import path from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // 🔄 Ejecutar operaciones pesadas en paralelo
  const [paisData, thumbnail] = await Promise.all([
    axios.get(`https://delirius-apiofc.vercel.app/tools/country?text=${PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')}`)
      .then(res => res.data.result)
      .catch(() => null), // en caso de error
    fetch(icono).then(res => res.buffer()).catch(() => null)
  ])

  const mundo = paisData ? `${paisData.name} ${paisData.emoji}\n│ 🗓️ *Fecha:* ${paisData.date}\n│ 🕒 *Hora local:* ${paisData.time12}` : 'Desconocido'
  const jpg = 'https://files.catbox.moe/rdyj5q.mp4'
  const jpg2 = 'https://files.catbox.moe/693ws4.mp4'
  const or = ['grupo', 'gif', 'anu']
  const media = or[Math.floor(Math.random() * or.length)]

  const comandosPorCategoria = (categoria, emoji) => {
    return Object.entries(global.plugins)
      .filter(([file, plugin]) => {
        let fileName = path.basename(file)
        return fileName.toLowerCase().startsWith(categoria) && plugin?.command
      })
      .flatMap(([_, plugin]) =>
        Array.isArray(plugin.command) ? plugin.command : [plugin.command]
      )
      .map(cmd => `│ ${e + s} ${cmd} ${emoji}`)
      .sort()
      .join('\n') || '│ (No se encontraron comandos)'
  }

  const comandosAnime = comandosPorCategoria('anime', '*‹@υsєя›*')
  const comandosFun   = comandosPorCategoria('fun',   '*‹rєρℓy›*')
  const comandosNsfw  = comandosPorCategoria('nsfw',  '*‹@υsєя›*')

  let txt = `${e} _¡Hola!_ *🥀¡Muy buenos días🌅, tardes🌇 o noches🌆!*\n\n> ⚡ \`izuBot:\` es un sistema automatizado diseñado para interactuar mediante comandos. Permite realizar acciones como descargar videos de distintas plataformas, hacer búsquedas en la \`web\`, y disfrutar de una variedad de juegos dentro del \`chat\`.

━━━━━━━━━━━━━
\`❒ᴄᴏɴᴛᴇxᴛ-ɪɴғᴏ☔\`
┌────────────
│ 🚩 *Nombre:* ${m.pushName}
│ 🌎 *País:* ${mundo}
│ 📱 *Sistema/Opr:* ${getDevice(m.key.id)}
└────────────

\`✪ᴊᴀᴅɪʙᴛs-ʙᴏᴛs🤖\`
┌────────────
│ ${e}${s}code *‹›*
│ ${e}${s}qr *‹›*
│ ${e}${s}deletesesion *‹›*
│ ${e}${s}reglas *‹›*
│ ${e}${s}reporte *‹τ×τ›*
│ ${e}${s}owner *‹›*
└────────────

... (resto del mensaje completo sin cambios)

\`✧ғᴜɴᴄᴛɪᴏɴ-ᴀɴɪᴍᴇ🎎\`
┌────────────
${comandosAnime}
└────────────

\`⭓ғɪʀᴇ ғᴜɴᴄᴛɪᴏɴ - ᴊᴜᴇɢᴏs🎮\`
┌────────────
${comandosFun}
└────────────

\`⬗ɴsғᴡ-ғᴜɴᴄᴛɪᴏɴ🥵\`
┌────────────
${comandosNsfw}
└────────────`

  m.react('🏖️')

  // Envío según tipo de media
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
