import { getDevice } from "@whiskeysockets/baileys"
import moment from 'moment-timezone'

let handler = async (m, { conn, text, command }) => {
  let id = text ? text : m.chat  
  let groupMetadata = await conn.groupMetadata(id)

  let fechaHoraMX = moment().tz('America/Mexico_City').locale('es').format('dddd D [de] MMMM [del] YYYY [a las] h:mm a [hora México]')

  m.reply(`${e} \`Saliendo automáticamente del grupo...\`\n*Nombre:* ${groupMetadata.subject}\n*ID:* ${id}\n> ${fechaHoraMX}`)

  await new Promise(resolve => setTimeout(resolve, 3000))

  await conn.groupLeave(id)
}

handler.command = ['salir']
handler.group = true
handler.rowner = true

export default handler
