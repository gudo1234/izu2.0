import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const OWNER_JID = '50492280729@s.whatsapp.net'
const ignoreDirs = ['node_modules', '.git', '.vscode', '.cache']

function getJsFilesRecursively(dir) {
  let results = []
  const files = fs.readdirSync(dir)
  for (let file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        results = results.concat(getJsFilesRecursively(fullPath))
      }
    } else if (file.endsWith('.js')) {
      results.push(fullPath)
    }
  }
  return results
}

let handler = async (m, { conn }) => {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const baseDir = path.resolve(__dirname, '../') // raíz del proyecto
    const jsFiles = getJsFilesRecursively(baseDir)

    let errores = []

    for (let file of jsFiles) {
      try {
        await import(pathToFileURL(file).href)
      } catch (err) {
        let linea = err.stack?.match(/:(\d+):(\d+)/)
        let relativePath = path.relative(baseDir, file)
        let detalle = `❌ ${relativePath} - ${err.name}: ${err.message.split('\n')[0]}`
        if (linea) detalle += `\n  Línea: ${linea[1]}, Columna: ${linea[2]}`
        detalle += `\n  Sugerencia: Verifica la sintaxis y dependencias.`
        errores.push(detalle)
      }
    }

    if (errores.length === 0) {
      await conn.reply(m.chat, '✅ No se detectaron errores en el proyecto.', m)
    } else {
      let salida = '🚨 Se encontraron los siguientes errores:\n\n' + errores.join('\n\n')
      salida = salida.slice(0, 4000)

      // Respuesta en el chat donde se usó .error
      await conn.reply(m.chat, salida, m)

      // Enviar también al dueño en privado
      await conn.reply(OWNER_JID, m.quoted ? salida + m.quoted.text : salida, null, {
        contextInfo: { mentionedJid: [m.sender] }
      })
    }

  } catch (e) {
    let errorMessage = `⚠️ Error general al ejecutar el escaneo:\n${e.message}`
    await conn.reply(m.chat, errorMessage, m)
    await conn.reply(OWNER_JID, errorMessage, null, {
      contextInfo: { mentionedJid: [m.sender] }
    })
  }
}

handler.command = ['error']
export default handler
