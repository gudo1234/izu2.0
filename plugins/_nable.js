import { createHash } from 'crypto'

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  const chat = global.db.data.chats[m.chat]
  const bot = global.db.data.settings[conn.user.jid] || {}

  let type = (command || '').toLowerCase()
  let isAll = false
  let isEnable

  // Permitir .on función o .función on (ambos)
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
    // Mostrar lista de funciones y estado
    const funciones = {
      welcome: chat.welcome,
      autoaceptar: chat.autoaceptar,
      soloadmin: chat.modoadmin,
      nsfw: chat.nsfw,
      detect: chat.detect,
      antilink: chat.antilink,
      antifake: chat.antifake,
      antibot: chat.antibot,
      antibot2: chat.antibot2,
      autosticker: chat.autosticker,
      antiprivado: bot.antiprivado,
      jadibotmd: bot.jadibotmd
    }

    let texto = '*⚙️ Lista de funciones y su estado:*\n\n'
    for (const [k, v] of Object.entries(funciones)) {
      texto += `> ${k.padEnd(14)} ${v ? '✓ Activado' : '✗ Desactivado'}\n`
    }
    texto += `\nUsa: \`${usedPrefix}on\` *<función>* o \`${usedPrefix}off\` *<función>*`

    return conn.reply(m.chat, texto.trim(), m)
  }

  if (!type) return conn.reply(m.chat, `${e} Especifica una función. Ejemplo:\n${usedPrefix}on autosticker`, m)

  // Funciones por grupo
  const groupFunctions = [
    'welcome', 'autoaceptar', 'modoadmin', 'nsfw',
    'detect', 'antilink', 'antifake', 'antibot', 'antibot2', 'autosticker'
  ]

  if (groupFunctions.includes(type)) {
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

  // Funciones globales
  const globalFunctions = ['antiprivado', 'jadibotmd']
  if (globalFunctions.includes(type)) {
    isAll = true
    if (!isOwner) {
      global.dfail('rowner', m, conn)
      throw false
    }
    bot[type] = isEnable
  }

  conn.reply(m.chat, `✅ La función *${type}* fue *${isEnable ? 'activada' : 'desactivada'}* ${isAll ? 'a nivel global' : 'para este chat'}`, m)
}

handler.help = ['on <función>', 'off <función>']
handler.tags = ['nable']
handler.command = ['on', 'off', 'enable', 'disable']

export default handler
