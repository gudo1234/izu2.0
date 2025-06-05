import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, args, command, isOwner }) => {
  if (!isOwner) return global.dfail('rowner', m, conn)

  const accion = command === 'activar' ? 'activar' : 'desactivar'
  const comando = (args[0] || '').toLowerCase()

  const settings = global.db.data.settings[conn.user.jid] || (global.db.data.settings[conn.user.jid] = {})
  settings.disabledCommands = settings.disabledCommands || []

  if (!comando) {
    const lista = settings.disabledCommands
    return conn.reply(m.chat, lista.length
      ? `🚫 *Comandos desactivados globalmente:*\n- ${lista.join('\n- ')}\n\nUsa *.activar <comando>* para reactivarlos.`
      : '✅ *Actualmente no hay comandos desactivados.*', m)
  }

  // --- Gestión del plugin en el sistema de archivos ---
  const pluginFolder = './plugins'
  const archivos = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'))
  const foundFile = archivos.find(file => path.basename(file, '.js').toLowerCase() === comando)
  const fullPath = foundFile && path.resolve(pluginFolder, foundFile)
  const plugin = foundFile && (global.plugins[fullPath] || Object.entries(global.plugins).find(([k]) => k.endsWith(foundFile))?.[1])

  // --- Desactivar ---
  if (accion === 'desactivar') {
    if (settings.disabledCommands.includes(comando)) {
      return conn.reply(m.chat, `⚠️ El comando *${comando}* ya está desactivado globalmente.`, m)
    }
    settings.disabledCommands.push(comando)

    if (plugin && !plugin.disabled) plugin.disabled = true

    return conn.reply(m.chat, `🛑 El comando *${comando}* ha sido desactivado globalmente${plugin ? ' y su plugin fue desactivado.' : '.'}`, m)
  }

  // --- Activar ---
  if (!settings.disabledCommands.includes(comando)) {
    return conn.reply(m.chat, `⚠️ El comando *${comando}* no está desactivado.`, m)
  }
  settings.disabledCommands = settings.disabledCommands.filter(cmd => cmd !== comando)

  if (plugin && plugin.disabled) plugin.disabled = false

  return conn.reply(m.chat, `✅ El comando *${comando}* ha sido activado globalmente${plugin ? ' y su plugin fue activado.' : '.'}`, m)
}

handler.help = ['activar <comando>', 'desactivar <comando>']
handler.tags = ['owner']
handler.command = ['activar', 'desactivar']
handler.rowner = true

export default handler
