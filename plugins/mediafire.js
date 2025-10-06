/*import fetch from 'node-fetch';

const mimeFromExt = ext => ({
  '7z'   : 'application/x-7z-compressed',
  'zip'  : 'application/zip',
  'rar'  : 'application/vnd.rar',
  'apk'  : 'application/vnd.android.package-archive',
  'mp4'  : 'video/mp4',
  'mkv'  : 'video/x-matroska',
  'mp3'  : 'audio/mpeg',
  'wav'  : 'audio/wav',
  'ogg'  : 'audio/ogg',
  'flac' : 'audio/flac',
  'pdf'  : 'application/pdf',
  'doc'  : 'application/msword',
  'docx' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls'  : 'application/vnd.ms-excel',
  'xlsx' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt'  : 'application/vnd.ms-powerpoint',
  'pptx' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt'  : 'text/plain',
  'html' : 'text/html',
  'csv'  : 'text/csv',
  'json' : 'application/json',
  'js'   : 'application/javascript',
  'py'   : 'text/x-python',
  'c'    : 'text/x-c',
  'cpp'  : 'text/x-c++',
  'exe'  : 'application/vnd.microsoft.portable-executable'
}[ext]);

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `${usedPrefix + command} <link de MediaFire>`;

  // ⏳ reacción mientras descarga datos de la API
  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }});

  const res  = await fetch(`https://api.agatz.xyz/api/mediafire?url=${encodeURIComponent(text)}`);
  const json = await res.json();
  if (!json?.data?.length) throw 'No se pudo obtener el archivo.';

  const file = json.data[0];

  // ── extensión y mime ────────────────────────────────────────────────
  const extMatch = file.nama.match(/\.(\w+)$/i);
  const ext      = extMatch ? extMatch[1].toLowerCase() : 'zip'; // default a zip
  const mime     = mimeFromExt(ext) || 'application/zip';        // default MIME

  // ── mensaje descriptivo ─────────────────────────────────────────────
  const caption = `*Nombre:* ${file.nama}
*Peso:*   ${file.size}
*Tipo:*   ${ext.toUpperCase()}`;

  /*  📄 ENVÍO COMO DOCUMENTO
      ───────────────────────
      - document.url → enlace directo
      - fileName     → nombre con extensión
      - mimetype     → correcto para que se abra bien
  
  await conn.sendMessage(m.chat, {
    document: { url: file.link },
    fileName: file.nama,
    mimetype: mime,
    caption
  }, { quoted: m });

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }});
};

handler.command = ['mf', 'mediafire'];
handler.group   = true;

export default handler;*/

import axios from 'axios'

const mimeFromExt = ext => ({
  '7z'   : 'application/x-7z-compressed',
  'zip'  : 'application/zip',
  'rar'  : 'application/vnd.rar',
  'apk'  : 'application/vnd.android.package-archive',
  'mp4'  : 'video/mp4',
  'mkv'  : 'video/x-matroska',
  'mp3'  : 'audio/mpeg',
  'wav'  : 'audio/wav',
  'ogg'  : 'audio/ogg',
  'flac' : 'audio/flac',
  'pdf'  : 'application/pdf',
  'doc'  : 'application/msword',
  'docx' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls'  : 'application/vnd.ms-excel',
  'xlsx' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt'  : 'application/vnd.ms-powerpoint',
  'pptx' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt'  : 'text/plain',
  'html' : 'text/html',
  'csv'  : 'text/csv',
  'json' : 'application/json',
  'js'   : 'application/javascript',
  'py'   : 'text/x-python',
  'c'    : 'text/x-c',
  'cpp'  : 'text/x-c++',
  'exe'  : 'application/vnd.microsoft.portable-executable'
}[ext])

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `✳️ Usa el comando correctamente:\n${usedPrefix + command} <link de MediaFire>`

  // Validar URL de MediaFire
  const mediafireRegex = /https?:\/\/(www\.)?mediafire\.com\/file\/[a-zA-Z0-9]+/i
  if (!mediafireRegex.test(text)) throw '⚠️ Por favor ingresa un enlace válido de *MediaFire*.'

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

  try {
    const apiUrl = `https://api.stellarwa.xyz/dow/mediafire?url=${encodeURIComponent(text)}`
    const { data: json } = await axios.get(apiUrl, { timeout: 20000 })

    if (!json.status || !json.data) throw new Error('No se pudo obtener la información del archivo.')

    const file = json.data
    const extMatch = file.title.match(/\.(\w+)$/i)
    const ext = extMatch ? extMatch[1].toLowerCase() : 'zip'
    const mime = mimeFromExt(ext) || file.tipo || 'application/octet-stream'

    const caption = `📦 *Archivo encontrado*\n\n` +
                    `*📄 Nombre:* ${file.title}\n` +
                    `*📁 Peso:* ${file.peso}\n` +
                    `*📅 Fecha:* ${file.fecha}\n` +
                    `*📑 Tipo:* ${ext.toUpperCase()}`

    await conn.sendMessage(m.chat, {
      document: { url: file.dl },
      fileName: file.title,
      mimetype: mime,
      caption
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    console.error('❌ Error en el comando MediaFire:', err)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    throw `⚠️ No se pudo procesar el enlace.\n\nDetalles: ${err.message || err}`
  }
}

handler.command = ['mf', 'mediafire']
handler.group = true

export default handler
