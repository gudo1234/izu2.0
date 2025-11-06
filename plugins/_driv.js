import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  const e = '🚫';

  if (!text) return m.reply(`${e} Ingresa un enlace de Google Drive.`);

  const carpetaMatch = text.match(/(?:folders\/|drive\/(?:mobile\/)?folders\/)([a-zA-Z0-9_-]+)/i);
  const carpetaID = carpetaMatch?.[1];

  // 📂 SI ES CARPETA
  if (carpetaID) {
    m.react('🗂️');

    try {
      const html = await fetch(`https://drive.google.com/drive/folders/${carpetaID}`).then(res => res.text());
      // Detectar archivos dentro de la carpeta
      const fileMatches = [...html.matchAll(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/g)];
      // Detectar subcarpetas
      const folderMatches = [...html.matchAll(/https:\/\/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/g)];

      const idsArchivos = [...new Set(fileMatches.map(v => v[1]))];
      const idsCarpetas = [...new Set(folderMatches.map(v => v[1]))];

      if (!idsArchivos.length && !idsCarpetas.length)
        return m.reply(`${e} No se encontraron archivos ni subcarpetas.`);

      // Enviar archivos encontrados directamente
      if (idsArchivos.length) {
        m.reply(`📄 Se encontraron *${idsArchivos.length}* archivos. Enviando...`);

        for (const id of idsArchivos) {
          const url = `https://drive.google.com/file/d/${id}`;
          try {
            const info = await fdrivedl(url);
            const nombre = info.fileName || `archivo_${id}`;
            const tipo = info.mimetype || detectarMime(nombre);

            await conn.sendMessage(m.chat, {
              document: { url: info.downloadUrl },
              fileName: nombre,
              mimetype: tipo
            }, { quoted: m });

            await new Promise(r => setTimeout(r, 2000));
            m.react('✅');

          } catch (err) {
            console.error(`❌ Error en archivo ${id}:`, err);
            await m.reply(`${e} No se pudo enviar el archivo con ID: ${id}`);
          }
        }
      }

      // Si hay subcarpetas, procesarlas también
      if (idsCarpetas.length) {
        for (const subId of idsCarpetas) {
          await m.reply(`📁 Explorando subcarpeta: https://drive.google.com/drive/folders/${subId}`);
          await handler(m, { conn, text: `https://drive.google.com/drive/folders/${subId}` });
        }
      }

    } catch (err) {
      console.error(err);
      return m.reply(`${e} Error al procesar la carpeta. Puede que sea privada o el formato haya cambiado.`);
    }

    return;
  }

  // 🧾 SI ES ARCHIVO INDIVIDUAL
  if (!/drive\.google\.com\/(file\/d\/|open\?id=|uc\?id=)/i.test(text))
    return m.reply(`${e} Enlace inválido. Asegúrate de que sea un enlace de Google Drive.`);

  m.react('🕒');

  try {
    const res = await fdrivedl(text);
    const peso = formatBytes(res.sizeBytes);
    const nombre = res.fileName || 'archivo';
    const tipo = res.mimetype || detectarMime(nombre);

    if (peso.includes('GB') && parseFloat(peso) > 1.8)
      return m.reply('📦 El archivo es demasiado grande para enviarlo por WhatsApp.');

    const texto = `📁 *Archivo:* ${nombre}\n📏 *Tamaño:* ${peso}\n> Enviando archivo tipo *${tipo}*...`;
    await m.reply(texto);

    await conn.sendMessage(m.chat, {
      document: { url: res.downloadUrl },
      fileName: nombre,
      mimetype: tipo
    }, { quoted: m });

    m.react('✅');

  } catch (err) {
    console.error(err);
    m.reply(`${e} Error al intentar descargar el archivo.`);
  }
};

// 🔧 DESCARGA ARCHIVO GOOGLE DRIVE
async function fdrivedl(url) {
  const idMatch = url.match(/(?:\/d\/|id=|uc\?id=)([a-zA-Z0-9_-]{10,})/i);
  const id = idMatch?.[1];
  if (!id) throw new Error('No se pudo extraer el ID del enlace.');

  const res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'x-json-requested': 'true',
      'x-drive-first-party': 'DriveWebUi',
      origin: 'https://drive.google.com',
      'user-agent': 'Mozilla/5.0'
    }
  });

  let json;
  try {
    json = JSON.parse((await res.text()).slice(4));
  } catch {
    throw new Error('No se pudo procesar la respuesta de Drive.');
  }

  if (!json.downloadUrl) throw new Error('Archivo privado o con límite de descargas.');

  const head = await fetch(json.downloadUrl);
  if (!head.ok) throw new Error('No se pudo acceder al archivo.');

  return {
    downloadUrl: json.downloadUrl,
    fileName: json.fileName?.trim() || `archivo_${id}`,
    sizeBytes: json.sizeBytes || 0,
    mimetype: (head.headers.get('content-type') || '').includes('octet-stream')
      ? detectarMime(json.fileName || '')
      : head.headers.get('content-type')
  };
}

// 📑 DETECTAR MIME
function detectarMime(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const tipos = {
    pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain', csv: 'text/csv', rtf: 'application/rtf', md: 'text/markdown',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm',
    mp3: 'audio/mpeg', zip: 'application/zip', rar: 'application/vnd.rar', '7z': 'application/x-7z-compressed'
  };
  return tipos[ext] || 'application/octet-stream';
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024, dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

handler.command = ['driv'];
handler.group = true;
export default handler;
