import axios from 'axios'

const mimeFromExt = ext => ({
  '7z': 'application/x-7z-compressed',
  'zip': 'application/zip',
  'rar': 'application/vnd.rar',
  'apk': 'application/vnd.android.package-archive',
  'mp4': 'video/mp4',
  'mkv': 'video/x-matroska',
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'ogg': 'audio/ogg',
  'flac': 'audio/flac',
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt': 'text/plain',
  'html': 'text/html',
  'csv': 'text/csv',
  'json': 'application/json',
  'js': 'application/javascript',
  'py': 'text/x-python',
  'c': 'text/x-c',
  'cpp': 'text/x-c++',
  'exe': 'application/vnd.microsoft.portable-executable'
}[ext])

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `${e} Ingresa un enlace de *MediaFire*.\n\n📘 Ejemplo:\n> *${usedPrefix + command} https://www.mediafire.com/file/xxxx*`
    }, { quoted: m })
  }

  const mediafireRegex = /https?:\/\/(www\.)?mediafire\.com\/file\/[a-zA-Z0-9]+/i
  if (!mediafireRegex.test(text)) {
    return conn.sendMessage(m.chat, {
      text: `${e} El enlace proporcionado no parece ser de *MediaFire*.\nPor favor revisa el formato.`
    }, { quoted: m })
  }

  try {
    await m.react('🕒')

    const apiURL = `https://api.stellarwa.xyz/dl/mediafire?url=${encodeURIComponent(text)}&key=stellar-wsRJSBsk`
    const { data: res } = await axios.get(apiURL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 20000
    })

    if (!res?.status || !res.data?.dl) {
      console.log('[⚠️ API SIN DATOS VÁLIDOS]', res)
      throw new Error('No se obtuvo información válida del archivo.')
    }

    const file = res.data
    const extMatch = file.title.match(/\.(\w+)$/i)
    const ext = extMatch ? extMatch[1].toLowerCase() : 'zip'
    const mime = mimeFromExt(ext) || file.mimeType || 'application/octet-stream'

    const caption = [
      file.peso ? `📦 *Peso:* ${file.peso}` : '',
      file.fecha ? `📅 *Fecha:* ${file.fecha}` : ''
    ].filter(Boolean).join('\n')

    await conn.sendMessage(m.chat, {
      document: { url: file.dl },
      mimetype: mime,
      fileName: file.title,
      caption
    }, { quoted: m })

    await m.react('✅')
  } catch (err) {
    console.error('[❌ ERROR EN MEDIAFIRE]', err)
    await m.react('❌')

    let msg = `${e} *Error al procesar el enlace de MediaFire.*`
    if (err.response?.status) msg += `\n\n📡 *Estado HTTP:* ${err.response.status}`
    if (err.message) msg += `\n📄 *Detalle:* ${err.message}`

    return conn.sendMessage(m.chat, { text: msg }, { quoted: m })
  }
}

handler.command = ['mf', 'mediafire']
handler.group = true

export default handler
