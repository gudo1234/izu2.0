let handler = async (m, { conn, args, usedPrefix, command }) => {
let txt = `Hola ${m.pushName} mi nombre es *izuBot* y cuento con un sistema automático con comandos que puede ayudar, buscar datos e información a través de \`WhatsApp\` y mucho más.

> ⁉ ғᴜɴᴄɪóɴ ɢʀᴜᴘᴏ⚙️
${e}${s}kick *‹@υsєя›*
${e}${s}link
${e}${s}admins *‹τ×τ›*
${e}${s}infogrupo
${e}${s}tagall *‹τ×τ›*
${e}${s}hideteg *‹τ×τ›*
${e}${s}tag *‹rєρℓy›*
${e}${s}icongc *‹rєρℓy›*
${e}${s}grupo *‹αвrir/cєrrαr›*
${e}${s}on/off
${e}${s}promote *‹@υsєя›*
${e}${s}demote *‹@υsєя›*

> ⁉ ᴅᴇsᴄᴀʀɢᴀs ᴍᴜʟᴛɪᴍᴇᴅɪᴀ📂
${e}${s}play *‹τ×τ›*
${e}${s}play2 *‹τ×τ›*
${e}${s}play3 *‹τ×τ›*
${e}${s}play4 *‹τ×τ›*
${e}${s}instagram *‹υяʟ›*
${e}${s}tiktok *‹υяʟ›*
${e}${s}twitter *‹υяʟ›*
${e}${s}mediafire *‹υяʟ›*

> ʜᴇʀʀᴀᴍɪᴇɴᴛᴀs🧮
${e}${s}hd *‹rєρℓy›*`
await conn.sendMessage(m.chat, {
      text: txt,
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
              thumbnailUrl: icono,
              mediaType: 1,
              showAdAttribution: true,
              renderLargerThumbnail: true,
          },
      },
  }, { quoted: m });
}

handler.command = ['menu', 'm']
handler.group = true
export default handler
