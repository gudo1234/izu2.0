let handler = async (m, { conn, text, participants}) => {
	
    let users = participants.map(u => u.id).filter(v => v !== conn.user.jid)
    if (!m.quoted) return m.reply(`${e} Responde a un mensaje.`)
    conn.sendMessage(m.chat, { forward: m.quoted.fakeObj, mentions: users } )
}

handler.command = ['totag', 'tag']
handler.admin = true
handler.group = true

export default handler
