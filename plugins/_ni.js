const handler = async (m, { conn }) => {
await conn.sendMessage(m.chat, {
video: { url: 'https://files.catbox.moe/nchm7h.mp4' },
gifPlayback: true,
caption: 'Puta',
contextInfo: {
mentionedJid: [m.sender],
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: '120363417186717632@newsletter',
newsletterName: 'Canal de mierda',
serverMessageId: -1,
},
forwardingScore: false,
externalAdReply: {
title: 'negro',
body: 'holaa',
thumbnailUrl: 'https://whatsapp.com/channel/0029VaXHNMZL7UVTeseuqw3H',
thumbnail: 'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me5.jpg',
sourceUrl: 'https://whatsapp.com/channel/0029VaXHNMZL7UVTeseuqw3H',
mediaType: 1,
showAdAttribution: false,
},
},
}, { quoted: m })
}

handler.command = ['pru']
export default handler
