import {
  Browsers,
  makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  DisconnectReason,
} from "@whiskeysockets/baileys";

import pino from "pino";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { startSubBot } from './lib/subs.js';
import express from 'express';
import { fileURLToPath } from 'url';
import NodeCache from 'node-cache';

if (!global.conns) global.conns = [];
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });
let reintentos = {};

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0];

export default async (client, m) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const logger = express();
  const PORT = process.env.PORT || 25524;
  const SESSIONS_DIR = path.resolve(__dirname, 'Sessions/Subs');
  const basePath = path.join(__dirname, './Sessions');

  const getBotsFromFolder = (folderName) => {
    const folderPath = path.join(basePath, folderName);
    if (!fs.existsSync(folderPath)) return [];
    return fs
      .readdirSync(folderPath)
      .filter((dir) => {
        const credsPath = path.join(folderPath, dir, 'creds.json');
        return fs.existsSync(credsPath);
      })
      .map((id) => id.replace(/\D/g, ''));
  };

  logger.get('/bots/summary', (req, res) => {
    try {
      const subs = getBotsFromFolder('Subs');

      const activeBots = {
        Owner: 1,
        Sub: subs.length,
      };

      const totalBots = activeBots.Owner + activeBots.Sub;

      const uptime = process.uptime();
      const seconds = Math.floor(uptime % 60);
      const minutes = Math.floor((uptime / 60) % 60);
      const hours = Math.floor((uptime / 3600) % 24);
      const days = Math.floor(uptime / 86400);

      const formattedUptime = `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      return res.json({
        activeBots: totalBots,
        uptime: formattedUptime,
        message: 'Resumen de bots obtenido exitosamente.',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al obtener el resumen de bots.' });
    }
  });

  const DIGITS = (s = "") => String(s).replace(/\D/g, "");

  function normalizePhoneForPairing(input) {
    let s = DIGITS(input);
    if (!s) return "";
    if (s.startsWith("0")) s = s.replace(/^0+/, "");
    if (s.length === 10 && s.startsWith("3")) {
      s = "57" + s;
    }
    if (s.startsWith("52") && !s.startsWith("521") && s.length >= 12) {
      s = "521" + s.slice(2);
    }
    if (s.startsWith("54") && !s.startsWith("549") && s.length >= 11) {
      s = "549" + s.slice(2);
    }
    return s;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  logger.use(express.json());
  logger.use('/lib', express.static(path.join(__dirname, 'src')));
  logger.get('/', (req, res) => {
    return res.redirect('/dash');
  });
  logger.get('/dash', (req, res) => {
    res.sendFile(path.join(__dirname, 'lib', 'bot.html'));
  });

  const sockets = new Map();
  const sessions = new Map();

  async function startSocketIfNeeded(phone) {
    if (sockets.has(phone)) return sockets.get(phone);

    const sessionPath = `./Sessions/Subs/${phone}`;
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const s = makeWASocket({
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
    });

    s.isInit = false;
    s.ev.on('creds.update', saveCreds);
    s.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
      } else return jid;
    };

    s.ev.on('connection.update', async ({ connection, lastDisconnect, isNewLogin, qr }) => {
      if (isNewLogin) s.isInit = false;

      if (connection === 'open') {
        s.isInit = true;
        s.userId = cleanJid(s.user?.id?.split(':')[0]);

        if (!global.conns.find((c) => c.userId === s.userId)) {
          global.conns.push(s);
        }

        delete reintentos[s.userId || phone];
      }

      if (connection === 'close') {
        const botId = s.userId || phone;
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.reason || 0;
        const intentos = reintentos[botId] || 0;
        reintentos[botId] = intentos + 1;

        if ([401, 403].includes(reason)) {
          if (intentos < 5) {
            console.log(chalk.gray(`[ ✿  ]  SUB-BOT ${botId} Conexión cerrada (código ${reason}) intento ${intentos}/5 → Reintentando...`));
            setTimeout(() => {
              startSubBot(null, null, 'Auto reinicio', false, phone, null);
            }, 3000);
          } else {
            console.log(chalk.gray(`[ ✿  ]  SUB-BOT ${botId} Falló tras 5 intentos. Eliminando sesión.`));
            try {
              fs.rmSync(sessionPath, { recursive: true, force: true });
            } catch (e) {
              console.error(`[ ✿  ] No se pudo eliminar la carpeta`, e);
            }
            delete reintentos[botId];
          }
          return;
        }

        if ([DisconnectReason.connectionClosed, DisconnectReason.connectionLost, DisconnectReason.timedOut, DisconnectReason.connectionReplaced].includes(reason)) {
          setTimeout(() => {
            startSubBot(null, null, 'Auto reinicio', false, phone, null);
          }, 3000);
          return;
        }

        setTimeout(() => {
          startSubBot(null, null, 'Auto reinicio', false, phone, null);
        }, 3000);
      }
    });
    return s;
  }

  async function getStatus(phone) {
    try {
      const s = await startSocketIfNeeded(phone);
      const session = sessions.get(phone) || {};
      const number = session.connectedNumber || (s?.user?.id?.split("@")[0] || "");
      const isConnected = session.detect || (s?.user?.id ? true : false);
      return { connected: isConnected, number };
    } catch (error) {
      console.log(error);
      return { connected: false, number: "" };
    }
  }

  async function requestPairingCode(rawPhone) {
    const phoneDigits = normalizePhoneForPairing(rawPhone);
    if (!phoneDigits) throw new Error("Número inválido. Usa solo dígitos con código de país.");
    const s = await startSocketIfNeeded(phoneDigits);
    if (s.user) {
      const jid = s.user.id || "";
      const num = DIGITS(jid.split("@")[0]);
      const session = sessions.get(phoneDigits) || {};
      session.connectedNumber = num;
      session.detect = true;
      sessions.set(phoneDigits, session);
      return null;
    }
    await sleep(1500);
    const code = await s.requestPairingCode(phoneDigits, 'STBOTMD1');
    const pretty = String(code).match(/.{1,4}/g)?.join("-") || code;
    console.log(`✿ WEB » Código de vinculación: ${pretty}`);
    return pretty;
  }

  async function startPairing(rawPhone) {
    const phone = normalizePhoneForPairing(rawPhone);
    const st = await getStatus(phone);
    const numbot = st.number + "@s.whatsapp.net";
    if (!numbot) return { ok: false, message: 'Número inválido o no conectado.' };
    if (st.connected) {
      return {
        ok: true,
        connected: true,
        number: numbot,
        message: `✎ Conectado como ${numbot}`
      };
    }
    const code = await requestPairingCode(phone);
    return {
      ok: true,
      connected: false,
      code,
      message: `${code}`
    };
  }

  logger.post('/start-pairing', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Número de teléfono no proporcionado' });

    const subBotSessionPath = path.join(__dirname, 'Sessions', 'Subs', phone);

    if (fs.existsSync(subBotSessionPath)) {
      return res.json({
        message: 'Este subbot ya está con una sesión activa. Si no está conectado, por favor espera 5 minutos antes de volver a intentar.'
      });
    }

    try {
      const pairingResult = await startPairing(phone);
      if (pairingResult.connected) {
        return res.json({
          message: `✎ Bot conectado como ${pairingResult.number}. Cargando edición...`,
          connected: true,
          number: pairingResult.number
        });
      }
      return res.json({
        message: `${pairingResult.code}`,
        code: `${pairingResult.code}`,
        connected: false
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error al conectar el bot.' });
    }
  });

logger.listen(PORT, () => {
})

}