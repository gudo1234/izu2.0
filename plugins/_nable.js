import { createHash } from 'crypto'
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
  const chat = global.db.data.chats[m.chat]
  const user = global.db.data.users[m.sender]
  const bot = global.db.data.settings[conn.user.jid] || {}

  const opcionesValidas = {
    welcome: 'chat',
    autoaceptar: 'chat',
    soloadmin: 'chat',
    nsfw: 'chat',
    detect: 'chat',
    antilink: 'chat',
    antifake: 'chat',
    antibot: 'chat',
    antibot2: 'chat',
    autosticker: 'chat',
    antiprivado: 'bot',
    restrict: 'bot',
    jadibotmd: 'bot',
  }

  let type = command.toLowerCase()
  let opcion = args[0]?.toLowerCase()
  let valor

  if (['on', 'enable'].includes(type)) {
    if (!opcion || !(opcion in opcionesValidas)) {
      return conn.reply(m.chat, `❌ Debes indicar una opción válida. Ejemplo:\n${usedPrefix}on welcome`, m)
    }
    type = opcion
    valor = true
  } else if (['off', 'disable'].includes(type)) {
    if (!opcion || !(opcion in opcionesValidas)) {
      return conn.reply(m.chat, `❌ Debes indicar una opción válida. Ejemplo:\n${usedPrefix}off welcome`, m)
    }
    type = opcion
    valor = false
  } else {
    // Formato: .welcome, .autosticker, etc.
    if (!(type in opcionesValidas)) {
      return conn.reply(m.chat, `❌ Opción no reconocida.\nOpciones válidas:\n${Object.keys(opcionesValidas).join('\n')}`, m)
    }
    const estado = opcionesValidas[type] === 'bot' ? bot[type] : chat[type]
    return conn.reply(m.chat, `📢 La función *${type}* está actualmente: ${estado ? '✅ ACTIVADA' : '✖️ DESACTIVADA'}.\n\nUsa:\n${usedPrefix}${type} on – para activar\n${usedPrefix}${type} off – para desactivar`, m)
  }

  const scope = opcionesValidas[type]
  if (scope === 'chat') {
    if (m.isGroup && !(isAdmin || isOwner)) {
      return global.dfail('admin', m, conn)
    }
    chat[type] = valor
  } else if (scope === 'bot') {
    if (!isOwner) {
      return global.dfail('rowner', m, conn)
    }
    bot[type] = valor
  }

  conn.reply(m.chat, `✅ La función *${type}* fue *${valor ? 'activada' : 'desactivada'}* correctamente ${scope === 'bot' ? 'para el bot completo' : 'en este chat'}.`, m)
}

handler.help = ['on <opción>', 'off <opción>', '<opción> (ver estado)']
handler.tags = ['nable']
handler.command = [
  'on', 'off',
  'welcome', 'bienvenida',
  'autoaceptar', 'soloadmin',
  'nsfw', 'modohorny',
  'detect', 'antilink',
  'antifake', 'antibot',
  'antibot2', 'autosticker',
  'antiprivado', 'restrict',
  'jadibotmd'
]

export default handler
