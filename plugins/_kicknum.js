var handler = async (m, { conn, participants, args, usedPrefix, command }) => {
    if (!args[0] || isNaN(args[0])) {
        return conn.reply(m.chat, `${e} *Ejemplo de uso:* ${usedPrefix + command} 212\n\n> Elimina a todos los usuarios que comienzan con ese código, excepto administradores.`, m);
    }

    const prefix = args[0];
    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net';

    // Obtener IDs de administradores
    const admins = participants.filter(p => p.admin).map(p => p.id);

    // Filtrar miembros a eliminar: que empiecen con el prefijo, no sean admin, ni bot, ni dueños
    let targets = participants
        .filter(p => 
            p.id.startsWith(prefix) &&
            !admins.includes(p.id) &&
            p.id !== conn.user.jid &&
            p.id !== ownerGroup &&
            p.id !== ownerBot
        )
        .map(p => p.id);

    if (targets.length === 0) {
        return conn.reply(m.chat, `*No se encontró ningún miembro con el prefijo* ${prefix} *que pueda ser expulsado.*`, m);
    }

    conn.reply(m.chat, `*Expulsando a ${targets.length} usuarios con el prefijo ${prefix}...*`, m);

    for (let i = 0; i < targets.length; i++) {
        await conn.groupParticipantsUpdate(m.chat, [targets[i]], 'remove');
        await new Promise(resolve => setTimeout(resolve, 4000)); // Esperar 4 segundos
    }

    conn.reply(m.chat, '*Expulsión finalizada.*', m);
};

handler.command = ['kicknum'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
