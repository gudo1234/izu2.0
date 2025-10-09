let handler = async (m, { conn }) => {
  const thumbnail = await (await fetch(icono)).buffer()
  let _uptime = process.uptime() * 1000
  let uptime = clockString(_uptime)

  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'))

  let txt = `\`⁉ ɪɴғᴏ - ʙᴏᴛ\`
┌────────────
│ *ᴍᴏᴅᴏ* ‹público›
│ *ᴘʀᴇғɪᴊᴏ* ‹(#./!)›
│ *ɢʀᴜᴘᴏs ᴜɴɪᴅᴏs:* ‹${groupsIn.length}›
│ *ᴛɪᴇᴍᴘᴏ ᴀᴄᴛɪᴠᴏ:* ‹${uptime}›
└────────────`

  await conn.sendMessage(m.chat, {
    text: txt,
    footer: textbot,
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
        showAdAttribution: false,
        renderLargerThumbnail: true,
      },
    },
  }, { quoted: m })
}

handler.command = ['info', 'infobot', 'botinfo']
export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
