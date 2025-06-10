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

function formatearFecha(fecha) {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatearHora(fecha) {
  return fecha.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
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

  const fechaActual = new Date()
  const fechaFutura = new Date(fechaActual.getTime() + 31 * 24 * 60 * 60 * 1000)

  const fechaTexto = `${formatearFecha(fechaActual)} _Hasta_ ${formatearFecha(fechaFutura)}`
  const horaActual = formatearHora(fechaActual)

  let pp = await conn.profilePictureUrl(m.messageStubParameters?.[0] || m.chat, 'image').catch(_ => icono)
  let im = await (await fetch(pp)).buffer()

  const txt = `${e + s} *Me he unido exitosamente al grupo*\n\n` +
    `💻 *Cliente:* ${m.pushName}\n` +
    `🌎 *Número:* +${number}\n` +
    `🌎 *País:* ${pais} ${bandera}\n` +
    `🏛️ *Capital:* ${capital}\n` +
    `📍 *Código:* ${countryCode}\n` +
    `🕒 *Hora actual:* ${horaActual}\n` +
    `📅 *Válido del:* ${fechaTexto}\n` +
    `🤖 *Tipo de Servicio:* Bot Online Group\n` +
    `💵 *Tipo de pago:* No hubieron pagos`

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
