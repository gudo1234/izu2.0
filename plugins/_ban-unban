let handler = async (m, { conn, isAdmin, isROwner, command }) => {
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)

    if (command === 'banearbot' || command === 'banchat') {
        global.db.data.chats[m.chat].isBanned = true
        await conn.reply(m.chat, `${e} Chat baneado con éxito.`, m, rcanal)
    } else if (command === 'desbanearbot' || command === 'unbanchat') {
        global.db.data.chats[m.chat].isBanned = false
        await conn.reply(m.chat, `${e} Bot activo en este grupo.`, m, rcanal)
    }

    await m.react('✅')
}

handler.command = ['banearbot', 'banchat', 'desbanearbot', 'unbanchat']
handler.group = true
export default handler
