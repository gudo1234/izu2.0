/*import { createHash } from 'crypto' 
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = command.toLowerCase()
  let isAll = false, isUser = false
  let isEnable = chat[type] || false

  if (args[0] === 'on' || args[0] === 'enable') {
    isEnable = true;
  } else if (args[0] === 'off' || args[0] === 'disable') {
    isEnable = false
  } else {
    const estado = isEnable ? '✓ Activado' : '✗ Desactivado'
    return conn.reply(m.chat, `*${estado}*\n\n*Ejemplo de uso:*\n${usedPrefix + type} on *para activar*\n${usedPrefix + type} off *para desactivar*\n\n> ʟɪsᴛᴀ ᴅᴇ ᴏᴘᴄɪᴏɴᴇs:\nwelcome\nautoaceptar\nsoloadmin\nnsfw\nmodohorny\ndetect\nantilink\nantifake\nantibot\nantibot2\nautosticker`, m)
  }

  switch (type) {
    case 'welcome':
    case 'bienvenida':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.welcome = isEnable
      break  

    case 'antiprivado':
    case 'antiprivate':
      isAll = true
      if (!isOwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      bot.antiPrivate = isEnable
      break

    case 'restrict':
    case 'restringir':
      isAll = true
      if (!isOwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      bot.restrict = isEnable
      break

    case 'antibot':
    case 'antibots':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiBot = isEnable
      break

    case 'autoaceptar':
    case 'aceptarauto':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.autoAceptar = isEnable
      break

    case 'autorechazar':
    case 'rechazarauto':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.autoRechazar = isEnable
      break

    case 'autoresponder':
    case 'autorespond':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.autoresponder = isEnable
      break

    case 'antisubbots':
    case 'antibot2':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiBot2 = isEnable
      break

    case 'modoadmin':
    case 'soloadmin':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.modoadmin = isEnable;
      break;

    case 'reaction':
    case 'reaccion':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.reaction = isEnable
      break
      
    case 'nsfw':
    case 'modohorny':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.nsfw = isEnable
      break

    case 'jadibotmd':
    case 'modejadibot':
      isAll = true
      if (!isOwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      bot.jadibotmd = isEnable
      break

    case 'detect':
    case 'avisos':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.detect = isEnable
      break

    case 'antilink':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiLink = isEnable
      break

    case 'antifake':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antifake = isEnable
      break

    case 'autosticker':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.autosticker = isEnable
      break
  }

  chat[type] = isEnable;
  conn.reply(m.chat, `✅ La función *${type}* se *${isEnable ? 'activó' : 'desactivó'}* ${isAll ? 'para todo el bot' : 'para este chat'}`, m);
};

handler.help = ['welcome', 'bienvenida', 'antiprivado', 'antiprivate', 'restrict', 'restringir', 'autolevelup', 'autonivel', 'antibot', 'antibots', 'autoaceptar', 'aceptarauto', 'autorechazar', 'rechazarauto', 'autoresponder', 'autorespond', 'antisubbots', 'antibot2', 'modoadmin', 'soloadmin', 'reaction', 'reaccion', 'nsfw', 'modohorny', 'antispam', 'jadibotmd', 'modejadibot', 'subbots', 'detect', 'avisos', 'antilink', 'antifake', 'autosticker']
handler.tags = ['nable']
handler.command = ['on', 'off', 'welcome', 'bienvenida', 'antiprivado', 'antiprivate', 'restrict', 'restringir', 'autolevelup', 'autonivel', 'antibot', 'antibots', 'autoaceptar', 'aceptarauto', 'autorechazar', 'rechazarauto', 'autoresponder', 'autorespond', 'antisubbots', 'antibot2', 'modoadmin', 'soloadmin', 'reaction', 'reaccion', 'nsfw', 'modohorny', 'antispam', 'jadibotmd', 'modejadibot', 'subbots', 'detect', 'avisos', 'antilink', 'antifake', 'autosticker']

export default handler*/

import { createHash } from 'crypto'
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = command.toLowerCase()
  let isEnable

  const showStatus = (key) => {
    const estado = chat[key] || false
    return conn.reply(m.chat, `La función *${key}* está actualmente: ${estado ? '✅ ACTIVADA' : '✖️ DESACTIVADA'}.\n\nUsa:\n${usedPrefix + key} on – para activar\n${usedPrefix + key} off – para desactivar`, m)
  }

  if (!['on', 'enable', 'off', 'disable'].includes(args[0])) {
    if ([
      'welcome', 'bienvenida', 'autoaceptar', 'soloadmin', 'nsfw', 'modohorny', 'detect',
      'antilink', 'antifake', 'antibot', 'antibot2', 'autosticker'
    ].includes(type)) {
      return showStatus(type)
    } else {
      return conn.reply(m.chat, `Uso correcto:\n${usedPrefix}${type} on/off\n\nOpciones válidas:\nwelcome\nautoaceptar\nsoloadmin\nnsfw\ndetect\nantilink\nantifake\nantibot\nantibot2\nautosticker`, m)
    }
  }

  isEnable = /true|enable|on|(turn)?on/i.test(args[0])

  switch (type) {
    case 'welcome':
    case 'bienvenida':
      if (m.isGroup && !isAdmin && !isOwner) return global.dfail('admin', m, conn)
      chat.welcome = isEnable
      break

    case 'autoaceptar':
      if (m.isGroup && !isAdmin && !isOwner) return global.dfail('admin', m, conn)
      chat.autoAceptar = isEnable
      break

    case 'soloadmin':
      if (m.isGroup && !isAdmin && !isOwner) return global.dfail('admin', m, conn)
      chat.modoadmin = isEnable
      break

    case 'nsfw':
    case 'modohorny':
      if (m.isGroup && !isAdmin && !isOwner) return global.dfail('admin', m, conn)
      chat.nsfw = isEnable
      break

    case 'detect':
      if (m.isGroup && !isAdmin && !isOwner) return global.dfail('admin', m, conn)
      chat.detect = isEnable
      break

    case 'antilink':
      if (m.isGroup && !isAdmin && !isOwner) return global.dfail('admin', m, conn)
      chat.antiLink = isEnable
      break

    case 'antifake':
      if (m.isGroup && !isAdmin && !isOwner) return global.dfail('admin', m, conn)
      chat.antifake = isEnable
      break

    case 'antibot':
      if (m.isGroup && !isAdmin && !isOwner) return global.dfail('admin', m, conn)
      chat.antiBot = isEnable
      break

    case 'antibot2':
      if (m.isGroup && !isAdmin && !isOwner) return global.dfail('admin', m, conn)
      chat.antiBot2 = isEnable
      break

    case 'autosticker':
      if (m.isGroup && !isAdmin && !isOwner) return global.dfail('admin', m, conn)
      chat.autosticker = isEnable
      break

    default:
      return conn.reply(m.chat, `⚠️ Opción desconocida. Usa:\n${usedPrefix}${command} <on/off>\n\nOpciones válidas:\nwelcome\nautoaceptar\nsoloadmin\nnsfw\ndetect\nantilink\nantifake\nantibot\nantibot2\nautosticker`, m)
  }

  conn.reply(m.chat, `✅ La función *${type}* fue *${isEnable ? 'activada' : 'desactivada'}* correctamente.`, m)
}

handler.help = ['on', 'off'].map(v => v + ' <función>')
handler.tags = ['nable']
handler.command = [
  'on', 'off',
  'welcome', 'bienvenida',
  'autoaceptar', 'soloadmin',
  'nsfw', 'modohorny',
  'detect', 'antilink',
  'antifake', 'antibot',
  'antibot2', 'autosticker'
]

export default handler
