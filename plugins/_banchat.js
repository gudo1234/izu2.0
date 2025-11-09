let handler = async (m, { conn, usedPrefix, command, args }) => {
let chat = global.db.data.chats[m.chat]
if (command === 'bot') {
if (args.length === 0) {
const estado = chat.isBanned ? '✗ Desactivado' : '✓ Activado'
const info = `${e} Un administrador puede activar o desactivar a la Bot* utilizando:\n\n> _Activar_ : *${usedPrefix}bot enable*\n_Desactivar_ *${usedPrefix}bot disable*\n\n> Estado actual: *${estado}*`
return conn.reply(m.chat, info, m)
}
if (args[0] === 'off') {
if (chat.isBanned) {
return conn.reply(m.chat, `${e} La Bot ya estaba desactivado.`, m)
}
chat.isBanned = true
return conn.reply(m.chat, `${e} Has *desactivado* a la Bot!`, m)
} else if (args[0] === 'on') {
if (!chat.isBanned) {
return conn.reply(m.chat, `${e} La Bot ya estaba activado.`, m)
}
chat.isBanned = false
return conn.reply(m.chat, `${e} Has *activado* a la Bot!`, m)
}}}


handler.command = ['bot']
handler.admin = true

export default handler
