import { createHash } from 'crypto'

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  const chat = global.db.data.chats[m.chat]
  const user = global.db.data.users[m.sender]
  const bot = global.db.data.settings[conn.user.jid] || {}

  let type = (command || '').toLowerCase()
  let isAll = false
  let isEnable

  // Detectar si el primer argumento es "on" o "off", o si está al revés
  if (['on', 'enable'].includes(args[0])) {
    isEnable = true
    type = args[1]?.toLowerCase()
  } else if (['off', 'disable'].includes(args[0])) {
    isEnable = false
    type = args[1]?.toLowerCase()
  } else if (['on', 'enable'].includes(args[1])) {
    isEnable = true
    type = args[0]?.toLowerCase()
  } else if (['off', 'disable'].includes(args[1])) {
    isEnable = false
    type = args[0]?.toLowerCase()
  } else {
    const estado = (chat[type] || bot[type]) ? '✓ Activado' : '✗ Desactivado'
    return conn.reply(m.chat, `*${estado}*\n\n> ʟɪsᴛᴀ ᴅᴇ ᴏᴘᴄɪᴏɴᴇs ᴅɪsᴘᴏɴɪʙʟᴇs:\nwelcome\nautoaceptar\nsoloadmin\nnsfw\nmodohorny\ndetect\nantilink\nantifake\nantibot\nantibot2\nautosticker`, m)
  }

  if (!type) return conn.reply(m.chat, `${e} Especifica una opción. Ejemplo:\n${usedPrefix}on autosticker`, m)

  // Requiere permisos de grupo
  const requiresGroup = [
    'welcome', 'bienvenida', 'autoaceptar', 'aceptarauto',
    'autorechazar', 'rechazarauto', 'modoadmin', 'soloadmin',
    'reaction', 'reaccion', 'nsfw', 'modohorny', 'detect', 'avisos',
    'antilink', 'antifake', 'antibot', 'antibots', 'antisubbots', 'antibot2', 'autosticker'
  ]

  if (requiresGroup.includes(type)) {
    if (!m.isGroup) {
      global.dfail('group', m, conn)
      throw false
    }
    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn)
      throw false
    }
    chat[type] = isEnable
  }

  // Requiere permisos globales
  const requiresGlobal = ['restrict', 'restringir', 'antiprivado', 'antiprivate', 'jadibotmd', 'modejadibot']
  if (requiresGlobal.includes(type)) {
    isAll = true
    if (!isOwner) {
      global.dfail('rowner', m, conn)
      throw false
    }
    bot[type] = isEnable
  }

  conn.reply(m.chat, `✅ La función *${type}* fue *${isEnable ? 'activada' : 'desactivada'}* ${isAll ? 'a nivel global' : 'para este chat'}`, m)
}

handler.help = ['on', 'off'].map(v => `${v} <función>`)
handler.tags = ['nable']
handler.command = ['on', 'off', 'enable', 'disable']

export default handler
