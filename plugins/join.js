let linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;

let handler = async (m, { conn, text, isOwner }) => {
  let code;

  // Detectar si el mensaje es una invitación del sistema (tipo groupInviteMessage)
  if (m.message?.groupInviteMessage) {
    code = m.message.groupInviteMessage.inviteCode;
    text = `https://chat.whatsapp.com/${code}`;
  } else {
    // Extraer código del enlace enviado por texto
    let match = text.match(linkRegex);
    code = match?.[1];
  }

  if (!code) {
    return m.reply(`${emoji2} Enlace o invitación no válida.`);
  }

  if (isOwner) {
    try {
      await conn.groupAcceptInvite(code);
      m.reply(`${emoji} Me he unido exitosamente al grupo.`);
    } catch (err) {
      console.error(err);
      m.reply(`${msm} Error al unirme al grupo.`);
    }
  } else {
    let message = `${emoji} Invitación a un grupo:\n${text}\n\nPor: @${m.sender.split('@')[0]}`;
    await conn.sendMessage(`${suittag}@s.whatsapp.net`, {
      text: message,
      mentions: [m.sender]
    }, { quoted: m });
    m.reply(`${emoji} El link del grupo ha sido enviado a mi propietario, luego recibirá una respuesta.`);
  }
};

handler.command = ['invite', 'join', 'entra', 'entrabot'];

export default handler;
