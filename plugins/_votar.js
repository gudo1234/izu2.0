let handler = async (m, { conn, args }) => {
  // Verifica que estés respondiendo a un mensaje
  if (!m.quoted) {
    return m.reply('✳️ Responde a una *encuesta* con el comando.\nEjemplo: *.votar 100|Edar*');
  }

  // Detectar encuesta correctamente
  let poll = m.quoted?.msg?.pollCreationMessage;
  if (!poll) {
    return m.reply('✳️ El mensaje al que respondes no es una encuesta válida.');
  }

  // Separar entrada
  let input = args.join(" ").split("|");
  let cantidad = parseInt(input[0]);
  let textoOpcion = input[1]?.toLowerCase()?.trim();

  if (isNaN(cantidad) || cantidad <= 0 || !textoOpcion) {
    return m.reply('✳️ Formato incorrecto.\nUsa: *.votar <cantidad>|<parte del nombre de la opción>*');
  }

  // Buscar opción coincidente
  let opciones = poll.options || [];
  let opcion = opciones.find(o => o.option.toLowerCase().includes(textoOpcion));

  if (!opcion) {
    return m.reply(`❌ No se encontró una opción que coincida con: *${textoOpcion}*`);
  }

  // Generar votos falsos simulados
  let resultados = opciones.map(o => {
    return {
      name: o.option,
      count: o.option === opcion.option ? cantidad : 0
    };
  });

  // Armar mensaje de resultado
  let texto = `🗳 *Resultados Simulados:*\n\n`;
  for (let r of resultados) {
    texto += `▪️ *${r.name}*: ${r.count} votos\n`;
  }

  return m.reply(texto.trim());
};

handler.command = ['votar'];
handler.group = true;
handler.admin = true; // Opcional: solo admins

export default handler;
