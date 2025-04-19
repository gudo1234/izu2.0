import { toPTT } from '../lib/converter.js'

var handler = async (m, { conn, usedPrefix, command }) => {

let q = m.quoted ? m.quoted : m
let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
if (!/video|audio/.test(mime)) throw `${e} Responda a un video o audio para convertirlo en nota de voz`
let name = await conn.getName(m.sender)
await conn.sendMessage(m.chat, { text: global.espere + `*${name}*`, contextInfo: { externalAdReply: {title: `${wm}`, body: `${await conn.getName(m.chat)}`, humbnailUrl: imagen4, thumbnail: imagen4, showAdAttribution: true, sourceUrl: canal}}} , { quoted: fkontak })
await m.react('🕓')
let media = await q.download?.()
if (!media && !/video/.test(mime)) throw ''
if (!media && !/audio/.test(mime)) throw '🧧 Ocurrió un error vielve s intetarlo'
let audio = await toPTT(media, 'mp4')
if (!audio.data && !/audio/.test(mime)) throw '🧧 Ocurrió un error vielve a intentarlo'
if (!audio.data && !/video/.test(mime)) throw '🧧 ocurrió un error vielve a intentarlo'
conn.sendFile(m.chat, audio.data, 'error.mp3', '', m, true, { mimetype: 'audio/mp4' })
await m.react('✅')
    
}
handler.help = ['tovn']
handler.tags = ['transformador']
handler.command = ['toptt', 'tovn']
handler.group = true;

export default handler