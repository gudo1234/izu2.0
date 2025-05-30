const handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner }) => {
  const chat = global.db.data.chats[m.chat]
  const bot = global.db.data.settings[conn.user.jid] || {}

  let input = (args[0] || '').toLowerCase()
  let second = (args[1] || '').toLowerCase()

  let type = ''
  let isEnable = null

  // Detecta formatos: .on autosticker | .autosticker on | .autosticker
  if (input === 'on' || input === 'enable') {
    type = second
    isEnable = true
  } else if (input === 'off' || input === 'disable') {
    type = second
    isEnable = false
  } else {
    type = input
  }

  const options = {
    welcome: { name: 'welcome', group: true },
    autoaceptar: { name: 'autoaceptar', group: true },
    soloadmin: { name: 'modoadmin', group: true },
    modohorny: { name: 'nsfw', group: true },
    detect: { name: 'detect', group: true },
    antilink: { name: 'antiLink', group: true },
    antifake: { name: 'antifake', group: true },
    antibot: { name: 'antiBot', group: true },
    antibot2: { name: 'antiBot2', group: true },
    autosticker: { name: 'autosticker', group: true },
    antiprivado: { name: 'antiPrivate', global: true },
    jadibotmd: { name: 'jadibotmd', global: true }
  }

  if (!type || !(type in options)) {
    // Mostrar lista de opciones con su estado actual
    let list = Object.keys(options).map(k => {
      const opt = options[k]
      const val = opt.global ? bot[opt.name] : chat[opt.name]
      return `> *${k}*       ${val ? '✓ Activado' : '✗ Desactivado'}`
    }).join('\n')
    return conn.reply(m.chat, `${e} *Opciones disponibles:*\n\n${list}\n\nEjemplo de uso:\n*.antilink on*\n*.on welcome*`, m)
  }

  const opt = options[type]
  const current = opt.global ? bot[opt.name] : chat[opt.name]

  if (isEnable === null) {
    return conn.reply(m.chat, `✅ *${type}* está actualmente ${current ? '✓ Activado' : '✗ Desactivado'}`, m)
  }

  if (opt.group && m.isGroup && !(isAdmin || isOwner)) {
    global.dfail('admin', m, conn)
    return
  }

  if (opt.global && !isOwner) {
    global.dfail('rowner', m, conn)
    return
  }

  if (opt.global) {
    bot[opt.name] = isEnable
  } else {
    chat[opt.name] = isEnable
  }

  conn.reply(m.chat, `✅ La función *${type}* fue *${isEnable ? 'activada ✓' : 'desactivada ✗'}* ${opt.global ? 'para el bot' : 'en este chat'}`, m)
}

handler.help = ['on', 'off', 'welcome', 'antilink', 'autosticker', 'modohorny', 'antibot', 'antibot2', 'antifake', 'autoaceptar', 'soloadmin', 'detect', 'jadibotmd', 'antiprivado']
handler.tags = ['group', 'admin']
handler.command = /^((en|dis)?able|on|off|autosticker|antilink|antibot2?|antifake|autoaceptar|soloadmin|modohorny|nsfw|welcome|detect|jadibotmd|antiprivado)$/i

export default handler
