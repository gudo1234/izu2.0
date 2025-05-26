let handler = async (m, { conn, args }) => {
  if (!m.quoted) {
    return m.reply('✳️ Responde a una *encuesta* con el comando.\nEjemplo: *.votar 100|Edar*');
  }

  // Extraer contenido de la encuesta
  let quoted = m.quoted.message || m.quoted.msg || {};
  let poll = quoted.pollCreationMessage;
  if (!poll) {
    return m.reply('✳️ El mensaje al que respondes no es una encuesta válida.');
  }

  // Separar y validar argumentos
  let input = args.join(" ").split("|");
  let cantidad = parseInt(input[0]);
  let textoOpcion = input[1]?.toLowerCase()?.trim();

  if (isNaN(cantidad) || cantidad <= 0 || !textoOpcion) {
    return m.reply('✳️ Formato incorrecto.\nUsa: *.votar <cantidad>|<parte del nombre de la opción>*');
  }

  // Buscar opción que coincida
  let opciones = poll.options || [];
  let opcion = opciones.find(o => o.option.toLowerCase().includes(textoOpcion));

  if (!opcion) {
    return m.reply(`❌ No se encontró una opción que coincida con: *${textoOpcion}*`);
  }

  // Generar votos simulados
  let resultados = opciones.map(o => ({
    name: o.option,
    count: o.option === opcion.option ? cantidad : 0
  }));

  // Armar respuesta
  let texto = `🗳 *Resultados Simulados:*\n\n`;
  for (let r of resultados) {
    texto += `▪️ *${r.name}*: ${r.count} votos\n`;
  }

  return m.reply(texto.trim());
};

handler.command = ['votar'];
handler.group = true;
handler.admin = true;

export default handler;
