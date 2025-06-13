import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  const e = '⚠️';

  if (!text) return m.reply(`${e} Por favor, ingresa una URL de Google Drive.`);

  const carpetaMatch = text.match(/(?:folders\/|drive\/(?:mobile\/)?folders\/)([a-zA-Z0-9_-]+)/i);
  const carpetaID = carpetaMatch?.[1];

  if (carpetaID) {
    m.react('🗂️');
    try {
      const archivosUnicos = new Set();
      const encontrados = [];

      async function extraerArchivosDesdeCarpeta(id) {
        const html = await fetch(`https://drive.google.com/drive/folders/${id}`).then(res => res.text());

        const archivos = [...html.matchAll(/\/file\/d\/([a-zA-Z0-9_-]{10,})/g)];
        for (const match of archivos) {
          const archivoID = match[1];
          if (!archivosUnicos.has(archivoID)) {
            archivosUnicos.add(archivoID);
            encontrados.push({
              id: archivoID,
              url: `https://drive.google.com/file/d/${archivoID}`
            });
          }
        }

        const subcarpetas = [...html.matchAll(/\/drive\/folders\/([a-zA-Z0-9_-]+)/g)];
        for (const match of subcarpetas) {
          const subID = match[1];
          if (subID !== id) {
            await extraerArchivosDesdeCarpeta(subID);
          }
        }
      }

      await extraerArchivosDesdeCarpeta(carpetaID);

      if (!encontrados.length) return m.reply(`${e} No se encontraron archivos en esta carpeta ni en subcarpetas.`);

      m.reply(`📂 Se encontraron *${encontrados.length}* archivos. Enviando uno por uno...`);

      for (const archivo of encontrados) {
        try {
          const info = await fdrivedl(archivo.url);
          const peso = formatBytes(info.sizeBytes);
          const nombre = info.fileName || `archivo_${archivo.id}`;
          const tipo = (info.mimetype && !info.mimetype.includes('octet-stream'))
            ? info.mimetype
            : detectarMime(nombre);

          await conn.sendMessage(m.chat, {
            document: { url: info.downloadUrl },
            fileName: nombre,
            mimetype: tipo
          }, { quoted: m });

          await new Promise(r => setTimeout(r, 2000));

        } catch (err) {
          console.error(`❌ Error al enviar ${archivo.url}:`, err);
          await m.reply(`${e} No se pudo descargar el archivo con ID: ${archivo.id}`);
        }
      }

    } catch (err) {
      console.error(err);
      return m.reply(`${e} Error al procesar la carpeta. Puede que sea privada o que el formato haya cambiado.`);
    }

    return;
  }

  if (!/drive\.google\.com\/(file\/d\/|open\?id=|uc\?id=)/i.test(text)) {
    return m.reply(`${e} La URL ingresada no parece ser válida de un archivo individual de Google Drive.`);
  }

  m.react('🕒');

  try {
    const res = await fdrivedl(text);
    const peso = formatBytes(res.sizeBytes);
    let nombre = res.fileName || 'archivo';
    let tipo = res.mimetype;

    if (!tipo || tipo === 'application/octet-stream') {
      tipo = detectarMime(nombre);
    }

    if (peso.includes('GB') && parseFloat(peso) > 1.8) {
      return m.reply('📦 El archivo es muy grande para enviarlo.');
    }

    const texto = `📁 *Archivo:* ${nombre}\n${e} *Tamaño:* ${peso}\n> Enviando el archivo tipo *${tipo}*, espere un momento...`;
    m.reply(texto);
    m.react('✅');

    await conn.sendMessage(m.chat, {
      document: { url: res.downloadUrl },
      fileName: nombre,
      mimetype: tipo
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply(`${e} Error al intentar descargar el archivo.`);
  }
};

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
    throw new Error('No se pudo procesar la respuesta de Google Drive.');
  }

  if (!json.downloadUrl) throw new Error('Este archivo ha alcanzado el límite de descargas o es privado.');

  const head = await fetch(json.downloadUrl);
  if (!head.ok) throw new Error('No se pudo acceder al archivo.');

  return {
    downloadUrl: json.downloadUrl,
    fileName: json.fileName?.trim() || `archivo_${id}`,
    sizeBytes: json.sizeBytes,
    mimetype: (head.headers.get('content-type') || '').includes('octet-stream')
      ? detectarMime(json.fileName || '')
      : head.headers.get('content-type')
  };
}

function detectarMime(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const tipos = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    txt: 'text/plain',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    apk: 'application/vnd.android.package-archive',
    csv: 'text/csv',
    json: 'application/json',
    xml: 'application/xml',
    html: 'text/html'
  };
  return tipos[ext] || 'application/octet-stream';
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB'][i];
}

handler.command = ['g'];
handler.group = true;
export default handler;
