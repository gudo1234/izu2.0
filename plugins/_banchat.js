let handler = async (m, { conn, usedPrefix, command, args }) => {
let chat = global.db.data.chats[m.chat]
if (command === 'bot') {
if (args.length === 0) {
const estado = chat.isBanned ? '✗ Desactivado' : '✓ Activado'
const info = `${e} Un administrador puede activar o desactivar el bot utilizando:\n\n✐ _Activar_ » *${usedPrefix}bot enable*\n✐ _Desactivar_ » *${usedPrefix}bot disable*\n\n✧ Estado actual » *${estado}*`
return conn.reply(m.chat, info, m)
}
if (args[0] === 'off') {
if (chat.isBanned) {
return conn.reply(m.chat, `${e} Ya estaba desactivado.`, m)
}
chat.isBanned = true
return conn.reply(m.chat, `${e} Has *desactivado* al bot!`, m)
} else if (args[0] === 'on') {
if (!chat.isBanned) {
return conn.reply(m.chat, `${e} Ya estaba activado.`, m)
}
chat.isBanned = false
return conn.reply(m.chat, `${e} Has *activado* al bot`, m)
}}}

handler.command = ['bot']
handler.admin = true

export default handler
