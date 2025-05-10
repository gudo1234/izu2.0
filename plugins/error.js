import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

let handler = async (m, { conn }) => {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const pluginsDir = path.join(__dirname, '../plugins')
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

    let errores = []

    for (let file of files) {
      try {
        let fullPath = path.join(pluginsDir, file)
        // Intentar importar dinámicamente el archivo
        await import(`file://${fullPath}`)
      } catch (err) {
        errores.push(`❌ ${file} - ${err.name}: ${err.message.split('\n')[0]}`)
      }
    }

    if (errores.length === 0) {
      conn.reply(m.chat, '✅ No se detectaron errores en los archivos de plugins.', m)
    } else {
      let respuesta = 'Se encontraron los siguientes errores:\n\n' + errores.join('\n')
      conn.reply(m.chat, respuesta, m)
    }

  } catch (e) {
    conn.reply(m.chat, `Error al ejecutar el escaneo: ${e.message}`, m)
  }
}

handler.command = ['error']
export default handler
