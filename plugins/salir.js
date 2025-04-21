import os from 'os'
import { getDevice } from "@whiskeysockets/baileys"
import moment from 'moment-timezone'
import util from 'util'
import ws from 'ws';
import sizeFormatter from 'human-readable'
let MessageType =  (await import(global.baileys)).default
let handler = async (m, { conn, text, command }) => {
const fechahon = moment().tz('America/Tegucigalpa').format('DD/MM HH:mm')
let id = text ? text : m.chat
let txt = `${e} \`Saliendo automáticamente...\` _\n\n*Fecha de Salida:* ${fechahon}\n*ID*: ${await conn.getName(m.chat)}`
m.reply(txt)
await conn.groupLeave(id)}

handler.command = ['salir']
handler.group = true
handler.owner = true

export default handler
