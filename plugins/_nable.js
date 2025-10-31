import { createHash } from 'crypto'
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
  const chat = global.db.data.chats[m.chat]
  const bot = global.db.data.settings[conn.user.jid] || {}

  // Opciones disponibles y su ámbito
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
    autoband: 'chat',
    antiprivado: 'bot',
    jadibotmd: 'bot',
    boton: 'bot',
    audio: 'bot',
    audios: 'bot'
  }

  let type = command.toLowerCase()
  let opcion = args[0]?.toLowerCase()
  let valor = null

  // Manejo de activación/desactivación
  if ((type === 'on' || type === 'enable') && opcion in opcionesValidas) {
    type = opcion
    valor = true
  } else if ((type === 'off' || type === 'disable') && opcion in opcionesValidas) {
    type = opcion
    valor = false
  } else if ((type in opcionesValidas) && (opcion === 'on' || opcion === 'enable')) {
    valor = true
  } else if ((type in opcionesValidas) && (opcion === 'off' || opcion === 'disable')) {
    valor = false
  }

  // Función para mostrar el listado actual de estados
  const mostrarLista = () => {
    const estados = Object.entries(opcionesValidas)
      .map(([opt, scope]) => {
        const estado = scope === 'bot' ? bot[opt] : chat[opt]
        return `> *${opt}*      ${estado ? 'Activo ✓' : 'Desactivado ✗'}`
      })
      .join('\n')
    return conn.reply(
      m.chat,
      `⚙️ *Lista de funciones y su estado:*\n${estados}\n\n*_Ejemplo de uso:_*\n\`${usedPrefix}on\` welcome\n\`${usedPrefix}off\` autosticker`,
      m
    )
  }

  // Si solo se usa .on o .off sin argumento
  if ((type === 'on' || type === 'off' || type === 'enable' || type === 'disable') && !opcion) {
    return mostrarLista()
  }

  // Si el valor no fue definido o el comando es desconocido
  if (valor === null) {
    if (!(type in opcionesValidas)) {
      return mostrarLista()
    }

    const estado = opcionesValidas[type] === 'bot' ? bot[type] : chat[type]
    const listaExtra = Object.entries(opcionesValidas)
      .map(([opt, scope]) => {
        const est = scope === 'bot' ? bot[opt] : chat[opt]
        return `> ${opt} ${est ? '✓' : '✗'}`
      })
      .join('\n')

    return conn.reply(
      m.chat,
      `⚙️ _La función *${type}* está actualmente: ${estado ? '✓ ACTIVADA' : '✗ DESACTIVADA'}_\n\nUsa:\n\`${usedPrefix}${type}\` on – para activar\n\`${usedPrefix}${type}\` off – para desactivar\n\n📋 *Otros estados:*\n${listaExtra}`,
      m
    )
  }

  // Aplicar cambios según el tipo (chat o bot)
  const scope = opcionesValidas[type]
  if (scope === 'chat') {
    if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
    chat[type] = valor
  } else if (scope === 'bot') {
    if (!isOwner) return global.dfail('rowner', m, conn)
    bot[type] = valor
  }

  conn.reply(
    m.chat,
    `✅ La función *${type}* fue *${valor ? 'activada' : 'desactivada'}* correctamente ${scope === 'bot' ? 'para todo el bot' : 'en este chat'}.`,
    m
  )
}

handler.command = [
  'on', 'off', 'enable', 'disable',
  'welcome', 'bienvenida',
  'autoaceptar', 'soloadmin',
  'nsfw', 'modohorny',
  'detect', 'antilink',
  'antifake', 'antibot',
  'antibot2', 'autosticker',
  'autoband', 'antiprivado', 'jadibotmd',
  'boton', 'audio', 'audios'
]

export default handler
