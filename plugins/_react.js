// reactbybaileys.js
// Plugin: reactbybaileys
// Uso principal:
// 1) Responde a un mensaje -> .reactbybaileys ❤️
// 2) .reactbybaileys <chatId> <messageId> ❤️ (por ejemplo: 123456789-123@g.us AB12C3D4E5F6G7H8 ❤️)
// 3) .reactbybaileys <link> ❤️ (intentará parsear links tipo /channel/.../message/<id>)
// Notas: envia reacciones usando TU sesión (Baileys). No usa tokens externos.

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args || args.length === 0) {
      // caso: respondió a un mensaje
      if (m.quoted) {
        const emojis = ['❤️'] // por defecto si no pasa emoji
        return await reactToQuoted(m, conn, emojis);
      }
      return m.reply(`Uso:\n1) Responde a un mensaje y escribe: ${usedPrefix + command} ❤️\n2) ${usedPrefix + command} <chatId> <messageId> <emoji1,emoji2,...>\n3) ${usedPrefix + command} <link> <emoji1,emoji2,...>`);
    }

    // detectar si el mensaje es reply (reacción a mensaje citado)
    if (m.quoted && args.length >= 1) {
      // si el usuario puso emojis además del reply
      const emojis = args.join(' ').trim();
      const emojisArr = emojis.includes(',') ? emojis.split(',').map(e => e.trim()).filter(Boolean) : emojis.split(/\s+/).map(e => e.trim()).filter(Boolean);
      return await reactToQuoted(m, conn, emojisArr);
    }

    // Si args[0] parece un link con /message/<id>, intentar parsear chatId y messageId
    const maybeLink = args[0];
    const rest = args.slice(1).join(' ');
    let emojisArr;
    if (!rest) {
      emojisArr = ['❤️'];
    } else {
      emojisArr = rest.includes(',') ? rest.split(',').map(e => e.trim()).filter(Boolean) : rest.split(/\s+/).map(e => e.trim()).filter(Boolean);
    }

    // Try parse link pattern: .../channel/<channelId>/message/<msgId>
    const msgLinkMatch = maybeLink.match(/\/channel\/([^\/]+)\/message\/([A-Za-z0-9_-]+)/i);
    if (msgLinkMatch) {
      const channelId = msgLinkMatch[1];
      const msgId = msgLinkMatch[2];
      // Construir un jid plausible para canales: muchas implementaciones usan "<channelId>@broadcast" o "<channelId>@g.us"
      // No hay un estándar público para todos los links; usamos primero `${channelId}@broadcast` y también permitimos override por el usuario.
      const possibleJids = [
        `${channelId}@broadcast`,
        `${channelId}@g.us`,
        `${channelId}@s.whatsapp.net`
      ];
      // Intentamos enviar la reacción probando las opciones (silencioso en errores)
      let lastErr = null;
      for (const jid of possibleJids) {
        try {
          await sendReactionsForMessageKey(conn, { id: msgId, remoteJid: jid, fromMe: false }, emojisArr);
          await m.reply(`✅ Reaccioné al mensaje ${msgId} en ${jid} con: ${emojisArr.join(' ')}`);
          return;
        } catch (e) {
          lastErr = e;
          // seguir probando otra jid
        }
      }
      return m.reply(`❌ No pude reaccionar con el link. Intenté jids posibles. Error final: ${lastErr?.message || String(lastErr)}`);
    }

    // Si el primer arg tiene formato chatId (contiene @) y hay messageId
    if (args[0].includes('@') && args[1]) {
      const chatId = args[0];
      const messageId = args[1];
      const emojis = emojisArr.length ? emojisArr : ['❤️'];
      await sendReactionsForMessageKey(conn, { id: messageId, remoteJid: chatId, fromMe: false }, emojis);
      return m.reply(`✅ Reaccioné al mensaje ${messageId} en ${chatId} con: ${emojis.join(' ')}`);
    }

    // Fallback: si sólo dieron una sola cosa que no es link ni chatId
    return m.reply(`No entendí los parámetros.\nEjemplos válidos:\n• Responde a un mensaje y escribe: ${usedPrefix + command} ❤️\n• ${usedPrefix + command} 123456789-123@g.us ABCDEF1234567890 ❤️`);
  } catch (err) {
    console.error(err);
    return m.reply(`❌ Error al ejecutar el comando:\n${err.message || String(err)}`);
  }
}

// helper: reacciona al mensaje citado
async function reactToQuoted(m, conn, emojis) {
  const quoted = m.quoted;
  if (!quoted) return m.reply('No hay mensaje citado para reaccionar.');
  const key = quoted.key; // esto contiene id + remoteJid + fromMe
  // Normalizar emojis
  const emojisArr = Array.isArray(emojis) ? emojis : (emojis.includes(',') ? emojis.split(',').map(e=>e.trim()).filter(Boolean) : emojis.split(/\s+/).map(e=>e.trim()).filter(Boolean));
  await sendReactionsForMessageKey(conn, key, emojisArr);
  await m.reply(`✅ Reaccioné al mensaje citado con: ${emojisArr.join(' ')}`);
}

// helper: envía 1..n reacciones al messageKey (secuencial, con pequeño delay)
async function sendReactionsForMessageKey(conn, messageKey, emojisArr) {
  // emojisArr: ['🔥','❤️',...]
  for (const emoji of emojisArr) {
    // el objeto que espera Baileys es: { react: { text: '❤️', key: messageKey } }
    // messageKey puede ser toda la key (message.key) o un objeto { id, remoteJid, fromMe }
    await conn.sendMessage(messageKey.remoteJid || messageKey.chat || messageKey.sender || messageKey.from || '', {
      react: {
        text: emoji,
        key: {
          id: messageKey.id || messageKey.key?.id || (messageKey.key && messageKey.key.id),
          remoteJid: messageKey.remoteJid || messageKey.key?.remoteJid || (messageKey.key && messageKey.key.remoteJid),
          fromMe: false
        }
      }
    });
    // pequeño sleep entre reacciones para reducir riesgo de rate-limit
    await sleep(700);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

handler.command = ['reactbybaileys', 'rby', 'reactlocal'];
export default handler;
