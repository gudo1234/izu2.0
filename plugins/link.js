var handler = async (m, { conn, args }) => {

let group = m.chat
let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
conn.reply(m.chat, `${e} *Enlace de invitación del grupo*\n` + link, null, m, { detectLink: true })

}
handler.help = ['link']
handler.tags = ['grupo']
handler.command = ['link', 'linkgc']

handler.group = true
handler.botAdmin = true

export default handler
