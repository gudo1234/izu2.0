import { getDevice } from "@whiskeysockets/baileys"
import PhoneNumber from 'awesome-phonenumber'
let handler = async (m, { conn, args, usedPrefix, command }) => {
const nkdt = new Date();
const nktm = nkdt.getHours();
let delirius = await axios.get(`https://delirius-apiofc.vercel.app/tools/country?text=${PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')}`)
  let paisdata = delirius.data.result
  let mundo = paisdata ? `${paisdata.name} ${paisdata.emoji}` : 'Desconocido'
let txt = `🗣️ Hola, *🥀Buenos días🌅tardes🌇noches🌆*\n\n⚡Mi nombre es *izuBot* y cuento con un sistema automático con comandos que puede ayudar, buscar datos e información a través de \`WhatsApp\` y mucho más.

> ⁉ ᴄᴏɴᴛᴇxᴛ-ɪɴғᴏ☔
╔ְֺ─┅፝֟─ׅ━⃜─╲╳⵿╲⵿݊╱⵿╳╱─━ׅ⃜─፝֟┅ְֺ╗
*🚩]▸Nombre:* ${m.pushName}
🌎 *Pais/Móvil:* ${mundo}
(${getDevice(m.key.id)})
*🗓]▸Fecha:* ${moment.tz('America/Bogota').format('DD/MM/YY')}
╚ְֺ─┅፝֟─ׅ━⃜─╲╳⵿╲⵿݊╱⵿╳╱─━ׅ⃜─፝֟┅ְֺ╝

> ⁉ ғᴜɴᴄɪóɴ ɢʀᴜᴘᴏ⚙️
╔ְֺ─┅፝֟─ׅ━⃜─╲╳⵿╲⵿݊╱⵿╳╱─━ׅ⃜─፝֟┅ְֺ╗
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
╚ְֺ─┅፝֟─ׅ━⃜─╲╳⵿╲⵿݊╱⵿╳╱─━ׅ⃜─፝֟┅ְֺ╝

> ⁉ ᴅᴇsᴄᴀʀɢᴀs ᴍᴜʟᴛɪᴍᴇᴅɪᴀ📂
╔ְֺ─┅፝֟─ׅ━⃜─╲╳⵿╲⵿݊╱⵿╳╱─━ׅ⃜─፝֟┅ְֺ╗
${e}${s}play *‹τ×τ›*
${e}${s}play2 *‹τ×τ›*
${e}${s}play3 *‹τ×τ›*
${e}${s}play4 *‹τ×τ›*
${e}${s}facebook *‹υяʟ›*
${e}${s}instagram *‹υяʟ›*
${e}${s}tiktokvid *‹τ×τ›*
${e}${s}tiktok *‹υяʟ›*
${e}${s}tiktokimg *‹υяʟ›*
${e}${s}twitter *‹υяʟ›*
${e}${s}mediafire *‹υяʟ›*
${e}${s}apk *‹τ×τ›*
${e}${s}gitclone *‹υяʟ›*
${e}${s}xnxxdl *‹υяʟ›*
${e}${s}xvideosdl *‹υяʟ›*
${e}${s}imagen *‹τ×τ›*
${e}${s}pinterest *‹υяʟ›*
${e}${s}ytmp3 *‹υяʟ›*
${e}${s}ytmp4 *‹υяʟ›*
${e}${s}ytmp3doc *‹υяʟ›*
${e}${s}ytmp4doc *‹υяʟ›*
${e}${s}spotify *‹τ×τ›*
${e}${s}mega *‹υяʟ›*
${e}${s}gdrive *‹υяʟ›*
${e}${s}terabox *‹υяʟ›*
╚ְֺ─┅፝֟─ׅ━⃜─╲╳⵿╲⵿݊╱⵿╳╱─━ׅ⃜─፝֟┅ְֺ╝

> ⁉ ʜᴇʀʀᴀᴍɪᴇɴᴛᴀs🧮
╔ְֺ─┅፝֟─ׅ━⃜─╲╳⵿╲⵿݊╱⵿╳╱─━ׅ⃜─፝֟┅ְֺ╗
${e}${s}toptt *‹rєρℓy›*
${e}${s}tovid *‹rєρℓy›*
${e}${s}tomp3 *‹rєρℓy›*
${e}${s}toimg *‹rєρℓy›*
${e}${s}ver *‹rєρℓy›*
${e}${s}sticker *‹rєρℓy›*
${e}${s}hd *‹rєρℓy›*
${e}${s}ssweb *‹υяʟ›*
${e}${s}qc *‹τ×τ›*
${e}${s}tts *‹τ×τ›*
${e}${s}wm *‹τ×τ›*
${e}${s}take *‹τ×τ›*
${e}${s}emojimix 😍+🥰
${e}${s}vcard #
${e}${s}tweet *‹τ×τ›*
${e}${s}whamusic *‹rєρℓy›*
${e}${s}ttp *‹τ×τ›*
${e}${s}par ...
╚ְֺ─┅፝֟─ׅ━⃜─╲╳⵿╲⵿݊╱⵿╳╱─━ׅ⃜─፝֟┅ְֺ╝`
m.react('🏖️')
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
