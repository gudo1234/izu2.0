import { getDevice } from "@whiskeysockets/baileys"
import moment from 'moment-timezone'

let handler = async (m, { conn, text, command }) => {
  let id = text ? text : m.chat  
  let groupMetadata = await conn.groupMetadata(id)
  let fechaHoraMX = moment().tz('America/Mexico_City').format('DD/MM/YYYY HH:mm:ss')

  m.reply(`${e}\`Saliendo automáticamente del grupo...\`\n*ID:* ${groupMetadata.subject}\n*ID:* ${id}\n*Fecha y hora (MX):* ${fechaHoraMX}`)

  await conn.groupLeave(id)
}

handler.command = ['salir']
handler.group = true
handler.rowner = true

export default handler
