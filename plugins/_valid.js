import levenshtein from 'fast-levenshtein';
import { parsePhoneNumber } from 'libphonenumber-js';

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

    // Buscar los comandos más cercanos válidos
    let closestCommands = [];
    for (let cmd of allCommands) {
      if (typeof cmd !== 'string') continue;
      let dist = levenshtein.get(command, cmd);
      const maxLength = Math.max(command.length, cmd.length);
      if (maxLength === 0) continue;
      const similarity = Math.round((1 - dist / maxLength) * 100);
      if (!isNaN(similarity) && similarity > 0) {
        closestCommands.push({ cmd, similarity });
      }
    }

    closestCommands.sort((a, b) => b.similarity - a.similarity);
    const topMatches = closestCommands.slice(0, 2);

    // Detectar país por número
    let region = 'Tu país';
    let flag = '';

    try {
      const phone = parsePhoneNumber(m.sender);
      if (phone && phone.country) {
        region = phone.country; // Código ISO como "MX", "CO", etc.
        flag = String.fromCodePoint(...[...phone.country].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
      }
    } catch (err) {
      region = 'Tu país';
    }

    let replyMessage = `────☁᪶̇✿ ᳟${flag || region}᳟✿᪶☁────\n` +
      `🪐 El comando *${usedPrefix + command}* no existe.\n` +
      `> 🧮 Usa *${usedPrefix}menu* para ver los comandos disponibles.\n\n`;

    if (topMatches.length > 0) {
      replyMessage += `*¿Quisiste decir?*\n`;
      topMatches.forEach((match) => {
        replyMessage += `> \`${usedPrefix + match.cmd}\` (${match.similarity}% de coincidencia)\n`;
      });
    }

    replyMessage += `────☁᪶̇✿ ᳟${flag || region}᳟✿᪶☁────`;

    await m.reply(replyMessage);
  }
}
