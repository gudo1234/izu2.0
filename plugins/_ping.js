import { exec as _exec } from 'child_process'
import { totalmem, freemem } from 'os'
import { sizeFormatter } from 'human-readable'
import speed from 'performance-now'
import util from 'util'

const exec = util.promisify(_exec)

const formatSize = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

let handler = async (m, { conn }) => {
  let start = speed()
  let latency = speed() - start

  // Ejecutar comandos en paralelo
  let [uptimeOut, unameOut, cpuOut, ramOut, upPrettyOut] = await Promise.all([
    exec('cat /proc/uptime').catch(() => ({ stdout: '0 0' })),
    exec('uname -a').catch(() => ({ stdout: 'Unknown' })),
    exec('cat /proc/cpuinfo').catch(() => ({ stdout: '' })),
    exec('free -m').catch(() => ({ stdout: '' })),
    exec('uptime -p').catch(() => ({ stdout: 'unknown' })),
  ])

  const uptimeMs = parseFloat(uptimeOut.stdout.split(' ')[0]) * 1000
  const cpuInfo = cpuOut.stdout
  const procesador = (cpuInfo.match(/model name\s*:\s*(.*)/) || [])[1] || 'Unknown'
  const cpu = (cpuInfo.match(/cpu MHz\s*:\s*(.*)/) || [])[1] || 'Unknown'

  let replyText = `*» Velocidad:* ${latency.toFixed(4)} _ms_`
  replyText += `\n*» Procesador:* ${procesador}`
  replyText += `\n*» CPU:* ${cpu} MHz`
  replyText += `\n*» RAM:* ${formatSize(totalmem() - freemem())} / ${formatSize(totalmem())}`
  replyText += `\n*» Tiempo de actividad:* ${clockString(uptimeMs)}`

  conn.reply(m.chat, replyText, m)
}

handler.command = ['ping', 'speed', 'p']
export default handler

function clockString(ms) {
  if (isNaN(ms)) return '--d --h --m --s'
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d.toString().padStart(2, '0')}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
}
