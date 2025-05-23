let handler = async (m, { conn }) => {
  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'))

  if (!groupsIn.length) return m.reply('El bot no está en ningún grupo.')

  const thumbnail = await (await fetch(icono)).buffer()
  let texto = '*Lista de grupos donde está el bot:*\n\n'
  let mentions = []
  let count = 1

  for (const [id] of groupsIn) {
    try {
      const metadata = await conn.groupMetadata(id)
      const isBotAdmin = metadata.participants.find(p => p.id === conn.user.jid && p.admin)
      const admins = metadata.participants.filter(p => p.admin).map(p => p.id)
      const adminTags = admins.map(jid => '@' + jid.split('@')[0]).join(', ')
      const groupName = metadata.subject

      texto += `*${count}. ${groupName}*\n`
      texto += `› Estado del bot: ${isBotAdmin ? 'Administrador' : 'No administrador'}\n`

      if (isBotAdmin) {
        const code = await conn.groupInviteCode(id)
        texto += `› Link: https://chat.whatsapp.com/${code}\n`
        texto += `› Admins: ${adminTags}\n`
        mentions.push(...admins)
      }

      texto += '\n'
      count++

    } catch (e) {
      texto += `*${count}. [Error al acceder al grupo]*\n\n`
      count++
    }
  }

  await conn.sendMessage(m.chat, {
    text: texto.trim(),
    contextInfo: {
      mentionedJid: mentions,
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

handler.command = ['grupos']
export default handler
