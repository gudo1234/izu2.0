import { createHash } from 'crypto'
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
  const chat = global.db.data.chats[m.chat]
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
  let valor = null

  // Caso: .on <opción>  || .off <opción>
  if ((type === 'on' || type === 'enable') && opcion in opcionesValidas) {
    type = opcion
    valor = true
  } else if ((type === 'off' || type === 'disable') && opcion in opcionesValidas) {
    type = opcion
    valor = false
  }

  // Caso: .<opción> on/off
  else if ((type in opcionesValidas) && (opcion === 'on' || opcion === 'enable')) {
    valor = true
  } else if ((type in opcionesValidas) && (opcion === 'off' || opcion === 'disable')) {
    valor = false
  }

  // Si no hay opción válida, mostrar lista de estados
  const mostrarLista = () => {
    const estados = Object.entries(opcionesValidas)
      .map(([opt, scope]) => {
        const estado = scope === 'bot' ? bot[opt] : chat[opt]
        return `• *${opt}* ${estado ? '✅' : '❌'}`
      })
      .join('\n')
    return conn.reply(m.chat, `📋 *Opciones disponibles:*\n\n${estados}\n\nUsa:\n${usedPrefix}on <opción>\n${usedPrefix}off <opción>\no\n${usedPrefix}<opción> on / off`, m)
  }

  // .on / .off sin argumento → mostrar lista
  if ((type === 'on' || type === 'off' || type === 'enable' || type === 'disable') && !opcion) {
    return mostrarLista()
  }

  // .<opción> → mostrar estado
  if (valor === null) {
    if (!(type in opcionesValidas)) {
      return mostrarLista()
    }

    const estado = opcionesValidas[type] === 'bot' ? bot[type] : chat[type]
    return conn.reply(m.chat, `📢 La función *${type}* está actualmente: ${estado ? '✅ ACTIVADA' : '❌ DESACTIVADA'}.\n\nUsa:\n${usedPrefix}${type} on – para activar\n${usedPrefix}${type} off – para desactivar\n\n⚙️ *Opciones disponibles*\n${estados}`, m)
  }

  // Activar / desactivar según tipo y permisos
  const scope = opcionesValidas[type]
  if (scope === 'chat') {
    if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
    chat[type] = valor
  } else if (scope === 'bot') {
    if (!isOwner) return global.dfail('rowner', m, conn)
    bot[type] = valor
  }

  conn.reply(m.chat, `✅ La función *${type}* fue *${valor ? 'activada' : 'desactivada'}* correctamente ${scope === 'bot' ? 'para todo el bot' : 'en este chat'}.`, m)
}

handler.help = ['on <opción>', 'off <opción>', '<opción> (ver estado)', '<opción> on/off']
handler.tags = ['nable']
handler.command = [
  'on', 'off', 'enable', 'disable',
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
