let { downloadContentFromMessage } = (await import('@whiskeysockets/baileys'));

let handler = async (m, { conn }) => {
if (!m.quoted) return conn.reply(m.chat, `${e} Responde a una imagen ViewOnce.`, m)
if (!m?.quoted || !m?.quoted?.viewOnce) return conn.reply(m.chat, `${e} Responde a una imagen ViewOnce.`, m)
let buffer = await m.quoted.download(false);
m.react('🕒')
if (/videoMessage/.test(m.quoted.mtype)) {
return conn.sendFile(m.chat, buffer, 'media.mp4', m.quoted.caption || '', m, null, rcanal)
} else if (/imageMessage/.test(m.quoted.mtype)) {
return conn.sendFile(m.chat, buffer, 'media.jpg', m.quoted?.caption || '', m, null, rcanal)
} else if (/aidioMessage/.test(m.quoted.mtype)) {
conn.sendFile(m.chat, buffer, '', null, m, true, { 
type: 'audioMessage', 
ptt: true 
})
}}

handler.command = ['readviewonce', 'read', 'readvo', 'rvo', 'ver'] 
handler.group = true;

export default handler
