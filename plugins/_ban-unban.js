/*let handler = async (m, { conn, isAdmin, isROwner, command }) => {
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

handler.command = ['banearbot', 'banchat']
handler.group = true
export default handler*/
let handler = async (m, { conn, usedPrefix, command, args }) => {
  if (!(m.chat in global.db.data.chats)) {
    return conn.reply(m.chat, `《✦》¡Este chat no está registrado!.`, m);
  }

  let chat = global.db.data.chats[m.chat];

  if (command === 'bo') {
    if (args.length === 0) {
      const estado = chat.isBanned ? '✗ Desactivado' : '✓ Activado';
      const info = `
「✦」Un administrador puede activar o desactivar a *${botname}* utilizando:

> ✐ *${usedPrefix}bot on* para activar
> ✐ *${usedPrefix}bot off* para desactivar

✧ Estado actual » *${estado}*
`;
      return conn.reply(m.chat, info, m);
    }

    if (args[0] === 'off') {
      if (chat.isBanned) {
        return conn.reply(m.chat, `《✧》${botname} ya estaba desactivado.`, m);
      }
      chat.isBanned = true;
      return conn.reply(m.chat, `✐ Has *desactivado* a ${botname}!`, m);
    } else if (args[0] === 'on') {
      if (!chat.isBanned) {
        return conn.reply(m.chat, `《✧》*${botname}* ya estaba activado.`, m);
      }
      chat.isBanned = false;
      return conn.reply(m.chat, `✐ Has *activado* a ${botname}!`, m);
    }
  }
};

handler.help = ['bot'];
handler.tags = ['grupo'];
handler.command = ['bo'];
handler.admin = true;

export default handler;
