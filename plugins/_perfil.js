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
  let targetNumber
  let own = false

  // 🧩 Detección del número o usuario objetivo
  if (m.quoted) {
    targetNumber = m.quoted.sender
  } else if (m.mentionedJid?.length) {
    targetNumber = m.mentionedJid[0]
  } else if (text) {
    const cleaned = text.replace(/[^0-9]/g, '')
    if (!cleaned) throw '⚠️ Ingresa un número válido o responde a un mensaje.'
    targetNumber = cleaned + '@s.whatsapp.net'
  } else {
    targetNumber = m.sender
    own = true
  }

  // 📞 Verificar existencia correcta
  const jidClean = targetNumber.replace(/@s\.whatsapp\.net$/, '')
  const exists = await conn.onWhatsApp(jidClean + '@s.whatsapp.net')
  if (!exists?.[0]?.exists)
    throw 'Este usuario no existe, asegúrate de escribir bien el número.'

  // 🔹 Extraer información
  const number = jidClean
  const name = await conn.getName(targetNumber)
  const phoneInfo = PhoneNum('+' + number)
  const countryCode = phoneInfo.getRegionCode('international')
  const country = regionNames.of(countryCode) || 'Desconocido'
  const flag = banderaEmoji(countryCode)
  const formatNum = phoneInfo.getNumber('international')
  const url = 'https://wa.me/' + number

  // 🌎 País y hora local
  let capital = 'Desconocida'
  let fechaLocal = 'No disponible'
  try {
    const res = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`)
    const data = res.data[0]
    capital = data.capital?.[0] || 'Desconocida'
    const zona = data.timezones?.[0]
    if (zona) fechaLocal = moment().tz(zona).format('dddd, D [de] MMMM [de] YYYY')
  } catch (err) {
    console.log('Error país:', err.message)
  }

  // 🖼️ Imagen, bio y business
  let img = await conn.profilePictureUrl(targetNumber, 'image').catch(_ => icono)
  let bio = await conn.fetchStatus(targetNumber).catch(_ => null)
  let business = await conn.getBusinessProfile(targetNumber).catch(_ => null)

  // 🧾 Construcción del mensaje
  let caption = `${e} *Información de WhatsApp*\n\n`
  caption += `*Nombre:* ${name || '-'}\n`
  caption += `*Número:* ${formatNum}\n`
  caption += `*País:* ${country} ${flag}\n`
  caption += `*Capital:* ${capital}\n`
  caption += `*Fecha local:* ${fechaLocal}\n`
  caption += `*Enlace:* ${url}\n`
  caption += `*Tag:* @${number}\n`
  caption += `*Bio:* ${bio?.status || '-'}\n`
  caption += `*Actualizado:* ${bio?.setAt ? moment(bio.setAt).format('LLLL') : '-'}\n`
  caption += `*Sistema/Device:* ${own ? getDevice(m.key.id) : '-'}\n`

  if (business) {
    caption += `\n⚡ *Cuenta Business:*\n`
    caption += `*ID:* ${business.wid || '-'}\n`
    caption += `*Sitio Web:* ${business.website || '-'}\n`
    caption += `*Email:* ${business.email || '-'}\n`
    caption += `*Categoría:* ${business.category || '-'}\n`
    caption += `*Dirección:* ${business.address || '-'}\n`
    caption += `*Zona horaria:* ${business.business_hours?.timezone || '-'}\n`
    caption += `*Descripción:* ${business.description || '-'}\n`
  }

  await m.react('🔥')
  await conn.sendMessage(m.chat, {
    image: { url: img },
    caption,
    mentions: [targetNumber]
  }, { quoted: m })
}

handler.command = ['wastalk', 'perfil', 'ava']
handler.group = true

export default handler
