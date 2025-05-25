import axios from 'axios'
import PhoneNum from 'awesome-phonenumber'
import moment from 'moment-timezone'
import { getDevice } from '@whiskeysockets/baileys'
import 'moment/locale/es.js'
import fetch from 'node-fetch'

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
    if (!exists[0]?.exists) throw 'Este usuario no existe, asegúrate de escribir bien el número.'
  }

  const number = target.split('@')[0]
  const name = await conn.getName(target)
  const phoneInfo = PhoneNum('+' + number)
  const countryCode = phoneInfo.getRegionCode('international')
  const country = regionNames.of(countryCode) || 'Desconocido'
  const flag = banderaEmoji(countryCode)
  const formatNum = phoneInfo.getNumber('international')
  const url = 'https://wa.me/' + number

  // Info de país
  let capital = 'Desconocida'
  let fechaLocal = 'No disponible'
  try {
    const res = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`)
    const data = res.data[0]
    capital = data.capital?.[0] || 'Desconocida'
    const zona = data.timezones?.[0]
    if (zona) {
      fechaLocal = moment().tz(zona).format('dddd, D [de] MMMM [de] YYYY')
    }
  } catch (e) {
    console.error('Error obteniendo país:', e)
  }

  // Imagen y bio
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => icono )
  let im = await (await fetch(`${pp}`)).buffer()
  let bio = await conn.fetchStatus(target).catch(_ => null)
  let business = await conn.getBusinessProfile(target).catch(_ => null)

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
    caption += `*ID:* ${business.wid}\n`
    caption += `*Sitio Web:* ${business.website || '-'}\n`
    caption += `*Email:* ${business.email || '-'}\n`
    caption += `*Categoría:* ${business.category || '-'}\n`
    caption += `*Dirección:* ${business.address || '-'}\n`
    caption += `*Zona horaria:* ${business.business_hours?.timezone || '-'}\n`
    caption += `*Descripción:* ${business.description || '-'}\n`
  }

  await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
      mentionedJid: [target],
        externalAdReply: {
          title: wm,
          body: textbot,
          thumbnailUrl: redes,
          thumbnail: im,
          sourceUrl: redes,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
}

handler.command = ['edi'];
handler.group = true;
export default handler
