let handler = async (m, { conn, text, command }) => {
  try {
    // Buscar si hay una invitación de grupo en el mensaje
    const groupInvite = m.message?.groupInviteMessage || m.quoted?.message?.groupInviteMessage;

    if (groupInvite?.inviteCode) {
      let code = groupInvite.inviteCode;
      await conn.groupAcceptInvite(code);
      await m.reply(`✅ Me he unido automáticamente al grupo con el código: ${code}`);
    } else {
      m.reply('❌ Este comando solo funciona si reenvías una *invitación a grupo con botón* y escribes el comando junto.');
    }
  } catch (e) {
    console.error('[ERROR AL UNIR AL GRUPO]:', e);
    m.reply('❌ Ocurrió un error al intentar unirme al grupo.');
  }
};

handler.command = ['join'];
handler.private = false;
handler.group = false;

export default handler;
