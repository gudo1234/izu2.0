import yts from 'yt-search'

var handler = async (m, { text, conn, args, command, usedPrefix }) => {

if (!text) return conn.reply(m.chat, `${e} *Escriba el título de algún vídeo de Youtube*\n\nEjemplo, ${usedPrefix + command} Ricardo Arjona`, m)

let results = await yts(text)
let tes = results.all
let teks = results.all.map(v => {
switch (v.type) {
case 'video': return `\`${v.title}\`
*Enlace:* ${v.url}
*Duración:* ${v.timestamp}
*Subido:* ${v.ago}
*Vistas:* ${v.views}`}}).filter(v => v).join('\n\n')

conn.sendFile(m.chat, tes[0].thumbnail, 'yts.jpeg', teks, m, null, rcanal)

}

handler.command = ['playlist', 'ytbuscar', 'yts', 'ytsearch']
handler.group = true;

export default handler
