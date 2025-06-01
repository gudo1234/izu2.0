import { getDevice } from "@whiskeysockets/baileys"
import PhoneNumber from 'awesome-phonenumber'
import axios from 'axios'
import fetch from 'node-fetch'
import path from 'path'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let mundo = 'Desconocido'
  try {
    let delirius = await axios.get(`https://delirius-apiofc.vercel.app/tools/country?text=${PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')}`)
    let paisdata = delirius.data.result
    if (paisdata) {
      mundo = `${paisdata.name} ${paisdata.emoji}\n│ 🗓️ *Fecha:* ${paisdata.date}\n│ 🕒 *Hora local:* ${paisdata.time12}`
    }
  } catch (err) {
    console.error('[ERROR EN API DELIRIUS]', err)
    mundo = 'Desconocido'
  }

 // const icono = 'https://telegra.ph/file/1234567890abcdef.jpg' // URL del ícono para sticker y thumbnail
 // const redes = 'https://github.com/tubot' // URL que se abrirá al tocar el preview
  const wm = '🧩 izuBot-MD'
  const textbot = 'Bot WhatsApp multi-función con menús dinámicos.'

 // const e = '➤'
  //const s = usedPrefix

  const comandosPorCategoria = (categoria, emoji) => {
    return Object.entries(global.plugins)
      .filter(([file, plugin]) => {
        let fileName = path.basename(file)
        return fileName.toLowerCase().startsWith(categoria) && plugin?.command
      })
      .flatMap(([_, plugin]) =>
        Array.isArray(plugin.command) ? plugin.command : [plugin.command]
      )
      .map(cmd => `│ ${e + s}${cmd} ${emoji}`)
      .sort()
      .join('\n') || '│ (No se encontraron comandos)'
  }

  const comandosAnime = comandosPorCategoria('anime', '*‹@υsєя›*')
  const comandosFun   = comandosPorCategoria('fun',   '*‹rєρℓy›*')
  const comandosNsfw  = comandosPorCategoria('nsfw',  '*‹@υsєя›*')

  let txt = `${e} _¡Hola!_ *🥀¡Muy buenos días🌅, tardes🌇 o noches🌆!*\n
> ⚡ \`izuBot:\` es un sistema automatizado diseñado para interactuar mediante comandos.

━━━━━━━━━━━━━
\`❒ᴄᴏɴᴛᴇxᴛ-ɪɴғᴏ☔\`
┌────────────
│ 🚩 *Nombre:* ${m.pushName}
│ 🌎 *País:* ${mundo}
│ 📱 *Sistema/Opr:* ${getDevice(m.key.id)}
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
└────────────`

  m.react('🏖️')

  // Generar el sticker
  let stiker2 = await sticker(icono, false, wm)

  await conn.sendFile(m.chat, stiker2, 'sticker.webp', '', null, true, {
    contextInfo: {
      externalAdReply: {
        title: wm,
        body: textbot,
        mediaType: 1,
        sourceUrl: redes,
        thumbnail: await (await fetch(icono)).buffer()
      }
    }
  }, { quoted: m })
}

handler.command = ['st']
handler.group = true
export default handler
