import { totalmem, freemem, cpus, uptime } from 'os'
import { sizeFormatter } from 'human-readable'

const formatSize = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

let handler = async (m, { conn }) => {
  const start = performance.now()

  const cpuInfo = cpus()[0]
  const procesador = cpuInfo.model
  const cpuSpeed = cpuInfo.speed // MHz
  const usedRam = totalmem() - freemem()
  const uptimeMs = uptime() * 1000
  const latency = performance.now() - start

  const replyText = [
    `*» Velocidad:* ${latency.toFixed(4)} _ms_`,
    `*» Procesador:* ${procesador}`,
    `*» CPU:* ${cpuSpeed} MHz`,
    `*» RAM:* ${formatSize(usedRam)} / ${formatSize(totalmem())}`,
    `*» Tiempo de actividad:* ${clockString(uptimeMs)}`
  ].join('\n')

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
