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

  const comandosPorCategoria = (categoria) => {
    return Object.entries(global.plugins)
      .filter(([file, plugin]) => {
        let fileName = path.basename(file)
        return fileName.toLowerCase().startsWith(categoria) && plugin?.command
      })
      .flatMap(([_, plugin]) =>
        Array.isArray(plugin.command) ? plugin.command : [plugin.command]
      )
      .map(cmd => `│ ${e}${cmd} *‹@υsєя›*`)
      .sort()
      .join('\n') || '│ (No se encontraron comandos)'
  }

  const comandosAnime = comandosPorCategoria('anime')
  //const comandosFun = comandosPorCategoria('fun')
  const comandosFun = `${comandosPorCategoria('fun')} *‹@υsєя›*`;
  const comandosNsfw = comandosPorCategoria('nsfw')

  let txt = `🗣️ _¡Hola!,_ *🥀¡Muy buenos días🌅, tardes🌇 o noches🌆!*\n\n> ⚡ \`izuBot:\` es un sistema automatizado diseñado para interactuar mediante comandos. Permite realizar acciones como descargar videos de distintas plataformas, hacer búsquedas en la \`web\`, y disfrutar de una variedad de juegos dentro del \`chat\`.

━━━━━━━━━━━━━
\`❒ᴄᴏɴᴛᴇxᴛ-ɪɴғᴏ☔\`
┌────────────
│ 🚩 Nombre: ${m.pushName}
│ 🌎 País: ${mundo}
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

\`✡ғᴜɴᴄɪóɴ ɢʀᴜᴘᴏ⚙️\`
┌────────────
│ ${e}${s}kick *‹@υsєя›*
│ ${e}${s}link
│ ${e}${s}admins *‹τ×τ›*
│ ${e}${s}infogrupo
│ ${e}${s}tagall *‹τ×τ›*
│ ${e}${s}hideteg *‹τ×τ›*
│ ${e}${s}tag *‹rєρℓy›*
│ ${e}${s}icongc *‹rєρℓy›*
│ ${e}${s}grupo *‹αвrir/cєrrαr›*
│ ${e}${s}promote *‹@υsєя›*
│ ${e}${s}demote *‹@υsєя›*
│ ${e}${s}encuesta *‹›*
└────────────

\`➠ᴄᴏɴғɪɢ - ᴏɴ/ᴏғғ🔹\`
┌────────────
│ ${e}${s}on/off
│ ${e}${s}welcome *‹on/off›*
│ ${e}${s}autoaceptar *‹on/off›*
│ ${e}${s}soloadmin *‹on/off›*
│ ${e}${s}nsfw *‹on/off›*
│ ${e}${s}modohorny *‹on/off›*
│ ${e}${s}detect *‹on/off›*
│ ${e}${s}antilink *‹on/off›*
│ ${e}${s}antifake *‹on/off›*
└────────────

\`✜ᴅᴇsᴄᴀʀɢᴀs ᴍᴜʟᴛɪᴍᴇᴅɪᴀ📂\`
┌────────────
│ ${e}${s}play *‹τ×τ›*
│ ${e}${s}play2 *‹τ×τ›*
│ ${e}${s}play3 *‹τ×τ›*
│ ${e}${s}play4 *‹τ×τ›*
│ ${e}${s}facebook *‹υяʟ›*
│ ${e}${s}instagram *‹υяʟ›*
│ ${e}${s}tiktokvid *‹τ×τ›*
│ ${e}${s}tiktok *‹υяʟ›*
│ ${e}${s}tiktokimg *‹υяʟ›*
│ ${e}${s}twitter *‹υяʟ›*
│ ${e}${s}mediafire *‹υяʟ›*
│ ${e}${s}apk *‹τ×τ›*
│ ${e}${s}gitclone *‹υяʟ›*
│ ${e}${s}porno *‹τ×τ›*
│ ${e}${s}xnxxdl *‹υяʟ›*
│ ${e}${s}xvideosdl *‹υяʟ›*
│ ${e}${s}imagen *‹τ×τ›*
│ ${e}${s}pinterest *‹υяʟ›*
│ ${e}${s}ytmp3 *‹υяʟ›*
│ ${e}${s}ytmp4 *‹υяʟ›*
│ ${e}${s}ytmp3doc *‹υяʟ›*
│ ${e}${s}ytmp4doc *‹υяʟ›*
│ ${e}${s}spotify *‹τ×τ›*
│ ${e}${s}spotifydl *‹υяʟ›*
│ ${e}${s}mega *‹υяʟ›*
│ ${e}${s}gdrive *‹υяʟ›*
│ ${e}${s}terabox *‹υяʟ›*
└────────────

\`✘ʜᴇʀʀᴀᴍɪᴇɴᴛᴀs🧮\`
┌────────────
│ ${e}${s}toptt ‹rєρℓy›
│ ${e}${s}tovid ‹rєρℓy›
│ ${e}${s}tomp3 ‹rєρℓy›
│ ${e}${s}toimg ‹rєρℓy›
│ ${e}${s}ver ‹rєρℓy›
│ ${e}${s}hd ‹rєρℓy›
│ ${e}${s}ssweb ‹υяʟ›
│ ${e}${s}vcard #
│ ${e}${s}whamusic ‹rєρℓy›
│ ${e}${s}par ...
└────────────

\`✔sᴛɪᴄᴋᴇʀ - ᴍᴀᴋᴇʀ🧩\`
┌────────────
│ ${e}${s}sticker ‹rєρℓy›
│ ${e}${s}sticker2 ‹rєρℓy›
│ ${e}${s}sticker -c ‹rєρℓy›
│ ${e}${s}emojimix 😍+🥰
│ ${e}${s}qc ‹τ×τ›
│ ${e}${s}brat ‹τ×τ›
│ ${e}${s}bratvid ‹τ×τ›
│ ${e}${s}wm ‹τ×τ›
│ ${e}${s}take ‹τ×τ›
│ ${e}${s}ttp ‹τ×τ›
│ ${e}${s}tweet ‹τ×τ›
└────────────

\`✏ʙᴜsᴄᴀᴅᴏʀ - ᴡᴇʙ🔎\`
┌────────────
│ ${e}${s}chatgpt *‹τ×τ›*
│ ${e}${s}ia *‹τ×τ›*
│ ${e}${s}gemini *‹τ×τ›*
│ ${e}${s}bot *‹τ×τ›*
│ ${e}${s}ytsearch *‹τ×τ›*
│ ${e}${s}perfil *‹rєρℓy›*
│ ${e}${s}spotifysearch *‹τ×τ›*
│ ${e}${s}xnxxsearch *‹τ×τ›*
│ ${e}${s}xvideosearch *‹τ×τ›*
│ ${e}${s}githubsearch *‹τ×τ›*
└────────────

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
└────────────

\`✑ᴏᴘᴄɪᴏɴᴇs/ᴏᴡɴᴇʀ🔥\`
┌────────────
│ ${e}${s}update *‹›*
│ ${e}${s}join *‹ł¡หк›*
│ ${e}${s}=> *‹rєρℓy›*
│ ${e}${s}restart *‹›*
│ ${e}${s}$ *‹›*
│ ${e}${s}antiprivado *‹ᴏɴ/ᴏғғ›*
│ ${e}${s}icon *‹rєρℓy›*
│ ${e}${s}salir *‹›*
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

handler.command = ['menu', 'memu', 'help', 'comandos', 'memu', 'menú', 'memú', 'm']
handler.group = true
export default handler
