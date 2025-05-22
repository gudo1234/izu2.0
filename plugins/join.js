let handler = async (m, { conn }) => {
  if (!m.message?.groupInviteMessage) return; // Ignorar si no es invitación directa

  let invite = m.message.groupInviteMessage;
  let code = invite.inviteCode;

  if (!code) return;

  try {
    await conn.groupAcceptInvite(code);
    await m.reply(`✅ Me he unido exitosamente al grupo: *${invite.groupName || 'Desconocido'}*.`);
  } catch (e) {
    console.error(e);
    await m.reply(`❌ No pude unirme al grupo: ${e.message}`);
  }
};

handler.customPrefix = () => false;
handler.command = () => false;
handler.group = false; // Solo aplica en chats privados
handler.private = true; // Opcional: si quieres que solo lo detecte en privado

export default handler;
