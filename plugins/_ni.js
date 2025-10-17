const handler = async (m, { conn }) => {
await conn.sendMessage(m.chat, {
video: { url: 'https://files.catbox.moe/nchm7h.mp4' },
gifPlayback: true,
caption: 'Prueba de GIF',
contextInfo: {
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: '120363417186717632@newsletter',
newsletterName: 'Canal de prueba',
serverMessageId: -1
},
externalAdReply: {
title: 'negro',
body: 'holaa',
thumbnailUrl: 'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me5.jpg',
sourceUrl: 'https://whatsapp.com/channel/0029VaXHNMZL7UVTeseuqw3H',
mediaType: 1,
showAdAttribution: false
}
}
}, { quoted: m })
}

handler.command = ['pru']
export default handler
