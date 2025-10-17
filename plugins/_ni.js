import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
m.react('✅')
const thumbnail = await (await fetch(icono)).buffer()
await conn.sendMessage(m.chat, {
text: 'hsloo',
contextInfo: {
externalAdReply: {
title: wm,
body: textbot,
thumbnail,
thumbnailUrl: redes,
sourceUrl: redes,
mediaType: 2,
renderLargerThumbnail: true
}
}
}, { quoted: m })
}

handler.command = ['ni']
export default handler

