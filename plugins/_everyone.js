const handler = async (m, { conn, text, participants, groupMetadata }) => {
    try {
        // Obtener todos los IDs de participantes (JIDs)
        const users = participants.map(user => user.id);

        // Mensaje por defecto
        const message = text ? text : 'Hola 😃';

        // Construir mensaje con mención al remitente (opcional)
        const msg = `@${m.sender.split('@')[0]} ${message}`;

        // Enviar respuesta con menciones a todos
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
    } catch (error) {
        console.error('Error en comando everyone:', error);
        await conn.reply(m.chat, `${e} Ocurrió un error al ejecutar el comando. ${error}`, m);
    }
};

handler.command = ['everyone'];
handler.help = ['everyone'];
handler.tags = ['admin'];
handler.group = true;
handler.admin = true;
handler.fail = null;

export default handler;
