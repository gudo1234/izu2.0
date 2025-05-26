const handler = async (m, { text, command, conn }) => {
  if (!text.includes('|')) {
    return m.reply(`Formato incorrecto.\nUsa:\n.${command} Pregunta | Opción 1 | Opción 2 ...`);
  }

  const partes = text.split('|').map(p => p.trim()).filter(p => p);
  const pregunta = partes.shift();
  const opciones = partes;

  if (opciones.length < 2) {
    return m.reply('Debes incluir al menos dos opciones para la encuesta.');
  }

  // Enviar encuesta
  await conn.sendMessage(m.chat, {
    poll: {
      name: pregunta,
      values: opciones
    }
  }, { quoted: m });
};

handler.command = ['poll', 'encuesta']
handler.group = true;

export default handler;
