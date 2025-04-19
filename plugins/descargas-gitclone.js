import fetch from 'node-fetch'
const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
let handler = async (m, { args, usedPrefix, command, text}) => {
//if (!args[0]) return conn.reply(m.chat, `${e} Ingrese un enlace de github, ejemplo: ${usedPrefix + command} https://github.com/WhiskeySockets/Baileys`, m, {contextInfo: {externalAdReply :{ mediaUrl: null, mediaType: 1, description: null, title: mg, body: 'GitClone', previewType: 0, thumbnail: img.getRandom(), sourceUrl: redes.getRandom()}}})    
if (!text) return conn.reply(m.chat, `${e} Ingrese un enlace de github, ejemplo: ${usedPrefix + command} https://github.com/WhiskeySockets/Baileys`, m)
  if (!regex.test(args[0])) return conn.reply(m.chat, `Link no valido`, m, {contextInfo: {externalAdReply :{ mediaUrl: null, mediaType: 1, description: null, title: iig, body: 'GitClone', previewType: 0, thumbnail: img.getRandom(), sourceUrl: redes.getRandom()}}})
try {   
let [_, user, repo] = args[0].match(regex) || []
repo = repo.replace(/.git$/, '')
let url = `https://api.github.com/repos/${user}/${repo}/zipball`
let filename = (await fetch(url, { method: 'HEAD' })).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
let name = await conn.getName(m.sender)
await conn.sendMessage(m.chat, { text: global.espere + `*${name}*`, contextInfo: { externalAdReply: {title: `${wm}`, body: `${await conn.getName(m.chat)}`, humbnailUrl: imagen4, thumbnail: imagen4, showAdAttribution: true, sourceUrl: canal}}} , { quoted: fkontak })
conn.sendFile(m.chat, url, filename, null, m)
handler.limit = 0
} catch { 
handler.limit = 0 //❌No gastada diamante si el comando falla
}}
handler.help = ['gitclone <url>']
handler.tags = ['downloader']
handler.command = ['gitclone', 'clonarepo', 'clonarrepo', 'repoclonar']
handler.group = true;
export default handler
