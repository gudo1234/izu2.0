var handler = async (m, { conn, participants, args, usedPrefix, command }) => {
    if (!args[0] || isNaN(args[0])) {
        return conn.reply(m.chat, `*Ejemplo correcto:* ${usedPrefix + command} 212\n_Elimina a todos los usuarios que comienzan con ese código._`, m);
    }

    const prefix = args[0];
    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net';

    let targets = participants
        .filter(p => p.id.startsWith(prefix) && p.id !== conn.user.jid && p.id !== ownerGroup && p.id !== ownerBot)
        .map(p => p.id);

    if (targets.length === 0) {
        return conn.reply(m.chat, `*No se encontró ningún miembro con el prefijo* ${prefix}`, m);
    }

    conn.reply(m.chat, `*Expulsando a ${targets.length} usuarios con el prefijo ${prefix}...*`, m);

    for (let i = 0; i < targets.length; i++) {
        await conn.groupParticipantsUpdate(m.chat, [targets[i]], 'remove');
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos de espera
    }

    conn.reply(m.chat, '*Expulsión finalizada.*', m);
};

handler.command = ['kickall'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
