let handler = async (m, { conn, args, command }) => {
  if (!m.quoted || m.quoted?.mtype !== 'pollCreationMessage') {
    return m.reply('✳️ Responde a una encuesta con el comando.\nEjemplo: *.votar 100|Edar*');
  }

  // Verificamos formato
  let input = args.join(" ").split("|");
  let cantidad = parseInt(input[0]);
  let opcionBuscada = input[1]?.toLowerCase();

  if (isNaN(cantidad) || cantidad <= 0 || !opcionBuscada) {
    return m.reply('✳️ Formato incorrecto. Usa: *.votar <cantidad>|<nombre de la opción>*');
  }

  // Extraer opciones de la encuesta
  let opciones = m.quoted.msg.options || [];
  let opcion = opciones.find(o => o.option.toLowerCase().includes(opcionBuscada));

  if (!opcion) {
    return m.reply(`❌ No se encontró una opción que coincida con: *${opcionBuscada}*`);
  }

  let resultadosFalsos = opciones.map(o => {
    return {
      name: o.option,
      count: o.option === opcion.option ? cantidad : (o.voters?.length || 0),
      voters: o.option === opcion.option
        ? Array.from({ length: cantidad }, (_, i) => `Usuario Fake ${i + 1}`)
        : o.voters || []
    };
  });

  let resultadoTexto = `🗳 *Resultados Falsos de la Encuesta*\n\n`;
  for (let r of resultadosFalsos) {
    resultadoTexto += `▪️ *${r.name}*: ${r.count} votos\n`;
  }

  return m.reply(resultadoTexto.trim());
};

handler.command = ['votar'];
handler.group = true;
handler.admin = true; // Opcional, para que solo admins puedan usarlo

export default handler;
