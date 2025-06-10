const handler = async (m, { conn, text, participants, groupMetadata, configSet, command }) => {
    // Obtener números de los participantes del grupo
    const members = participants.map(user => user.id);

    // Crear la whitelist desde el configSet
    //const whitelist = configSet.whitelist.map(i => i + '@s.whatsapp.net');

    // Filtrar los usuarios que NO están en la whitelist
    //const users = members.filter(id => !whitelist.includes(id));

    // Mensaje por defecto
    const message = text ? text : 'Hola 😃';

    // Texto con mención masiva
    const msg = `@${m.sender.split('@')[0]} ${message}`;

    // Enviar respuesta con menciones
    await conn.reply(m.chat, msg, m, {
        mentions: users,
        contextInfo: {
            mentionedJid: users,
            groupMentions: [{
                groupJid: m.chat,
                groupSubject: groupMetadata.subject
            }]
        }
    });
};

// Metadata del plugin
handler.command = ['everyone'];
handler.help = ['everyone'];
handler.tags = ['admin'];
handler.group = true;
handler.admin = true;
handler.fail = null;

export default handler;
