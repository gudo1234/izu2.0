import levenshtein from 'fast-levenshtein';
import { getDevice } from "@whiskeysockets/baileys";
import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment-timezone';
import axios from 'axios';
import fetch from 'node-fetch';
import path from 'path';

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
  let delirius = await axios.get(`https://delirius-apiofc.vercel.app/tools/country?text=${PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')}`);
  let paisdata = delirius.data.result;
  let mundo = paisdata ? `${paisdata.name} ${paisdata.emoji}\n│ 🗓️ *Fecha:* ${paisdata.date}\n│ 🕒 *Hora local:* ${paisdata.time12}` : 'Desconocido';

  if (validCommand(command, global.plugins)) {
    if (chat.isBanned) {
      const avisoDesactivado = `────⋆｡°✩ ${paisdata.emoji} ✩°｡⋆────\n` +
        `El bot *${botname}* está desactivado en este grupo.\n\n` +
        `> ✦ Un *administrador* puede activarlo con el comando:\n` +
        `> » *${usedPrefix}bot on*\n` +
        `────⋆｡°✩  ✩°｡⋆────`;
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

    // Mensaje de comando inválido con país y emoji
    let replyMessage = `───⋆───⋆───\n` +
      `_${e} El comando *${usedPrefix + command}* no existe._\n` +
      `> ${paisdata.emoji} Usa *${usedPrefix}menu* para ver los comandos disponibles.\n\n`;

    if (topMatches.length > 0) {
      replyMessage += `*¿Tal vez quisiste decir?*\n`;
      topMatches.forEach((match) => {
        replyMessage += `\`${usedPrefix + match.cmd}\` (${match.similarity}% de coincidencia)\n`;
      });
    }

    replyMessage += `────☁᪶̇✿ ᳟${paisdata.code || '🌎'}᳟✿᪶☁────`;

    await m.reply(replyMessage);
  }
}
