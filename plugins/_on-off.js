import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const handler = async (m, { conn, args, command }) => {
  const chatId = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const senderClean = sender.replace(/[^0-9]/g, '')

  const isFromMe = m.key.fromMe
  const isOwner = global.owner.some(([id]) => id === senderClean)

  if (!isOwner && !isFromMe) {
    return conn.sendMessage(chatId, {
      text: '❌ Solo el owner o el mismo bot puede usar este comando global.'
    }, { quoted: m })
  }

  const filePath = path.join(__dirname, 'disabled.json')
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]))

  let disabled = JSON.parse(fs.readFileSync(filePath))
  const cmd = (args[0] || '').toLowerCase()

  if (!cmd) {
    return conn.sendMessage(chatId, {
      text: `📛 Debes indicar un comando.\nEj: *.${command} menu*`
    }, { quoted: m })
  }

  if (command === 'desactivar') {
    if (disabled.includes(cmd)) {
      return conn.sendMessage(chatId, {
        text: `⚠️ El comando *${cmd}* ya está desactivado globalmente.`
      }, { quoted: m })
    }
    disabled.push(cmd)
    fs.writeFileSync(filePath, JSON.stringify(disabled, null, 2))
    await conn.sendMessage(chatId, { react: { text: '🛑', key: m.key } })
    return conn.sendMessage(chatId, {
      text: `✅ El comando *${cmd}* ha sido desactivado globalmente.`
    }, { quoted: m })
  } else {
    if (!disabled.includes(cmd)) {
      return conn.sendMessage(chatId, {
        text: `⚠️ El comando *${cmd}* no está desactivado.`
      }, { quoted: m })
    }
    disabled = disabled.filter(c => c !== cmd)
    fs.writeFileSync(filePath, JSON.stringify(disabled, null, 2))
    await conn.sendMessage(chatId, { react: { text: '✅', key: m.key } })
    return conn.sendMessage(chatId, {
      text: `✅ El comando *${cmd}* ha sido activado nuevamente.`
    }, { quoted: m })
  }
}

handler.command = ['activar', 'desactivar']
export default handler
