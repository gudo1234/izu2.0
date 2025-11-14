import axios from 'axios';
import PhoneNum from 'awesome-phonenumber';
import { getDevice } from "@whiskeysockets/baileys";
import moment from "moment-timezone";
import path from "path";

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

// Función para generar bandera desde código de país
function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  try {
    return [...countryCode.toUpperCase()]
      .map(c => String.fromCodePoint(127397 + c.charCodeAt()))
      .join('');
  } catch {
    return '🌐';
  }
}

async function handler(m, { conn, text }) {
  let number, jid;

  // Obtenemos la mención directamente del mensaje original
  const mention = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  // 1. Si se menciona a alguien con @
  if (mention) {
    jid = mention;
    number = jid.split('@')[0];
  }
  // 2. Si se responde a un mensaje
  else if (m.quoted?.sender) {
    jid = m.quoted.sender;
    number = jid.split('@')[0];
  }
  // 3. Si se escribe un número manualmente
  else if (/^\+?\d{5,16}$/.test(text?.trim() || '')) {
    number = text.replace(/\D/g, '');
    jid = number + '@s.whatsapp.net';
  }
  // 4. Por defecto, tú mismo
  else {
    jid = m.sender;
    number = jid.split('@')[0];
  }

  // ⚡ Bypass del @lid (igual que primer código)
  if (jid?.endsWith('@lid')) {
    const metadata = await conn.groupMetadata?.(m.chat).catch(() => null);
    const match = metadata?.participants?.find(p => p.id === jid && p.jid);
    if (match) jid = match.jid;
    number = jid.split('@')[0];
  }

  // Info de teléfono y región
  const phoneInfo = PhoneNum('+' + number);
  const countryCode = phoneInfo.getRegionCode() || '';
  const emojiBandera = banderaEmoji(countryCode);
  const countryName = regionNames.of(countryCode) || 'Desconocido';

  const name = await conn.getName(jid);
  const { data: thumbnail } = await axios.get(icono, { responseType: 'arraybuffer' });

  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;type=CELL;type=VOICE;waid=${number}:${number}
END:VCARD`;

  await conn.sendMessage(m.chat, {
    contacts: {
      contacts: [{
        displayName: name,
        vcard
      }]
    },
    contextInfo: {
      externalAdReply: {
        renderLargerThumbnail: true,
        mediaType: 1,
        title: `Contacto de ${countryName} ${emojiBandera}`,
        body: wm,
        thumbnailUrl: redes,
        thumbnail,
        sourceUrl: redes
      }
    }
  }, { quoted: m });
}

handler.command = ['vcard'];
handler.group = true;
export default handler;
