export async function before(m, { isAdmin, isBotAdmin, isOwner }) {
    if (m.fromMe) return
    if (m.isBaileys && m.fromMe)
        return !0
    if (m.isGroup)
       return !1
    if (!m.message)
       return !0
    if (m.text.includes('.serbot') || m.text.includes('.serbot --code') || m.text.includes('.bots') || m.text.includes('.deletesesion') || m.text.includes('.serbot code'))
       return !0
    let chat = global.db.data.chats[m.chat]
    let bot = global.db.data.settings[this.user.jid] || {}
if (m.chat === '120363395205399025@newsletter') return !0
    if (bot.antiPrivate && !isOwner) {
let edar = 'wa.me/50492280729?text=${redes}`
let vn = './media/ocupado.mp3'
let txt = `,    /)🎩/)
    (｡•ㅅ•｡)𖹭︩︪𝚆꯭᪶۫۫͝𝙴꯭᪶͡𝙻᪶۫۫͝𝙲꯭᪶֟፟፝͡𝙾᪶۫۫͝𝙼꯭᪶͡𝙴᪶𖹭︩︪*
    ╭∪─∪─────────❤︎₊᪲
Hola *@${m.sender.split`@`[0]}*\n\n${e} *No está permitido usar el bot en chat privado.*\n\n> 🌟Si está interesado en mis servicios contacte a mi desarrollador, o puedes seguir el canal para mantenerte informado de las actualizaciones.`
    this.sendButtonMessages(m.chat, [
[txt, '𝗉𝗈𝗐𝖾𝗋𝖾𝖽 ⓒ 𝖨𝗓𝗎𝖻𝗈𝗍 𝟤𝟢𝟤𝟢-𝟤𝟢𝟤5.', icono, [

], null, [
['Desarrollador', edar], ['Seguir', channel]
],
[]
]], m)
await this.sendFile(m.chat, vn, 'error.mp3', null,null, true, { type: 'audioMessage', ptt: true })
       await this.updateBlockStatus(m.chat, 'block')
    }
    return !1
         }
