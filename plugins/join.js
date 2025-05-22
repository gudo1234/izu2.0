let handler = async (m, { conn, text, command }) => {
  try {
    // Solo proceder si el mensaje incluye un botón de invitación (stubType 29)
    const stubType = m.messageStubType;
    const stubParams = m.messageStubParameters;

    if (stubType === 29 && stubParams?.[0]) {
      let code = stubParams[0].split('/').pop();

      if (!code || code.length < 20) {
        return m.reply('❌ Código de invitación no válido.');
      }

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

// El bot responde a comandos como: .join, !join, etc.
handler.command = ['join'];
handler.private = false;
handler.group = false;

export default handler;
