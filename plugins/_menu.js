import fs from 'fs'
import path from 'path'
import { getDevice } from "@whiskeysockets/baileys"
import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix }) => {
  let delirius = await axios.get(`https://delirius-apiofc.vercel.app/tools/country?text=${PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')}`)
  let paisdata = delirius.data.result
  let mundo = paisdata ? `${paisdata.name} ${paisdata.emoji}\n│ 🗓️ *Fecha:* ${paisdata.date}\n│ 🕒 *Hora local:* ${paisdata.time12}` : 'Desconocido'

  const obtenerComandos = () => {
    const comandos = []
    const carpetaPlugins = './plugins'

    const archivos = fs.readdirSync(carpetaPlugins)
      .filter(file => /^(anime|fun|nsfw)-.+\.js$/.test(file))

    for (const archivo of archivos) {
      const ruta = path.join(carpetaPlugins, archivo)
      const contenido = fs.readFileSync(ruta, 'utf8')
      const coincidencias = contenido.match(/handler\.command\s*=\s*(.*?|['"`].+?['"`])/gs)

      if (coincidencias) {
        for (let match of coincidencias) {
          let comandosExtraidos
          try {
            comandosExtraidos = eval(match.split('=')[1].trim())
            if (!Array.isArray(comandosExtraidos)) comandosExtraidos = [comandosExtraidos]
            comandos.push(...comandosExtraidos.map(cmd => `│ ➜ ${usedPrefix}${cmd}`))
          } catch (e) {
            continue
          }
        }
      }
    }

    return comandos.sort().join('\n')
  }

  const listaComandos = obtenerComandos()

  const txt = `🗣️ Hola, *🥀Buenos días🌅tardes🌇noches🌆*\n\n⚡ \`izuBot:\` Sistema automático para ejecutar comandos.

━━━━━━━━━━━━━
⁉ ᴄᴏɴᴛᴇxᴛ-ɪɴғᴏ☔
┌────────────
│ 🚩 Nombre: ${m.pushName}
│ 🌎 País: ${mundo}
│ 🗓 Fecha: ${moment.tz('America/Bogota').format('YYYY-MM-DD')}
│ 🕒 Hora local: ${moment.tz('America/Bogota').format('hh:mm:ss A')}
│ 📅 Fecha: ${moment.tz('America/Bogota').format('DD/MM/YY')}
└────────────

⁉ comandos random
┌────────────
${listaComandos}
└────────────`

  m.react('🏖️')
  await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
}

handler.command = ['menurandom', 'menu2']
handler.group = true
export default handler
