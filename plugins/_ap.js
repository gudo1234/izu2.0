import axios from 'axios'
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

const handler = async (m, { conn, text, usedPrefix, command }) => {
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

  // Info del país
  let capital = 'Desconocida'
  let fechaLocal = 'No disponible'
  let horaLocal = 'No disponible'
  try {
    const res = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`)
    const data = res.data[0]
    capital = data.capital?.[0] || 'Desconocida'
    const zona = data.timezones?.[0]
    if (zona) {
      const now = moment().tz(zona)
      fechaLocal = now.format('dddd, D [de] MMMM [de] YYYY')
      horaLocal = now.format('HH:mm:ss [hrs]')
    }
  } catch (e) {
    console.error('Error obteniendo información del país:', e)
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
export default handler
