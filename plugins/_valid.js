import PhoneNumber from "awesome-phonenumber"

// === Bandera por código de país ===
function banderaEmoji(code) {
  if (!code || code.length !== 2) return '🌐'
  const pts = [...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  return String.fromCodePoint(...pts)
}

// === Distancia Levenshtein ===
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
  return dp[a.length][b.length]
}

export async function before(m) {
  if (!m.text || !global.prefix.test(m.text)) return

  const usedPrefix = global.prefix.exec(m.text)[0]
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase()
  if (!command || command === "bot") return

  const user = global.db.data.users[m.sender]
  const number = m.sender.replace('@s.whatsapp.net', '')
  const country = PhoneNumber('+' + number).getRegionCode('international')
  const mundo = banderaEmoji(country)

  // === Verificar si el comando existe ===
  const validCommand = Object.values(global.plugins).some(p => {
    const cmds = Array.isArray(p.command) ? p.command : [p.command]
    return cmds.includes(command)
  })

  if (validCommand) {
    user.commands = (user.commands || 0) + 1
    return
  }

  // === Comando no encontrado ===
  const allCmds = Object.values(global.plugins)
    .flatMap(p => Array.isArray(p.command) ? p.command : [p.command])
    .filter(Boolean)

  const similares = allCmds
    .map(cmd => ({
      cmd,
      sim: Math.round((1 - levenshtein(command, cmd) / Math.max(command.length, cmd.length)) * 100)
    }))
    .filter(r => r.sim > 60)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 2)

  let text = `✩ *Comando no reconocido*\n> Usa *${usedPrefix}menu* para ver los disponibles.\n`
  if (similares.length)
    text += `\n¿Quizás quisiste decir?\n> ${similares.map(s => `• ${usedPrefix + s.cmd}`).join('\n')}`

  await m.reply(text)
}
