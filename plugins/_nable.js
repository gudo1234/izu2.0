import { createHash } from 'crypto'

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  const chat = global.db.data.chats[m.chat]
  const user = global.db.data.users[m.sender]
  const bot = global.db.data.settings[conn.user.jid] || {}

  let type = (command || '').toLowerCase()
  let isAll = false
  let isEnable

  // Permitir .on feature o .feature on (ambos)
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
    // Si no se especifica correctamente, mostrar todas las funciones y su estado
    const funciones = {
      welcome: chat.welcome,
      autoaceptar: chat.autoaceptar,
      autorechazar: chat.autorechazar,
      soloadmin: chat.modoadmin,
      reaction: chat.reaction,
      nsfw: chat.nsfw,
      detect: chat.detect,
      antilink: chat.antilink,
      antifake: chat.antifake,
      antibot: chat.antibot,
      antibot2: chat.antibot2,
      autoresponder: chat.autoresponder,
      autosticker: chat.autosticker,
      antiprivado: bot.antiprivado,
      restrict: bot.restrict,
      jadibotmd: bot.jadibotmd
    }

    let texto = '*⚙️ Lista de funciones y su estado:*\n\n'
    for (const [k, v] of Object.entries(funciones)) {
      texto += `> ${k.padEnd(14)} ${v ? '✓ Activado' : '✗ Desactivado'}\n`
    }
    texto += `\nUsa: *${usedPrefix}on <función>* o *${usedPrefix}off <función>*`

    return conn.reply(m.chat, texto.trim(), m)
  }

  if (!type) return conn.reply(m.chat, `${e} Especifica una función. Ejemplo:\n${usedPrefix}on autosticker`, m)

  // Permisos de grupo
  const requiresGroup = [
    'welcome', 'autoaceptar', 'autorechazar', 'modoadmin', 'reaction', 'nsfw',
    'detect', 'antilink', 'antifake', 'antibot', 'antibot2', 'autoresponder', 'autosticker'
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

  // Permisos globales
  const requiresGlobal = ['restrict', 'antiprivado', 'jadibotmd']
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
