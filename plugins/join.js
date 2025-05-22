let handler = async (m, { conn, isOwner }) => {
  // Verifica si el mensaje es una invitación enriquecida
  if (!m.message?.groupInviteMessage) return;

  // Solo si el mensaje lo manda el owner (puedes quitar esta condición si quieres que se una a cualquier invitación)
  if (!isOwner) return;

  let code = m.message.groupInviteMessage.inviteCode;
  if (!code) return;

  // Intentar unirse al grupo
  try {
    await conn.groupAcceptInvite(code);
    await m.reply('✅ Me he unido automáticamente al grupo.');
  } catch (e) {
    await m.reply('❌ No pude unirme al grupo.');
  }
};

handler.customPrefix = /^/; // Para interceptar todos los mensajes
handler.before = true;
handler.group = false; // Solo en privado
handler.private = true; // O puedes cambiar esto si deseas en grupo también
export default handler;
