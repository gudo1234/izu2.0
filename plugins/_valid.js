import { getDevice } from "@whiskeysockets/baileys"
import PhoneNumber from "awesome-phonenumber"
import moment from "moment-timezone"
import path from "path"

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' })

// === Función para mostrar bandera por país ===
function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐'
  const codePoints = [...countryCode.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}

// === Distancia Levenshtein (sin librerías externas) ===
function levenshteinDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }
  return dp[a.length][b.length]
}

export async function before(m) {
  if (!m.text || !global.prefix.test(m.text)) return

  const usedPrefix = global.prefix.exec(m.text)[0]
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase()
  if (!command || command === "bot") return

  const user = global.db.data.users[m.sender]
  const number = m.sender.replace('@s.whatsapp.net', '')
  const phoneInfo = PhoneNumber('+' + number)
  const countryCode = phoneInfo.getRegionCode('international')
  const mundo = banderaEmoji(countryCode)

  // === Verificar si el comando existe ===
  const validCommand = Object.values(global.plugins).some(plugin => {
    const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
    return cmds.includes(command)
  })

  if (validCommand) {
    user.commands = (user.commands || 0) + 1
    return
  }

  // === Recolectar todos los comandos disponibles ===
  const allCommands = Object.values(global.plugins)
    .flatMap(p => Array.isArray(p.command) ? p.command : [p.command])
    .filter(Boolean)
    .filter(cmd => typeof cmd === 'string')

  // === Calcular similitud y tomar las mejores ===
  const similares = allCommands
    .map(cmd => {
      const dist = levenshteinDistance(command, cmd)
      const maxLen = Math.max(command.length, cmd.length)
      const sim = maxLen === 0 ? 100 : Math.round((1 - dist / maxLen) * 100)
      return { cmd, sim }
    })
    .filter(r => !isNaN(r.sim) && r.sim > 0) // mostrar solo si hay alguna similitud
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 2)

  // === Mensaje final con % incluido ===
  let text = `⌗ *Comando no reconocido*\n> ${mundo} Usa *${usedPrefix}menu* para ver los disponibles.\n`
  if (similares.length) {
    text += `\n¿Quizás quisiste decir?\n`
    text += similares.map(s => `> ${usedPrefix + s.cmd} (${s.sim}% de similitud)`).join('\n')
  }

  await m.reply(text)
}
