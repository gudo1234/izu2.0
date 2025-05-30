import { createHash } from 'crypto' 
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = command.toLowerCase()
  let isAll = false, isUser = false
  let isEnable = chat[type] || false

  if (args[0] === 'on' || args[0] === 'enable') {
    isEnable = true
  } else if (args[0] === 'off' || args[0] === 'disable') {
    isEnable = false
  } else {
    const estado = isEnable ? '✓ Activado' : '✗ Desactivado'
    return conn.reply(m.chat, `*${estado}*\n\n*Ejemplo de uso:*\n${usedPrefix + command} autosticker on\n${usedPrefix + command} autosticker off\n\n> Opciones disponibles:\nwelcome\nautoaceptar\nsoloadmin\nnsfw\nmodohorny\ndetect\nantilink\nantifake\nantibot\nantibot2\nautosticker`, m)
  }

  switch (type) {
    case 'welcome':
    case 'bienvenida':
    case 'autoaceptar':
    case 'aceptarauto':
    case 'autorechazar':
    case 'rechazarauto':
    case 'autoresponder':
    case 'autorespond':
    case 'modoadmin':
    case 'soloadmin':
    case 'reaction':
    case 'reaccion':
    case 'nsfw':
    case 'modohorny':
    case 'detect':
    case 'avisos':
    case 'antilink':
    case 'antifake':
    case 'antibot':
    case 'antibots':
    case 'antisubbots':
    case 'antibot2':
    case 'autosticker': // ✅ NUEVO
      if (m.isGroup && !(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat[type] = isEnable
      break

    case 'antiprivado':
    case 'antiprivate':
    case 'restrict':
    case 'restringir':
    case 'jadibotmd':
    case 'modejadibot':
      isAll = true
      if (!isOwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      bot[type] = isEnable
      break
  }

  conn.reply(m.chat, `✅ La función *${type}* se *${isEnable ? 'activó' : 'desactivó'}* ${isAll ? 'globalmente' : 'en este chat'}`, m)
}

handler.help = [
  'welcome', 'bienvenida', 'antiprivado', 'antiprivate', 'restrict', 'restringir',
  'autolevelup', 'autonivel', 'antibot', 'antibots', 'autoaceptar', 'aceptarauto',
  'autorechazar', 'rechazarauto', 'autoresponder', 'autorespond', 'antisubbots',
  'antibot2', 'modoadmin', 'soloadmin', 'reaction', 'reaccion', 'nsfw', 'modohorny',
  'antispam', 'jadibotmd', 'modejadibot', 'subbots', 'detect', 'avisos', 'antilink',
  'antifake', 'autosticker' // ✅ NUEVO
]

handler.tags = ['nable']
handler.command = [
  'on', 'off', 'welcome', 'bienvenida', 'antiprivado', 'antiprivate', 'restrict',
  'restringir', 'autolevelup', 'autonivel', 'antibot', 'antibots', 'autoaceptar',
  'aceptarauto', 'autorechazar', 'rechazarauto', 'autoresponder', 'autorespond',
  'antisubbots', 'antibot2', 'modoadmin', 'soloadmin', 'reaction', 'reaccion',
  'nsfw', 'modohorny', 'antispam', 'jadibotmd', 'modejadibot', 'subbots', 'detect',
  'avisos', 'antilink', 'antifake', 'autosticker' // ✅ NUEVO
]

export default handler
