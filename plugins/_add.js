let handler = async (m, { conn, args, text, usedPrefix, command }) => {
if (!text) return conn.reply(m.chat, `${e} Por favor, ingrese el número al que quiere enviar una invitación al grupo.`, m)
if (text.includes('+')) return conn.reply(`${e} Ingrese el número todo junto sin el *+*`, m)
if (isNaN(text)) return conn.reply(m.chat, `${e} Ingrese sólo números sin su código de país y sin espacios.*`, m)
let group = m.chat
let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
 
      await conn.reply(text+'@s.whatsapp.net', `${e} *INVITACIÓN A GRUPO*\n\nUn usuario te invitó a unirte a este grupo \n\n${link}`, m, {mentions: [m.sender]})
        m.reply(`${e} Se envió un enlace de invitación al usuario.`) 

}
handler.help = ['invite *<521>*']
handler.tags = ['group']
handler.command = ['add', 'agregar', 'añadir']
handler.group = true
handler.admin = false
handler.botAdmin = true

export default handler
