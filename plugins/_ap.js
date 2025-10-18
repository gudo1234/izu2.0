/*import axios from 'axios'
import PhoneNum from 'awesome-phonenumber'
import moment from 'moment-timezone'
import { getDevice } from '@whiskeysockets/baileys'
import 'moment/locale/es.js'

moment.locale('es')
const regionNames = new Intl.DisplayNames(['es'], { type: 'region' })

function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return ''
  const codePoints = [...countryCode.toUpperCase()]
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}

// Asignación manual de zonas horarias más precisas por país
const zonasPersonalizadas = {
  HN: 'America/Tegucigalpa',
  MX: 'America/Mexico_City',
  AR: 'America/Argentina/Buenos_Aires',
  CL: 'America/Santiago',
  CO: 'America/Bogota',
  PE: 'America/Lima',
  VE: 'America/Caracas',
  EC: 'America/Guayaquil',
  PA: 'America/Panama',
  DO: 'America/Santo_Domingo',
  GT: 'America/Guatemala',
  SV: 'America/El_Salvador',
  NI: 'America/Managua',
  ES: 'Europe/Madrid',
  US: 'America/New_York',
  BR: 'America/Sao_Paulo',
  PY: 'America/Asuncion',
  UY: 'America/Montevideo'
}

const handler = async (m, { conn, text }) => {
  let target = m.quoted?.sender || m.mentionedJid?.[0] || text
  let own = false

  if (!target) {
    target = m.sender
    own = true
  } else {
    target = target.replace(/\D/g, '') + '@s.whatsapp.net'
    const exists = await conn.onWhatsApp(target)
    if (!exists[0]?.exists) throw '⚠️ Este usuario no existe. Asegúrate de escribir bien el número.'
  }

  const number = target.split('@')[0]
  const name = await conn.getName(target)
  const phoneInfo = PhoneNum('+' + number)
  const countryCode = phoneInfo.getRegionCode('international')
  const country = regionNames.of(countryCode) || 'Desconocido'
  const flag = banderaEmoji(countryCode)
  const formatNum = phoneInfo.getNumber('international')
  const url = 'https://wa.me/' + number

  // Info del país y hora local
  let capital = 'Desconocida'
  let fechaLocal = 'No disponible'
  let horaLocal = 'No disponible'
  try {
    const res = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`)
    const data = res.data[0]
    capital = data.capital?.[0] || 'Desconocida'
    let zona = zonasPersonalizadas[countryCode] || data.timezones?.[0]
    if (zona) {
      const now = moment().tz(zona)
      fechaLocal = now.format('dddd, D [de] MMMM [de] YYYY')
      horaLocal = now.format('h:mm A') // formato 12 horas con am/pm
    }
  } catch (e) {
    console.error('Error obteniendo país:', e)
  }

  // Imagen y bio
  const icono = 'https://cdn-icons-png.flaticon.com/512/124/124034.png'
  let img = await conn.profilePictureUrl(target, 'image').catch(_ => icono)
  let bio = await conn.fetchStatus(target).catch(_ => null)
  let business = await conn.getBusinessProfile(target).catch(_ => null)

  let caption = `✨ *Información de WhatsApp*\n\n`
  caption += `*👤 Nombre:* ${name || '-'}\n`
  caption += `*📱 Número:* ${formatNum}\n`
  caption += `*🌎 País:* ${country} ${flag}\n`
  caption += `*🏙️ Capital:* ${capital}\n`
  caption += `*📅 Fecha local:* ${fechaLocal}\n`
  caption += `*🕒 Hora local:* ${horaLocal}\n`
  caption += `*🔗 Enlace:* ${url}\n`
  caption += `*🏷️ Tag:* @${number}\n`
  caption += `*💬 Bio:* ${bio?.status || '-'}\n`
  caption += `*🕐 Actualizado:* ${bio?.setAt ? moment(bio.setAt).format('LLLL') : '-'}\n`
  caption += `*📱 Sistema/Device:* ${own ? getDevice(m.key.id) : '-'}\n`

  if (business) {
    caption += `\n⚡ *Cuenta Business:*\n`
    caption += `*🆔 ID:* ${business.wid}\n`
    caption += `*🌐 Sitio Web:* ${business.website || '-'}\n`
    caption += `*📧 Email:* ${business.email || '-'}\n`
    caption += `*🏢 Categoría:* ${business.category || '-'}\n`
    caption += `*📍 Dirección:* ${business.address || '-'}\n`
    caption += `*⏰ Zona horaria:* ${business.business_hours?.timezone || '-'}\n`
    caption += `*📝 Descripción:* ${business.description || '-'}\n`
  }

  m.react('🌍')
  await conn.sendMessage(m.chat, {
    image: { url: img },
    caption,
    mentions: [target]
  }, { quoted: m })
}

handler.command = ['ap']
handler.group = true
export default handler*/

import { getDevice } from "@whiskeysockets/baileys"
import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
import 'moment/locale/es.js' // Para mostrar fecha en español
import fetch from 'node-fetch'
import path from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let mundo = 'Desconocido'
  try {
    // Extraer número internacional
    let numero = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', ''))
    let pais = numero.getRegionCode() // ej. "MX", "AR", "CO", etc.
    let nombrePais = new Intl.DisplayNames(['es'], { type: 'region' }).of(pais) // Nombre del país en español

    // Asignar bandera automáticamente según código ISO
    let bandera = String.fromCodePoint(
      ...[...pais.toUpperCase()].map(c => 127397 + c.charCodeAt())
    )

    // Detectar zona horaria del país (por región principal)
    const zonas = {
      MX: 'America/Mexico_City',
      CO: 'America/Bogota',
      AR: 'America/Argentina/Buenos_Aires',
      CL: 'America/Santiago',
      VE: 'America/Caracas',
      PE: 'America/Lima',
      EC: 'America/Guayaquil',
      BO: 'America/La_Paz',
      PY: 'America/Asuncion',
      UY: 'America/Montevideo',
      DO: 'America/Santo_Domingo',
      GT: 'America/Guatemala',
      HN: 'America/Tegucigalpa',
      NI: 'America/Managua',
      CR: 'America/Costa_Rica',
      SV: 'America/El_Salvador',
      PA: 'America/Panama',
      US: 'America/New_York',
      ES: 'Europe/Madrid',
      BR: 'America/Sao_Paulo'
    }

    let zona = zonas[pais] || 'UTC'
    let fecha = moment().tz(zona).format('dddd, D [de] MMMM [de] YYYY')
    let hora = moment().tz(zona).format('hh:mm A')

    mundo = `${nombrePais} ${bandera}\n│ 🗓️ *Fecha:* ${fecha}\n│ 🕒 *Hora local:* ${hora}`
  } catch (err) {
    console.error('[ERROR EN GEOLOCALIZACIÓN LOCAL]', err)
    mundo = 'Desconocido'
  }

  // --- Resto del código original ---
  let jpg = './media/gif.mp4'
  let jpg2 = './media/giff.mp4'
  let or = ['grupo', 'gif', 'anu']
  let media = or[Math.floor(Math.random() * or.length)]

  const thumbnail = await (await fetch(icono)).buffer()

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
└────────────`

let txt2 = `\`✪ᴊᴀᴅɪʙᴛs-ʙᴏᴛs🤖\`
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
│ ${e}${s}kicknum *‹#?›*
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
│ ${e}${s}everyone *‹›*
└────────────

\`➠ᴄᴏɴғɪɢ - ᴏɴ/ᴏғғ🔹\`
┌────────────
│ ${e}${s}on/off
│ ${e}${s}welcome *‹on/off›*
│ ${e}${s}autoaceptar *‹on/off›*
│ ${e}${s}soloadmin *‹on/off›*
│ ${e}${s}nsfw *‹on/off›*
│ ${e}${s}detect *‹on/off›*
│ ${e}${s}antilink *‹on/off›*
│ ${e}${s}antifake *‹on/off›*
│ ${e}${s}autosticker *‹on/off›*
│ ${e}${s}autoband *‹on/off›*
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
│ ${e}${s}porno2 *‹τ×τ›*
│ ${e}${s}xnxxdl *‹υяʟ›*
│ ${e}${s}xvideosdl *‹υяʟ›*
│ ${e}${s}imagen *‹τ×τ›*
│ ${e}${s}pinterest *‹υяʟ/τ×τ›*
│ ${e}${s}ytmp3 *‹υяʟ›*
│ ${e}${s}ytmp4 *‹υяʟ›*
│ ${e}${s}ytmp3doc *‹υяʟ›*
│ ${e}${s}ytmp4doc *‹υяʟ›*
│ ${e}${s}spotify *‹τ×τ›*
│ ${e}${s}spotifydl *‹υяʟ›*
│ ${e}${s}mega *‹υяʟ›*
│ ${e}${s}terabox *‹υяʟ›*
│ ${e}${s}gdrive *‹υяʟ›*
└────────────

\`✘ʜᴇʀʀᴀᴍɪᴇɴᴛᴀs🧮\`
┌────────────
│ ${e}${s}calendario ‹›
│ ${e}${s}toptt ‹rєρℓy›
│ ${e}${s}tovid ‹rєρℓy›
│ ${e}${s}tomp3 ‹rєρℓy›
│ ${e}${s}toimg ‹rєρℓy›
│ ${e}${s}tourl ‹rєρℓy›
│ ${e}${s}ver ‹rєρℓy›
│ ${e}${s}hd ‹rєρℓy›
│ ${e}${s}ssweb ‹υяʟ›
│ ${e}${s}vcard #
│ ${e}${s}whamusic ‹rєρℓy›
└────────────

\`✔sᴛɪᴄᴋᴇʀ - ᴍᴀʀᴋᴇʀ/ʟᴏɢᴏ🧩\`
┌────────────
│ ${e}${s}sticker ‹rєρℓy›
│ ${e}${s}sticker2 ‹rєρℓy›
│ ${e}${s}sticker -c ‹rєρℓy›
│ ${e}${s}emojimix 😍+🥰
│ ${e}${s}qc ‹τ×τ›
│ ${e}${s}brat ‹τ×τ›
│ ${e}${s}bratvid ‹τ×τ›
│ ${e}${s}fakengl ‹style› ‹title› ‹msg›
│ ${e}${s}wm ‹τ×τ›
│ ${e}${s}take ‹τ×τ›
│ ${e}${s}ttp ‹τ×τ›
│ ${e}${s}tweet ‹τ×τ›
│ ${e}${s}stickers *‹τ×τ›*
│ ${e}${s}par ...
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
│ ${e}${s}tiktoksearch *‹τ×τ›*
│ ${e}${s}noticias *‹›*
│ ${e}${s}githubsearch *‹τ×τ›*
│ ${e}${s}fetch ‹υяʟ›
│ ${e}${s}google *‹τ×τ›*
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

let txt3 = `\`✪ᴊᴀᴅɪʙᴛs-ʙᴏᴛs🤖\`
> ${s + usedPrefix}code ⬄ ${usedPrefix}qr  
> ${s + usedPrefix}deletesesion ⬌ ${usedPrefix}reglas  
> ${s + usedPrefix}reporte ⬄ ${usedPrefix}owner

\`✡ғᴜɴᴄɪóɴ ɢʀᴜᴘᴏ⚙️\`
> ${s + usedPrefix}kick ⬄ ${usedPrefix}kicknum  
> ${s + usedPrefix}link ⬌ ${usedPrefix}admins  
> ${s + usedPrefix}infogrupo ⬄ ${usedPrefix}tagall  
> ${s + usedPrefix}hideteg ⬌ ${usedPrefix}tag  
> ${s + usedPrefix}icongc ⬄ ${usedPrefix}grupo  
> ${s + usedPrefix}promote ⬌ ${usedPrefix}demote  
> ${s + usedPrefix}everyone

\`➠ᴄᴏɴғɪɢ - ᴏɴ/ᴏғғ🔹\`
> ${s + usedPrefix}on/off ⬄ ${usedPrefix}welcome  
> ${s + usedPrefix}autoaceptar ⬌ ${usedPrefix}soloadmin  
> ${s + usedPrefix}nsfw ⬄ ${usedPrefix}detect  
> ${s + usedPrefix}antilink ⬌ ${usedPrefix}antifake  
> ${s + usedPrefix}autosticker ⬄ ${usedPrefix}autoband  

\`✜ᴅᴇsᴄᴀʀɢᴀs ᴍᴜʟᴛɪᴍᴇᴅɪᴀ📂\`
> ${s + usedPrefix}play ⬄ ${usedPrefix}play2  
> ${s + usedPrefix}play3 ⬌ ${usedPrefix}play4  
> ${s + usedPrefix}facebook ⬄ ${usedPrefix}instagram  
> ${s + usedPrefix}tiktokvid ⬌ ${usedPrefix}tiktok  
> ${s + usedPrefix}tiktokimg ⬄ ${usedPrefix}twitter  
> ${s + usedPrefix}mediafire ⬌ ${usedPrefix}apk  
> ${s + usedPrefix}gitclone ⬄ ${usedPrefix}porno  
> ${s + usedPrefix}porno2 ⬌ ${usedPrefix}xnxxdl  
> ${s + usedPrefix}xvideosdl ⬄ ${usedPrefix}imagen  
> ${s + usedPrefix}pinterest ⬌ ${usedPrefix}ytmp3  
> ${s + usedPrefix}ytmp4 ⬄ ${usedPrefix}ytmp3doc  
> ${s + usedPrefix}ytmp4doc ⬌ ${usedPrefix}spotify  
> ${s + usedPrefix}spotifydl ⬄ ${usedPrefix}mega  
> ${s + usedPrefix}terabox ⬌ ${usedPrefix}gdrive 

\`✘ʜᴇʀʀᴀᴍɪᴇɴᴛᴀs🧮\`
> ${s + usedPrefix}calendario ⬄ ${usedPrefix}toptt  
> ${s + usedPrefix}tovid ⬌ ${usedPrefix}tomp3  
> ${s + usedPrefix}toimg ⬄ ${usedPrefix}ver
> ${s + usedPrefix}tourl ⬌ ${usedPrefix}hd
> ${s + usedPrefix}ssweb ⬄ ${usedPrefix}vcard
> ${s + usedPrefix}whamusic  

\`✔sᴛɪᴄᴋᴇʀ - ᴍᴀʀᴋᴇʀ/ʟᴏɢᴏ🧩\`
> ${s + usedPrefix}sticker ⬄ ${usedPrefix}sticker2  
> ${s + usedPrefix}sticker -c ⬌ ${usedPrefix}emojimix  
> ${s + usedPrefix}qc ⬄ ${usedPrefix}brat  
> ${s + usedPrefix}bratvid ⬌ ${usedPrefix}fakengl  
> ${s + usedPrefix}wm ⬄ ${usedPrefix}take  
> ${s + usedPrefix}ttp ⬌ ${usedPrefix}tweet  
> ${s + usedPrefix}stickers ⬄ ${usedPrefix}par

\`✏ʙᴜsᴄᴀᴅᴏʀ - ᴡᴇʙ🔎\`
> ${s + usedPrefix}chatgpt ⬄ ${usedPrefix}ia  
> ${s + usedPrefix}gemini ⬌ ${usedPrefix}bot  
> ${s + usedPrefix}ytsearch ⬄ ${usedPrefix}perfil  
> ${s + usedPrefix}spotifysearch ⬌ ${usedPrefix}xnxxsearch  
> ${s + usedPrefix}xvideosearch ⬄ ${usedPrefix}tiktoksearch  
> ${s + usedPrefix}noticias ⬌ ${usedPrefix}githubsearch
> ${s + usedPrefix}fetch ⬄ ${usedPrefix}google

\`✧ғᴜɴᴄᴛɪᴏɴ-ᴀɴɪᴍᴇ🎎\`
> ${s + usedPrefix}abrazar ⬄ ${usedPrefix}aburrido  
> ${s + usedPrefix}acariciar ⬌ ${usedPrefix}acurrucarse  
> ${s + usedPrefix}amor ⬄ ${usedPrefix}angry  
> ${s + usedPrefix}aplaudir ⬌ ${usedPrefix}asustada  
> ${s + usedPrefix}bailar ⬄ ${usedPrefix}bath  
> ${s + usedPrefix}bañarse ⬌ ${usedPrefix}besar  
> ${s + usedPrefix}bite ⬄ ${usedPrefix}bleh  
> ${s + usedPrefix}blush ⬌ ${usedPrefix}bofetada  
> ${s + usedPrefix}bored ⬄ ${usedPrefix}borracho  
> ${s + usedPrefix}cafe ⬌ ${usedPrefix}café  
> ${s + usedPrefix}clap ⬄ ${usedPrefix}coffee  
> ${s + usedPrefix}comer ⬌ ${usedPrefix}correr  
> ${s + usedPrefix}cry ⬄ ${usedPrefix}cuddle  
> ${s + usedPrefix}dance ⬌ ${usedPrefix}dormir  
> ${s + usedPrefix}drunk ⬄ ${usedPrefix}eat  
> ${s + usedPrefix}embarazar ⬌ ${usedPrefix}enamorada  
> ${s + usedPrefix}enojado ⬄ ${usedPrefix}facepalm  
> ${s + usedPrefix}feliz ⬌ ${usedPrefix}fumar  
> ${s + usedPrefix}golpear ⬄ ${usedPrefix}happy  
> ${s + usedPrefix}hello ⬌ ${usedPrefix}hola  
> ${s + usedPrefix}hug ⬄ ${usedPrefix}kill  
> ${s + usedPrefix}kiss ⬌ ${usedPrefix}lamer  
> ${s + usedPrefix}laugh ⬄ ${usedPrefix}lengua  
> ${s + usedPrefix}lick ⬌ ${usedPrefix}llorar  
> ${s + usedPrefix}love ⬄ ${usedPrefix}matar  
> ${s + usedPrefix}morder ⬌ ${usedPrefix}palmada  
> ${s + usedPrefix}pat ⬄ ${usedPrefix}pegar  
> ${s + usedPrefix}pensar ⬌ ${usedPrefix}picar  
> ${s + usedPrefix}poke ⬄ ${usedPrefix}pout  
> ${s + usedPrefix}ppcouple ⬌ ${usedPrefix}ppcp  
> ${s + usedPrefix}preg ⬄ ${usedPrefix}preñar  
> ${s + usedPrefix}pucheros ⬌ ${usedPrefix}punch  
> ${s + usedPrefix}reirse ⬄ ${usedPrefix}run  
> ${s + usedPrefix}sad ⬌ ${usedPrefix}scared  
> ${s + usedPrefix}seduce ⬄ ${usedPrefix}seducir  
> ${s + usedPrefix}shy ⬌ ${usedPrefix}slap  
> ${s + usedPrefix}sleep ⬄ ${usedPrefix}smoke  
> ${s + usedPrefix}sonrojarse ⬌ ${usedPrefix}think  
> ${s + usedPrefix}timida ⬄ ${usedPrefix}triste  
> ${s + usedPrefix}waifu

\`⭓ғɪʀᴇ ғᴜɴᴄᴛɪᴏɴ - ᴊᴜᴇɢᴏs🎮\`
> ${s + usedPrefix}amigorandom ⬄ ${usedPrefix}amistad  
> ${s + usedPrefix}aplauso ⬌ ${usedPrefix}chaqueta  
> ${s + usedPrefix}chaqueteame ⬄ ${usedPrefix}chiste  
> ${s + usedPrefix}chupa ⬌ ${usedPrefix}chupalo  
> ${s + usedPrefix}consejo ⬄ ${usedPrefix}doxear  
> ${s + usedPrefix}doxeo ⬌ ${usedPrefix}doxxeo  
> ${s + usedPrefix}doxxing ⬄ ${usedPrefix}facto  
> ${s + usedPrefix}formarpareja ⬌ ${usedPrefix}formarpareja5  
> ${s + usedPrefix}formarparejas ⬄ ${usedPrefix}formartrio  
> ${s + usedPrefix}frase ⬌ ${usedPrefix}gay  
> ${s + usedPrefix}huevo ⬄ ${usedPrefix}iq  
> ${s + usedPrefix}iqtest ⬌ ${usedPrefix}jalame  
> ${s + usedPrefix}jalamela ⬄ ${usedPrefix}lesbiana  
> ${s + usedPrefix}manca ⬌ ${usedPrefix}manco  
> ${s + usedPrefix}marron ⬄ ${usedPrefix}meme  
> ${s + usedPrefix}memes ⬌ ${usedPrefix}morse  
> ${s + usedPrefix}negro ⬄ ${usedPrefix}nombreninja  
> ${s + usedPrefix}paja ⬌ ${usedPrefix}pajeame  
> ${s + usedPrefix}pajera ⬄ ${usedPrefix}pajero  
> ${s + usedPrefix}pareja ⬌ ${usedPrefix}personalidad  
> ${s + usedPrefix}piropo ⬄ ${usedPrefix}pokedex  
> ${s + usedPrefix}pregunta ⬌ ${usedPrefix}preguntas  
> ${s + usedPrefix}prostituta ⬄ ${usedPrefix}prostituto  
> ${s + usedPrefix}puta ⬌ ${usedPrefix}puto  
> ${s + usedPrefix}rata ⬄ ${usedPrefix}ruletamuerte  
> ${s + usedPrefix}ship ⬌ ${usedPrefix}sorteo  
> ${s + usedPrefix}suicidar ⬄ ${usedPrefix}suicide  
> ${s + usedPrefix}top ⬌ ${usedPrefix}zodia  
> ${s + usedPrefix}zodiac

\`⬗ɴsғᴡ-ғᴜɴᴄᴛɪᴏɴ🥵\`
> ${s + usedPrefix}69 ⬄ ${usedPrefix}agarrartetas  
> ${s + usedPrefix}anal ⬌ ${usedPrefix}bj  
> ${s + usedPrefix}blowjob ⬄ ${usedPrefix}boobjob  
> ${s + usedPrefix}chupartetas ⬌ ${usedPrefix}coger  
> ${s + usedPrefix}coño ⬄ ${usedPrefix}culiar  
> ${s + usedPrefix}cum ⬌ ${usedPrefix}encuerar  
> ${s + usedPrefix}fap ⬄ ${usedPrefix}follar  
> ${s + usedPrefix}footjob ⬌ ${usedPrefix}fuck  
> ${s + usedPrefix}grabboobs ⬄ ${usedPrefix}grop  
> ${s + usedPrefix}grope ⬌ ${usedPrefix}leche  
> ${s + usedPrefix}lesbianas ⬄ ${usedPrefix}lickpussy  
> ${s + usedPrefix}mamada ⬌ ${usedPrefix}manosear  
> ${s + usedPrefix}nalgada ⬄ ${usedPrefix}paja  
> ${s + usedPrefix}penetrado ⬌ ${usedPrefix}penetrar  
> ${s + usedPrefix}perra ⬄ ${usedPrefix}pies  
> ${s + usedPrefix}rule ⬌ ${usedPrefix}rule34  
> ${s + usedPrefix}rusa ⬄ ${usedPrefix}sex  
> ${s + usedPrefix}sexo ⬌ ${usedPrefix}sixnine  
> ${s + usedPrefix}spank ⬄ ${usedPrefix}suckboobs  
> ${s + usedPrefix}tijeras ⬌ ${usedPrefix}undress  
> ${s + usedPrefix}violar ⬄ ${usedPrefix}yuri

\`✑ᴏᴘᴄɪᴏɴᴇs/ᴏᴡɴᴇʀ🔥\`
> ${s + usedPrefix}update ⬄ ${usedPrefix}join  
> ${s + usedPrefix}=> ⬌ ${usedPrefix}restart  
> ${s + usedPrefix}$ ⬄ ${usedPrefix}antiprivado  
> ${s + usedPrefix}icon ⬌ ${usedPrefix}salir`

let textos = txt2
let textos2 = txt3
let puta = txt + '\n\n' + [textos, textos2].sort(() => Math.random() - 0.5)[0]
  m.react('🏖️')

  if (media === 'grupo') {
    await conn.sendMessage(m.chat, {
      text: puta,
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
      caption: puta,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          newsletterName: channelRD.name,
          serverMessageId: -1,
        },
        externalAdReply: {
          title: botname,
          body: textbot,
          thumbnailUrl: redes,
          thumbnail,
          sourceUrl: redes,
          mediaType: 1,
        },
      },
    }, { quoted: m })
  }

  if (media === 'anu') {
    await conn.sendMessage(m.chat, {
      text: puta,
      footer: textbot,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          newsletterName: channelRD.name,
          serverMessageId: -1,
        },
        externalAdReply: {
          title: botname,
          body: textbot,
          thumbnailUrl: redes,
          thumbnail,
          sourceUrl: redes,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: m })
  }
}

handler.command = ['u']
handler.group = true
export default handler
