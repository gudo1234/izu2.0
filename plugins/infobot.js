import { generateWAMessageFromContent } from "@whiskeysockets/baileys"
import { cpus as _cpus, totalmem, freemem } from 'os'
import { performance } from 'perf_hooks'
import { sizeFormatter } from 'human-readable'

let format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

let handler = async (m, { conn, usedPrefix, command }) => {
  const thumbnail = await (await fetch(icono)).buffer()
  let _uptime = process.uptime() * 1000
  let uptime = clockString(_uptime)
  let totalreg = Object.keys(global.db.data.users).length

  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'))

  let groupList = ''
  for (const [id, chat] of groupsIn) {
    try {
      const metadata = await conn.groupMetadata(id)
      const isBotAdmin = metadata.participants.find(p => p.id === conn.user.jid && p.admin)
      const groupName = metadata.subject
      let link = ''
      if (isBotAdmin) {
        const code = await conn.groupInviteCode(id)
        link = `\n> https://chat.whatsapp.com/${code}`
      }
      groupList += `• ${groupName} ${link}\n`
    } catch (e) {
      groupList += `• [Error al obtener info de grupo: ${id}]\n`
    }
  }

  const txt = `\`⁉ ɪɴғᴏ - ʙᴏᴛ\`
┌────────────
│ ${e}${s} *ᴍᴏᴅᴏ* ‹público›
│ ${e}${s} *ᴘʀᴇғɪᴊᴏ* ‹(#./!)›
│ ${e}${s} *ɢʀᴜᴘᴏs ᴜɴɪᴅᴏs* ‹${groupsIn.length}›
│ ${e}${s} *ᴛɪᴇᴍᴘᴏ ᴀᴄᴛɪᴠᴏ:*  ‹${uptime}›
└────────────

*Lista de grupos donde está el bot:*
${groupList.trim()}`

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
        showAdAttribution: true,
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
