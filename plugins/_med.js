import fetch from 'node-fetch'
import cheerio from 'cheerio'
import { extname } from 'path'

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
  if (!text) throw `${usedPrefix + command} <link de MediaFire>`

  const url = text.trim()
  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

  let files = []

  if (/\/folder\//i.test(url)) {
    files = await extractFilesFromFolder(url)
  } else if (/\/file\//i.test(url)) {
    const file = await resolveMediaFireFile(url)
    if (file) files.push(file)
  }

  if (!files.length) throw '❌ No se encontraron archivos en la URL proporcionada.'

  for (const file of files) {
    const ext = extname(file.name).slice(1).toLowerCase()
    const mime = mimeFromExt(ext) || 'application/octet-stream'
    const caption = `*Nombre:* ${file.name}\n*Peso:* ${file.size}\n*Tipo:* ${ext.toUpperCase()}`

    await conn.sendMessage(m.chat, {
      document: { url: file.link },
      fileName: file.name,
      mimetype: mime,
      caption
    }, { quoted: m })
  }

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
}

//handler.command = ['mf', 'mediafire']
handler.command = ['jj']
handler.group = true
export default handler

// ✅ Detecta archivos desde carpetas
async function extractFilesFromFolder(folderUrl) {
  try {
    const html = await fetch(folderUrl).then(res => res.text())

    // Busca todos los links /file/...
    const fileLinks = [...html.matchAll(/href="(\/file\/[^\"]+)"/g)]
      .map(match => 'https://www.mediafire.com' + match[1])
      .filter((v, i, a) => a.indexOf(v) === i) // eliminar duplicados

    const files = []
    for (const link of fileLinks) {
      const file = await resolveMediaFireFile(link)
      if (file) files.push(file)
    }

    return files
  } catch (e) {
    return []
  }
}

// ✅ Obtiene nombre, tamaño y link directo
async function resolveMediaFireFile(fileUrl) {
  try {
    const html = await fetch(fileUrl).then(res => res.text())
    const $ = cheerio.load(html)
    const link = $('a#downloadButton').attr('href')
    const name = $('div.filename').text().trim() || fileUrl.split('/').pop()
    const size = $('ul.dl-info > li:contains("Size")').text().split(':')[1]?.trim() || '???'
    if (!link || !name) return null
    return { name, size, link }
  } catch {
    return null
  }
}
