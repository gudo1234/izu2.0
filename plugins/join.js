let handler = async (m, { conn }) => {
  const msg = m.message;

  // 1. Verifica si es un mensaje directo con invitación
  const invite = msg?.groupInviteMessage;

  // 2. Verifica si la invitación está en el contexto (en botones reenviados u otras estructuras)
  const contextInvite = msg?.buttonsMessage?.contextInfo?.groupInviteMessage;

  const code = invite?.inviteCode || contextInvite?.inviteCode;
  const groupName = invite?.groupName || contextInvite?.groupName || 'Grupo';

  if (!code) return;

  try {
    await conn.groupAcceptInvite(code);
    await m.reply(`✅ Me he unido exitosamente al grupo: *${groupName}*`);
  } catch (e) {
    await m.reply(`❌ No pude unirme al grupo: ${e.message}`);
  }
};

handler.customPrefix = () => false;
handler.command = () => false;
handler.private = true;
handler.group = false;

export default handler;
