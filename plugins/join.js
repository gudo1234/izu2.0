let handler = async (m, { conn, isOwner }) => {
    let code;

    // Si el mensaje contiene texto con enlace
    if (m.text) {
        let match = m.text.match(/https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i);
        if (match) code = match[1];
    }

    // Si es un mensaje de invitación enriquecida
    if (!code && m.message?.groupInviteMessage?.inviteCode) {
        code = m.message.groupInviteMessage.inviteCode;
    }

    if (!code) return m.reply(`${emoji2} Enlace de invitación no válido o ausente.`);

    // Opcional: restringir solo a owner
    // if (!isOwner) return m.reply("Solo mi dueño puede usar este comando.");

    await conn.groupAcceptInvite(code)
        .then(() => m.reply(`${emoji} Me he unido exitosamente al grupo.`))
        .catch(() => m.reply(`${msm} Error al unirme al grupo.`));
};

handler.command = ['invite', 'join', 'entra', 'entrabot'];

export default handler;
