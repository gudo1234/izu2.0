import fs from 'fs'
import path from 'path'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason, jidNormalizedUser } from '@whiskeysockets/baileys'
import P from 'pino'
import { unlinkSync } from 'fs'

const delay = (ms) => new Promise((res) => setTimeout(res, ms))
const cooldown = new Map()

export const command = ['sock', 'scode']
export const tags = ['jadibot']
export const run = async (m, { conn, args, usedPrefix, command }) => {
  const user = m.sender
  const id = user.replace(/[^0-9]/g, '')
  const cooldownTime = 120000
  const now = Date.now()

  if (cooldown.has(user) && now - cooldown.get(user) < cooldownTime) {
    const remaining = ((cooldownTime - (now - cooldown.get(user))) / 1000).toFixed(0)
    return m.reply(`Espera ${remaining}s antes de volver a usar este comando.`)
  }

  if (global.conns.size >= 25) {
    return m.reply('Límite de sub-bots activos alcanzado. Intenta más tarde.')
  }

  cooldown.set(user, now)

  const type = command === 'code' ? 'code' : 'qr'
  const sessionDir = `./session-subbot/${id}`

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true })
  }

  await yukiJadiBot(m, { sessionDir, type })
}

async function yukiJadiBot(m, { sessionDir, type }) {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
    const { version, isLatest } = await fetchLatestBaileysVersion()
    const sock = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, P().info)
      },
      browser: ['Yuki-MD', 'Chrome', '1.0.0'],
      logger: P({ level: 'silent' }),
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => ({
        conversation: 'Hola'
      })
    })

    if (type === 'sock') {
      sock.ev.on('connection.update', async (update) => {
        const { qr, connection, lastDisconnect } = update
        if (qr) {
          m.reply('Escanea este código QR para conectar como sub-bot:')
          await conn.sendFile(m.chat, Buffer.from(qr), 'qr.png', 'QR generado', m)
        }
        if (connection === 'open') {
          await onSubBotConnected(sock, sessionDir)
          m.reply('¡Sub-bot conectado exitosamente!')
        }
        if (connection === 'close') {
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
          if (shouldReconnect) {
            yukiJadiBot(m, { sessionDir, type })
          } else {
            global.conns.delete(sock.user.id)
            await cleanupSession(sessionDir)
            m.reply('Sesión finalizada o inválida.')
          }
        }
      })
    }

    if (type === 'scode') {
      sock.ev.once('creds.update', async () => {
        const credsRaw = fs.readFileSync(path.join(sessionDir, 'creds.json'))
        const json = JSON.parse(credsRaw)
        if (!json?.noiseKey?.private) return m.reply('Error al generar el código.')
        const code = await sock.requestPairingCode(jidNormalizedUser(sock.user.id))
        m.reply(`Código generado: ${code}`)
        await onSubBotConnected(sock, sessionDir)
      })
    }

    sock.ev.on('creds.update', saveCreds)

  } catch (err) {
    console.error('Error al iniciar sub-bot:', err)
    m.reply('Error al iniciar el sub-bot.')
    await cleanupSession(sessionDir)
  }
}

async function onSubBotConnected(sock, sessionDir) {
  const id = sock.user.id
  if (global.conns.has(id)) return

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return
    await sock.sendMessage(msg.key.remoteJid, { text: 'Sub-bot activo.' })
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close' && lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut) {
      global.conns.delete(id)
      await cleanupSession(sessionDir)
    }
  })

  global.conns.set(id, sock)
  console.log(`Sub-bot conectado: ${id}`)
}

async function cleanupSession(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true })
    console.log('Sesión limpiada:', dir)
  } catch (e) {
    console.error('Error al eliminar sesión:', e)
  }
}
