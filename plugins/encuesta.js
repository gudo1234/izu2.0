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
  await sendPoll(conn, m.chat, pregunta, opciones);
};

// Función integrada para enviar encuestas
async function sendPoll(conn, jid, name = '', values = [], selectableCount = 1) {
  return conn.sendMessage(jid, {
    poll: {
      name,
      values,
      selectableCount
    }
  });
}

handler.command = ['poll', 'encuesta']
handler.group = true;

export default handler;
