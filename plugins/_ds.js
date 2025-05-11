/*import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
  const jadiPath = './JadiBots/';
  const sessionPath = './Sessions/';

  const countDeletedFiles = (dirPath, isSubfolder = false) => {
    return new Promise((resolve) => {
      let deletedCount = 0;
      let foldersDeleted = 0;

      fs.readdir(dirPath, (err, items) => {
        if (err) return resolve({ deletedCount, foldersDeleted });

        let pending = items.length;
        if (!pending) return resolve({ deletedCount, foldersDeleted });

        items.forEach(item => {
          const fullPath = path.join(dirPath, item);

          if (isSubfolder) {
            fs.stat(fullPath, (err, stats) => {
              if (err || !stats.isDirectory()) {
                if (!--pending) resolve({ deletedCount, foldersDeleted });
                return;
              }

              fs.readdir(fullPath, (err, files) => {
                if (err) {
                  if (!--pending) resolve({ deletedCount, foldersDeleted });
                  return;
                }

                if (files.includes('creds.json')) {
                  if (!--pending) resolve({ deletedCount, foldersDeleted });
                  return;
                }

                let innerPending = files.length;
                if (!innerPending) {
                  fs.rmdir(fullPath, err => {
                    if (!err) foldersDeleted++;
                    if (!--pending) resolve({ deletedCount, foldersDeleted });
                  });
                  return;
                }

                files.forEach(file => {
                  const filePath = path.join(fullPath, file);
                  fs.unlink(filePath, err => {
                    if (!err) deletedCount++;
                    if (!--innerPending) {
                      fs.rmdir(fullPath, err => {
                        if (!err) foldersDeleted++;
                        if (!--pending) resolve({ deletedCount, foldersDeleted });
                      });
                    }
                  });
                });
              });
            });
          } else {
            fs.stat(fullPath, (err, stats) => {
              if (err || !stats.isFile() || item === 'creds.json') {
                if (!--pending) resolve({ deletedCount, foldersDeleted });
                return;
              }

              fs.unlink(fullPath, err => {
                if (!err) deletedCount++;
                if (!--pending) resolve({ deletedCount, foldersDeleted });
              });
            });
          }
        });
      });
    });
  };

  const { deletedCount: jadiDeleted, foldersDeleted: jadiFolders } = await countDeletedFiles(jadiPath, true);
  const { deletedCount: sessionDeleted, foldersDeleted: sessionFolders } = await countDeletedFiles(sessionPath);

  const totalFolders = jadiFolders + sessionFolders;

  conn.reply(m.chat, `*[sessions]* ${sessionDeleted} archivos borrados\n*[JadiBot]* ${jadiDeleted} archivos borrados\n*Carpetas eliminadas:* ${totalFolders}`, m);
  m.react('⚡');
};

handler.command = ['ds'];
export default handler;*/

import fs from 'fs';
import path from 'path';
import pino from 'pino';
import {
  default as makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';

let handler = async (m, { conn }) => {
  const jadiPath = './JadiBots/';
  const sessionPath = './Sessions/';
  let jadiEliminados = 0;
  let jadiCarpetasEliminadas = 0;

  // Verifica sesiones de JadiBots
  const subDirs = fs.existsSync(jadiPath)
    ? fs.readdirSync(jadiPath).filter(dir => fs.existsSync(`${jadiPath}/${dir}/creds.json`))
    : [];

  for (const dir of subDirs) {
    const sessionFolder = path.join(jadiPath, dir);
    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
      const { version } = await fetchLatestBaileysVersion();

      const socky = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: ["Cleaner", "Chrome", "1.0"],
      });

      const conectado = await new Promise((resolve) => {
        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        }, 8000); // 8 segundos máximo

        socky.ev.on("connection.update", ({ connection }) => {
          if (connection === "open" && !resolved) {
            resolved = true;
            clearTimeout(timeout);
            socky.ev.on("creds.update", saveCreds);
            resolve(true);
          }
          if (connection === "close" && !resolved) {
            resolved = true;
            clearTimeout(timeout);
            resolve(false);
          }
        });
      });

      if (!conectado) {
        fs.rmSync(sessionFolder, { recursive: true, force: true });
        jadiCarpetasEliminadas++;
      }

    } catch (e) {
      fs.rmSync(sessionFolder, { recursive: true, force: true });
      jadiCarpetasEliminadas++;
    }
  }

  // Limpieza de archivos sueltos en Sessions/
  const limpiarSessions = () => {
    return new Promise((resolve) => {
      let eliminados = 0;
      if (!fs.existsSync(sessionPath)) return resolve(eliminados);

      const files = fs.readdirSync(sessionPath);
      let pending = files.length;
      if (!pending) return resolve(eliminados);

      files.forEach(file => {
        const fullPath = path.join(sessionPath, file);
        if (file !== 'creds.json' && fs.statSync(fullPath).isFile()) {
          fs.unlink(fullPath, err => {
            if (!err) eliminados++;
            if (!--pending) resolve(eliminados);
          });
        } else {
          if (!--pending) resolve(eliminados);
        }
      });
    });
  };

  const sessionEliminados = await limpiarSessions();

  conn.reply(m.chat, `✅ *Limpieza completada:*\n\n- *Archivos en Sessions:* ${sessionEliminados} borrados\n- *Carpetas JadiBots eliminadas:* ${jadiCarpetasEliminadas}`, m);
  m.react('⚡');
};

handler.command = ['ds'];
export default handler;
