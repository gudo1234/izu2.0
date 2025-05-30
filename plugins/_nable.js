import { createHash } from 'crypto'

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
  const chat = global.db.data.chats[m.chat]
  const bot = global.db.data.settings[conn.user.jid] || {}

  const funcionesLocales = {
    welcome: 'Bienvenida al grupo',
    autoaceptar: 'Aceptar solicitudes automáticamente',
    modoadmin: 'Solo admins pueden usar el bot',
    nsfw: 'Contenido +18',
    detect: 'Detectar cambios (nombres, fotos)',
    antilink: 'Detectar links prohibidos',
    antifake: 'Detectar números falsos',
    antibot: 'Evitar bots no autorizados',
    antibot2: 'Evitar subbots o clientes externos',
    autosticker: 'Convertir imágenes en stickers'
  }

  const funcionesGlobales = {
    antiprivado: 'Evitar mensajes privados al bot',
    jadibotmd: 'Permitir modo Jadibot'
  }

  let type, isEnable

  // 🔁 Detectar formato flexible
  if (['on', 'enable'].includes(command)) {
    isEnable = true
    type = args[0]?.toLowerCase()
  } else if (['off', 'disable'].includes(command)) {
    isEnable = false
    type = args[0]?.toLowerCase()
  } else if (args[0] === 'on' || args[0] === 'enable') {
    isEnable = true
    type = command.toLowerCase()
  } else if (args[0] === 'off' || args[0] === 'disable') {
    isEnable = false
    type = command.toLowerCase()
  } else if (command in funcionesLocales || command in funcionesGlobales) {
    type = command
    const actual = funcionesLocales[type] !== undefined ? chat[type] : bot[type]
    return conn.reply(m.chat, `✅ *${type}* está actualmente *${actual ? 'activado' : 'desactivado'}*`, m)
  } else {
    // 🧾 Mostrar lista de funciones
    let lista = '*⚙️ Lista de funciones y su estado:*\n\n'
    for (const [k, desc] of Object.entries(funcionesLocales)) {
      lista += `> ${k.padEnd(13)} ${chat[k] ? '✓ Activado' : '✗ Desactivado'}\n`
    }
    for (const [k, desc] of Object.entries(funcionesGlobales)) {
      lista += `> ${k.padEnd(13)} ${bot[k] ? '✓ Activado' : '✗ Desactivado'}\n`
    }
    lista += `\n📌 Usa: *${usedPrefix}on <función>*, *${usedPrefix}off <función>*\n     o: *${usedPrefix}<función> on/off*`
    return conn.reply(m.chat, lista.trim(), m)
  }

  // ⛔ Validar existencia
  const todas = { ...funcionesLocales, ...funcionesGlobales }
  if (!type || !(type in todas)) {
    return conn.reply(m.chat, `❌ Función inválida: *${type}*\nPrueba con: *.on welcome*`, m)
  }

  // 🔐 Verificación de permisos
  const isGlobal = type in funcionesGlobales
  if (isGlobal && !isOwner) {
    global.dfail('rowner', m, conn)
    throw false
  }
  if (!isGlobal && m.isGroup && !(isAdmin || isOwner)) {
    global.dfail('admin', m, conn)
    throw false
  }
  if (!isGlobal && !m.isGroup && !isOwner) {
    global.dfail('group', m, conn)
    throw false
  }

  // ✅ Aplicar cambio
  if (isGlobal) {
    bot[type] = isEnable
  } else {
    chat[type] = isEnable
  }

  return conn.reply(
    m.chat,
    `✅ La función *${type}* fue *${isEnable ? 'activada' : 'desactivada'}* ${isGlobal ? 'a nivel global' : 'en este chat'}`,
    m
  )
}

handler.help = ['on <función>', 'off <función>', '<función> on/off']
handler.tags = ['nable']
handler.command = [
  'on', 'off', 'enable', 'disable',
  'welcome', 'autoaceptar', 'modoadmin',
  'nsfw', 'detect', 'antilink', 'antifake',
  'antibot', 'antibot2', 'autosticker',
  'antiprivado', 'jadibotmd'
]

export default handler
