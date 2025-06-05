const handler = async (m, { conn, args, command, isOwner }) => {
  if (!isOwner) return global.dfail('rowner', m, conn)
  const accion = command === 'activar' ? 'activar' : 'desactivar'
  const comando = (args[0] || '').toLowerCase()

  if (!comando) {
    const lista = global.db.data.settings[conn.user.jid]?.disabledCommands || []
    return conn.reply(m.chat, lista.length
      ? `🚫 *Comandos desactivados globalmente:*\n- ${lista.join('\n- ')}\n\nUsa *.activar <comando>* para reactivarlos.`
      : '✅ *Actualmente no hay comandos desactivados.*', m)
  }

  const settings = global.db.data.settings[conn.user.jid] || (global.db.data.settings[conn.user.jid] = {})
  settings.disabledCommands = settings.disabledCommands || []

  if (accion === 'desactivar') {
    if (settings.disabledCommands.includes(comando)) {
      return conn.reply(m.chat, `⚠️ El comando *${comando}* ya está desactivado globalmente.`, m)
    }
    settings.disabledCommands.push(comando)
    return conn.reply(m.chat, `✅ El comando *${comando}* ha sido desactivado globalmente.`, m)
  } else {
    if (!settings.disabledCommands.includes(comando)) {
      return conn.reply(m.chat, `⚠️ El comando *${comando}* no está desactivado.`, m)
    }
    settings.disabledCommands = settings.disabledCommands.filter(cmd => cmd !== comando)
    return conn.reply(m.chat, `✅ El comando *${comando}* ha sido activado nuevamente.`, m)
  }
}

handler.help = ['activar <comando>', 'desactivar <comando>']
handler.tags = ['owner']
handler.command = ['activar', 'desactivar']
handler.rowner = true

export default handler
