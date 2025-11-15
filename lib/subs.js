import {
  Browsers,
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  jidDecode,
} from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import pino from 'pino';
import fs from 'fs';
import chalk from 'chalk';
import moment from 'moment-timezone';

if (!global.conns) global.conns = []
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });
let reintentos = {}

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0]

export async function startSubBot(
  m,
  client,
  caption = '',
  isCode = false,
  phone = '',
  chatId = '',
  commandFlags = {},
  isCommand = false,
) {

  const id = phone || (m?.sender || '').split('@')[0]
  const sessionFolder = `./Sessions/Subs/${id}`
  const senderId = m?.sender

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
  const { version } = await fetchLatestBaileysVersion()
  // const logger = pino({ level: 'silent' })

  console.info = () => {} 
const connectionOptions = makeWASocket({
  logger: pino({ level: 'silent' }),
  printQRInTerminal: false,
  browser: Browsers.macOS('Chrome'),
  auth: state,
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async () => '',
  msgRetryCounterCache,
  userDevicesCache,
  cachedGroupMetadata: async (jid) => groupCache.get(jid),
  version,
  keepAliveIntervalMs: 60_000,
  maxIdleTimeMs: 120_000,
  })

  const sock = connectionOptions

  /* console.info = () => {} 
  const sock = makeWASocket({
    logger,
    version,
    printQRInTerminal: false,
    browser: ['Windows', 'Chrome'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => '',
    keepAliveIntervalMs: 45000,
    maxIdleTimeMs: 60000
  })*/

  sock.isInit = false
  let isInit = true
  sock.ev.on('creds.update', saveCreds)
  // commandFlags[m.sender] = true

  sock.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid
    } else return jid
  }

async function connectionUpdate(update) {
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, isNewLogin, qr }) => {
    if (isNewLogin) sock.isInit = false

    if (connection === 'open') {
      sock.isInit = true
      sock.userId = cleanJid(sock.user?.id?.split('@')[0])

      if (!global.conns.find((c) => c.userId === sock.userId)) {
        global.conns.push(sock)
      }

      delete reintentos[sock.userId || id]
      console.log(chalk.gray(`[ ✿  ]  SUB-BOT conectado: ${sock.userId}`))
    }

    if (connection === 'close') {
      const botId = sock.userId || id
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.reason || 0
      const intentos = reintentos[botId] || 0
      reintentos[botId] = intentos + 1

      if ([401, 403].includes(reason)) {
        if (intentos < 5) {
          console.log(chalk.gray(`[ ✿  ]  SUB-BOT ${botId} Conexión cerrada (código ${reason}) intento ${intentos}/5 → Reintentando...`))
          setTimeout(() => {
            await creloadHandler(true).catch(console.error)
          }, 3000)
        } else {
          console.log(chalk.gray(`[ ✿  ]  SUB-BOT ${botId} Falló tras 5 intentos. Eliminando sesión.`))
          try {
            fs.rmSync(sessionFolder, { recursive: true, force: true })
          } catch (e) {
            console.error(`[ ✿  ] No se pudo eliminar la carpeta ${sessionFolder}:`, e)
          }
          delete reintentos[botId]
        }
        return
      }

      if ([DisconnectReason.connectionClosed, DisconnectReason.connectionLost, DisconnectReason.timedOut, DisconnectReason.connectionReplaced].includes(reason)) {
          await creloadHandler(true).catch(console.error)
        return
      }

        await creloadHandler(true).catch(console.error)
    }

    if (qr && isCode && phone && client && chatId && commandFlags[senderId]) {
      try {
        let codeGen = await sock.requestPairingCode(phone, 'ABCD1234')
        codeGen = codeGen.match(/.{1,4}/g)?.join("-") || codeGen
        const msg = await m.reply(caption)
        const msgCode = await m.reply(codeGen)
        delete commandFlags[senderId]
        setTimeout(async () => {
          try {
            await client.sendMessage(chatId, { delete: msg.key })
            await client.sendMessage(chatId, { delete: msgCode.key })
          } catch {}
        }, 60000)
      } catch (err) {
        console.error("[Código Error]", err)
      }
    }
  })
}  

setInterval(async () => {
if (!sock.user) {
try { sock.ws.close() } catch (e) {}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}}, 60000)
let handler = await import('../handler.js')
let creloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
    if (Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    console.error('⚠︎ Nuevo error: ', e)
  }
  if (restatConn) {
    const oldChats = sock.chats
    try { sock.ws.close() } catch { }
    sock.ev.removeAllListeners()
    sock = makeWASocket(connectionOptions, { chats: oldChats })
    isInit = true
  }
  if (!isInit) {
    sock.ev.off("messages.upsert", sock.handler)
    sock.ev.off("connection.update", sock.connectionUpdate)
    sock.ev.off('creds.update', sock.credsUpdate)
  }
  sock.handler = handler.handler.bind(sock)
  sock.connectionUpdate = connectionUpdate.bind(sock)
  sock.credsUpdate = saveCreds.bind(sock, true)
  sock.ev.on("messages.upsert", sock.handler)
  sock.ev.on("connection.update", sock.connectionUpdate)
  sock.ev.on("creds.update", sock.credsUpdate)
  isInit = false
  return true
}
creloadHandler(false)

  process.on('uncaughtException', console.error)
   return sock
}