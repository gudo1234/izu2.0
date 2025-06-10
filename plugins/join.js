import axios from 'axios'
import PhoneNum from 'awesome-phonenumber'
import { getDevice } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
const regionNames = new Intl.DisplayNames(['es'], { type: 'region' })

function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return ''
  const codePoints = [...countryCode.toUpperCase()]
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}

function formatearFechaLarga(fecha) {
  return fecha.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatearHoraMexico(fecha) {
  return fecha.toLocaleTimeString('es-MX', {
    timeZone: 'America/Mexico_City',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).replace('.', '').toLowerCase()
}

let handler = async (m, { conn, text, isOwner }) => {
  if (!text) return m.reply(`${emoji} Debes enviar una invitación para que *${botname}* se una al grupo.`)

  const codeMatch = text.match(linkRegex)
  if (!codeMatch) return m.reply(`${e} Enlace de invitación no válido.`)

  const code = codeMatch[1]
  const target = m.quoted?.sender || m.mentionedJid?.[0] || m.sender
  const number = target.split('@')[0]
  const phoneInfo = PhoneNum('+' + number)
  const countryCode = phoneInfo.getRegionCode('international')
  const pais = regionNames.of(countryCode) || 'Desconocido'
  const bandera = banderaEmoji(countryCode)

  let capital = 'Desconocida'
  try {
    const res = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`)
    capital = res.data?.[0]?.capital?.[0] || 'Desconocida'
  } catch (e) {
    console.error('Error al obtener datos del país:', e)
  }

  const ahora = new Date()
  const vencimiento = new Date(ahora.getTime() + 31 * 24 * 60 * 60 * 1000)
  const fechaInicio = formatearFechaLarga(ahora)
  const fechaFin = formatearFechaLarga(vencimiento)
  const horaMexico = formatearHoraMexico(ahora)

  let pp = await conn.profilePictureUrl(m.messageStubParameters?.[0] || m.chat, 'image').catch(_ => icono)
  let im = await (await fetch(pp)).buffer()

  const txt = `${e + s} *Me he unido exitosamente al grupo*\n\n` +
    `💻 *Cliente:* ${m.pushName}\n` +
    `🌎 *Número:* +${number}\n` +
    `🌎 *País:* ${pais} ${bandera}\n` +
    `🏛️ *Capital:* ${capital}\n` +
    `📍 *Código:* ${countryCode}\n` +
    `🕒 *Hora actual:* ${horaMexico} Hora México\n` +
    `🗓️ *Válido desde:* ${fechaInicio}\n` +
    `📆 *Vence:* ${fechaFin}\n` +
    `🤖 *Tipo de Servicio:* Bot Online Group\n` +
    `💵 *Tipo de pago:* No hubieron pagos\n\n` + 
    `> 📱 Si detecta un error en la factura de pago o desea contratar un servicio permanente, por favor comuníquese con mi desarrollador.\n\n` +
    `🧑🏻‍💻 wa.me/50492280729?text=Hola%2C+vengo+del+bot+y+quiero+información+sobre+el+servicio.\n\n` + 
    `${e} *Instagram:* https://www.instagram.com/edar504__`

  if (isOwner) {
    await conn.groupAcceptInvite(code)
      .then(() => conn.sendFile(m.chat, im, 'thumbnail.jpg', txt, m, null, rcanal))
      .catch(err => m.reply(`${msm} Error al unirme al grupo.`))
  } else {
    const mensaje = `${e} Invitación a un grupo:\n${text}\n\nPor: @${m.sender.split('@')[0]}`
    await conn.sendMessage(`${suittag}@s.whatsapp.net`, { text: mensaje, mentions: [m.sender] }, { quoted: m })
    m.reply(`${e} El link del grupo ha sido enviado a mi propietario, luego recibirá una respuesta.`)
  }
}

handler.command = ['invite', 'join', 'entra', 'entrabot']
export default handler
