import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`${e} Por favor, ingresa una URL de Google Drive.`);

  const carpetaMatch = text.match(/(?:folders\/|drive\/(?:mobile\/)?folders\/)([a-zA-Z0-9_-]+)/i);
  const carpetaID = carpetaMatch?.[1];

  if (carpetaID) {
    m.react('🗂️');

    try {
      const html = await fetch(`https://drive.google.com/drive/folders/${carpetaID}`).then(res => res.text())
      const fileMatches = [...html.matchAll(/"https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/g)];
      const idsUnicos = [...new Set(fileMatches.map(v => v[1]))];

      if (!idsUnicos.length) return m.reply(`${e} No se encontraron archivos en esta carpeta.`);

      const encontrados = idsUnicos.map(id => ({
        id,
        url: `https://drive.google.com/file/d/${id}`
      }));

      m.reply(`📂 Se encontraron *${encontrados.length}* archivos. Enviando uno por uno...`);

      for (const archivo of encontrados) {
        try {
          const info = await fdrivedl(archivo.url);
          const peso = formatBytes(info.sizeBytes);
          const nombre = info.fileName || `archivo_${archivo.id}`;
          const tipo = info.mimetype || detectarMime(nombre);

          await conn.sendMessage(m.chat, {
            document: { url: info.downloadUrl },
            fileName: nombre,
            mimetype: tipo
          }, { quoted: m });
m.react('✅')
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

  // Si no es carpeta, verificar si es archivo individual
  if (!/drive\.google\.com\/(file\/d\/|open\?id=|uc\?id=)/i.test(text)) {
    return m.reply(`${e} La URL ingresada no parece ser válida de un archivo individual de Google Drive.`);
  }

  m.react('🕒');

  try {
    const res = await fdrivedl(text);
    const peso = formatBytes(res.sizeBytes);
    let nombre = res.fileName || 'archivo';
    let tipo = res.mimetype || detectarMime(nombre);

    if (peso.includes('GB') && parseFloat(peso) > 1.8) {
      return m.reply('📦 El archivo es muy grande para enviarlo.');
    }

    const texto = `📁 *Archivo:* ${nombre}\n${e} *Tamaño:* ${peso}\n> Enviando el archivo tipo *${tipo}*, espere un momento...`;
    m.reply(texto);

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
    pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain', csv: 'text/csv', rtf: 'application/rtf', md: 'text/markdown',
    odt: 'application/vnd.oasis.opendocument.text', ods: 'application/vnd.oasis.opendocument.spreadsheet',
    odp: 'application/vnd.oasis.opendocument.presentation',

    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', bmp: 'image/bmp',
    svg: 'image/svg+xml', webp: 'image/webp', ico: 'image/vnd.microsoft.icon',
    tif: 'image/tiff', tiff: 'image/tiff', heic: 'image/heic',

    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', oga: 'audio/ogg', flac: 'audio/flac',
    m4a: 'audio/mp4', aac: 'audio/aac', opus: 'audio/opus', amr: 'audio/amr', mid: 'audio/midi', midi: 'audio/midi',

    mp4: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska', avi: 'video/x-msvideo',
    mov: 'video/quicktime', m4v: 'video/x-m4v', wmv: 'video/x-ms-wmv', flv: 'video/x-flv',
    mpg: 'video/mpeg', mpeg: 'video/mpeg', '3gp': 'video/3gpp', '3g2': 'video/3gpp2',

    srt: 'application/x-subrip', vtt: 'text/vtt', ass: 'application/x-ass', sub: 'text/plain',

    ttf: 'font/ttf', otf: 'font/otf', woff: 'font/woff', woff2: 'font/woff2',

    zip: 'application/zip', rar: 'application/vnd.rar', tar: 'application/x-tar', gz: 'application/gzip',
    tgz: 'application/gzip', '7z': 'application/x-7z-compressed', bz2: 'application/x-bzip2', xz: 'application/x-xz',

    exe: 'application/vnd.microsoft.portable-executable', apk: 'application/vnd.android.package-archive',
    sh: 'application/x-sh', bat: 'application/x-msdos-program', jar: 'application/java-archive',
    py: 'text/x-python', js: 'application/javascript', jsx: 'text/jsx', ts: 'application/typescript',
    json: 'application/json', html: 'text/html', htm: 'text/html', css: 'text/css', xml: 'application/xml',
    php: 'application/x-httpd-php',

    iso: 'application/x-iso9660-image', dmg: 'application/x-apple-diskimage', img: 'application/octet-stream',

    log: 'text/plain', yaml: 'text/yaml', yml: 'text/yaml', psd: 'image/vnd.adobe.photoshop',
    ai: 'application/postscript', eps: 'application/postscript',
    epub: 'application/epub+zip', mobi: 'application/x-mobipocket-ebook'
  };
  return tipos[ext] || 'application/octet-stream';
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB'][i];
}

handler.command = ['drive', 'drivedl', 'dldrive', 'gdrive'];
handler.group = true;
export default handler;
