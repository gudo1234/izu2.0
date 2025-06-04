let handler = async (m, { conn, args, usedPrefix, command }) => {
const thumbnail = await (await fetch(icono)).buffer()
  await conn.sendMessage(m.chat, {
      video: { url: './media/giff.mp4'},
      gifPlayback: true,
      caption: 'hola',
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          newsletterName: channelRD.name,
          serverMessageId: -1,
        },
        forwardingScore: false,
        externalAdReply: {
          title: botname,
          body: textbot,
          thumbnailUrl: redes,
          thumbnail,
          sourceUrl: redes,
          mediaType: 1,
          showAdAttribution: true,
        },
      },
    }, { quoted: m })
}

handler.command = ['te']
handler.group = true
export default handler
