/*import levenshtein from 'fast-levenshtein';
import { getDevice } from "@whiskeysockets/baileys";
import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment-timezone';
import path from 'path';

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = [...countryCode.toUpperCase()]
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

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

  const number = m.sender.replace('@s.whatsapp.net', '');
  const phoneInfo = PhoneNumber('+' + number);
  const countryCode = phoneInfo.getRegionCode('international');
  const mundo = banderaEmoji(countryCode) || '🌐';

  if (validCommand(command, global.plugins)) {
    if (chat.isBanned) {
      const avisoDesactivado = `${e} El bot está desactivado en este grupo.\n\n` +
        `> ${mundo} Un *administrador* puede activarlo con el comando:\n` +
        `\`${usedPrefix}unbanchat\``;
      await m.reply(avisoDesactivado);
      return;
    }

    user.commands = (user.commands || 0) + 1;
  } else {
    let allCommands = [];
    for (let plugin of Object.values(global.plugins)) {
      if (!plugin.command) continue;
      const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
      allCommands.push(...cmds);
    }
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

    let replyMessage = `${e} _Comando ingresado no encontrado en mi base de datos._\n` +
      `> ${mundo} Usa *${usedPrefix}menu* para ver la lista completa de comandos disponibles.\n\n`;

    if (topMatches.length > 0) {
      replyMessage += `*Comandos similares encontrados:*\n`;
      topMatches.forEach((match) => {
        replyMessage += `\`${usedPrefix + match.cmd}\` (${match.similarity}% de coincidencia)\n`;
      });
    }
    await m.reply(replyMessage);
  }
}*/

import { getDevice } from "@whiskeysockets/baileys";
import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment-timezone';
import path from 'path';

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

// === Función de bandera ===
function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = [...countryCode.toUpperCase()]
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

// === Función para calcular distancia de Levenshtein sin librerías externas ===
function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // eliminación
        matrix[i][j - 1] + 1,      // inserción
        matrix[i - 1][j - 1] + cost // sustitución
      );
    }
  }
  return matrix[a.length][b.length];
}

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

  const number = m.sender.replace('@s.whatsapp.net', '');
  const phoneInfo = PhoneNumber('+' + number);
  const countryCode = phoneInfo.getRegionCode('international');
  const mundo = banderaEmoji(countryCode) || '🌐';

  if (validCommand(command, global.plugins)) {
    if (chat.isBanned) {
      const avisoDesactivado = `${e} El bot está desactivado en este grupo.\n\n` +
        `> ${mundo} Un *administrador* puede activarlo con el comando:\n` +
        `\`${usedPrefix}unbanchat\``;
      await m.reply(avisoDesactivado);
      return;
    }

    user.commands = (user.commands || 0) + 1;
  } else {
    let allCommands = [];
    for (let plugin of Object.values(global.plugins)) {
      if (!plugin.command) continue;
      const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
      allCommands.push(...cmds);
    }

    let closestCommands = [];
    for (let cmd of allCommands) {
      if (typeof cmd !== 'string') continue;
      let dist = levenshteinDistance(command, cmd);
      const maxLength = Math.max(command.length, cmd.length);
      if (maxLength === 0) continue;
      const similarity = Math.round((1 - dist / maxLength) * 100);
      if (!isNaN(similarity) && similarity > 0) {
        closestCommands.push({ cmd, similarity });
      }
    }

    closestCommands.sort((a, b) => b.similarity - a.similarity);
    const topMatches = closestCommands.slice(0, 2);

    let replyMessage = `${e} _Comando ingresado no encontrado en mi base de datos._\n` +
      `> ${mundo} Usa *${usedPrefix}menu* para ver la lista completa de comandos disponibles.\n\n`;

    if (topMatches.length > 0) {
      replyMessage += `*Comandos similares encontrados:*\n`;
      topMatches.forEach((match) => {
        replyMessage += `\`${usedPrefix + match.cmd}\` (${match.similarity}% de coincidencia)\n`;
      });
    }
    await m.reply(replyMessage);
  }
    }
