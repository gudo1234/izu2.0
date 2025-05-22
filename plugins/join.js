let handler = async (m, { conn }) => {
  try {
    const stubType = m.messageStubType;
    const stubParams = m.messageStubParameters;

    // Detecta invitaciones por botón (messageStubType === 29)
    if (stubType === 29 && stubParams?.[0]) {
      let code = stubParams[0].split('/').pop();

      if (!code || code.length < 20) return;

      await conn.groupAcceptInvite(code);
      await m.reply(`✅ Me he unido automáticamente al grupo con el código: ${code}`);
    }
  } catch (e) {
    console.error('[ERROR AL UNIR AL GRUPO]:', e);
    await m.reply('❌ Ocurrió un error al intentar unirme al grupo.');
  }
};

handler.customPrefix = () => false;
handler.command = () => false;
handler.private = false;
handler.group = false;

export default handler;
