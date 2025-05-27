import { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import fs from "fs";
import path from "path";
import pino from "pino";
import chalk from "chalk";
import { exec } from "child_process";
import ws from "ws";
import { makeWASocket } from '../lib/simple.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rtx = `Con otro celular o en la PC escanea este QR para convertirte en un *Sub-Bot* Temporal.\n\n\`1\`Haga clic en los tres puntos en la esquina superior derecha\n\n\`2\`Toque dispositivos vinculados\n\n\`3\`Escanee este codigo QR para iniciar sesion con el bot\n\n✧ ¡Este código QR expira en 45 segundos!.`;
const rtx2 = `Usa este Código para convertirte en un *Sub-Bot* Temporal.\n\n\`1\` » Haga clic en los tres puntos en la esquina superior derecha\n\n\`2\` » Toque dispositivos vinculados\n\n\`3\` » Selecciona Vincular con el número de teléfono\n\n\`4\` » Escriba el Código para iniciar sesión con el bot\n\n✧ No es recomendable usar tu cuenta principal.`;

if (!global.conns) global.conns = new Map();

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!globalThis.db.data.settings[conn.user.jid].jadibotmd)
    return m.reply(`Comando desactivado temporalmente.`);

  let cooldown = 120000;
  let lastSubs = global.db.data.users[m.sender].Subs || 0;
  if (Date.now() - lastSubs < cooldown) {
    let waitTime = cooldown - (Date.now() - lastSubs);
    return conn.reply(m.chat, `Debes esperar ${msToTime(waitTime)} para volver a vincular un *Sub-Bot.*`, m);
  }

  if (global.conns.size >= 20)
    return m.reply(`No se han encontrado espacios para *Sub-Bots* disponibles.`);

  let who = m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender);
  let id = who.split`@`[0];
  let pathYukiJadiBot = path.join(`./JadiBots/`, id);

  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true });

  await yukiJadiBot({ pathYukiJadiBot, m, conn, args, usedPrefix, command, fromCommand: true });
  global.db.data.users[m.sender].Subs = Date.now();
};

handler.help = ['qr', 'code'];
handler.tags = ['serbot'];
handler.command = ['qr', 'code'];

export default handler;

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix, command, fromCommand } = options;

  if (command === 'code') {
    command = 'qr';
    args.unshift('code');
  }

  const mcode = args.some(a => /(--code|code)/.test(a.trim()));

  const pathCreds = path.join(pathYukiJadiBot, "creds.json");
  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true });

  try {
    if (args[0] && args[0] !== undefined) {
      fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'));
    }
  } catch {
    conn.reply(m.chat, `Uso correcto: ${usedPrefix + command} code`, m);
    return;
  }

  const { version } = await fetchLatestBaileysVersion();
  const { state } = await useMultiFileAuthState(pathYukiJadiBot);

  const connectionOptions = {
    logger: pino({ level: "fatal" }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Yuki-Suou (Sub Bot)', 'Chrome', '2.0.0'],
    version,
    generateHighQualityLinkPreview: true
  };

  let sock = makeWASocket(connectionOptions);
  sock.isInit = false;

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr, isNewLogin } = update;
    if (isNewLogin) sock.isInit = false;

    if (qr && !mcode && m?.chat) {
      let txtQR = await conn.sendMessage(m.chat, {
        image: await qrcode.toBuffer(qr, { scale: 8 }),
        caption: rtx
      }, { quoted: m });
      if (txtQR?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000);
      return;
    }

    if (qr && mcode) {
      let secret = await sock.requestPairingCode(m.sender.split`@`[0]);
      secret = secret.match(/.{1,4}/g)?.join("-");
      let txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m });
      let codeBot = await m.reply(secret);
      if (txtCode?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000);
      if (codeBot?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000);
      console.log(secret);
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if ([408, 428, 515].includes(reason)) {
        console.log(chalk.magentaBright(`Reconectando sesión ${path.basename(pathYukiJadiBot)}...`));
      } else if ([405, 401].includes(reason)) {
        console.log(chalk.magentaBright(`Sesión ${path.basename(pathYukiJadiBot)} cerrada por credenciales inválidas o desconexión.`));
        try {
          if (fromCommand && m?.chat)
            await conn.sendMessage(`${path.basename(pathYukiJadiBot)}@s.whatsapp.net`, {
              text: '*SESIÓN PENDIENTE*\n\n> *INTENTA NUEVAMENTE VOLVER A SER SUB-BOT*'
            }, { quoted: m });
        } catch { }
        fs.rmdirSync(pathYukiJadiBot, { recursive: true });
        global.conns.delete(m.sender);
      }
    }
  });

  global.conns.set(m.sender, sock);
}

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor(duration / (1000 * 60 * 60));
  return (hours ? hours + "h " : "") + (minutes ? minutes + "m " : "") + (seconds ? seconds + "s" : "");
}
