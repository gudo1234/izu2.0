import levenshtein from 'fast-levenshtein';

export async function before(m) {
  if (!m.text || !global.prefix.test(m.text)) return;

  const usedPrefix = global.prefix.exec(m.text)[0];
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();

  const validCommand = (cmd, plugins) => {
    for (let plugin of Object.values(plugins)) {
      const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
      if (cmds.includes(cmd)) return true;
    }
    return false;
  };

  if (!command || command === "bot") return;

  const chat = global.db.data.chats[m.chat];
  const user = global.db.data.users[m.sender];

  if (validCommand(command, global.plugins)) {
    if (chat.isBanned) {
      const avisoDesactivado = `────⋆｡°✩ 𝙄𝙣𝙛𝙤 ✩°｡⋆────\n` +
        `${e} El bot *${botname}* está desactivado en este grupo.\n\n` +
        `> ✦ Un *administrador* puede activarlo con el comando:\n` +
        `> » *${usedPrefix}bot on*\n` +
        `────⋆｡°✩ 𝙄𝙣𝙛𝙤 ✩°｡⋆────`;
      await m.reply(avisoDesactivado);
      return;
    }

    user.commands = (user.commands || 0) + 1;
  } else {
    // Obtener lista de comandos válidos
    let allCommands = [];
    for (let plugin of Object.values(global.plugins)) {
      if (!plugin.command) continue;
      const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
      allCommands.push(...cmds);
    }

    // Buscar los dos comandos más cercanos
    let closestCommands = [];
    for (let cmd of allCommands) {
      let dist = levenshtein.get(command, cmd);
      const maxLength = Math.max(command.length, cmd.length);
      const similarity = Math.round((1 - dist / maxLength) * 100);
      closestCommands.push({ cmd, similarity });
    }

    closestCommands.sort((a, b) => b.similarity - a.similarity);
    const topMatches = closestCommands.slice(0, 2);

    const country = user.country || 'Tu país'; // Si no hay país definido, se muestra genérico

    let replyMessage = `────☁᪶̇✿ ᳟${country}᳟✿᪶☁────\n` +
      `${e} El comando *${usedPrefix + command}* no existe.\n` +
      `> 🧮 Usa *${usedPrefix}menu* para ver los comandos disponibles.\n\n` +
      `*¿Quisiste decir?*\n`;

    topMatches.forEach((match, index) => {
      replyMessage += `> ${index + 1}. \`${usedPrefix + match.cmd}\` (${match.similarity}% de coincidencia)\n`;
    });

    replyMessage += `────☁᪶̇✿ ᳟${country}᳟✿᪶☁────`;

    await m.reply(replyMessage);
  }
        }
