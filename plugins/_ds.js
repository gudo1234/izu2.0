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

  //conn.reply(m.chat, `*[sessions]* ${sessionDeleted} archivos borrados\n*[JadiBot]* ${jadiDeleted} archivos borrados\n*[Carpetas eliminadas]* ${totalFolders}`, m);
  //m.react('⚡');
};

handler.customPrefix = /😂|😁|🤣|😅|😆|😎|🤖|👾|❤️/
handler.command = new RegExp
export default handler;*/


import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
  const jadiPath = './JadiBots/';
  const sessionPath = './Sessions/';

  const countDeletedFiles = async (dirPath, isSubfolder = false) => {
    let deletedCount = 0;
    let foldersDeleted = 0;

    if (!fs.existsSync(dirPath)) return { deletedCount, foldersDeleted };

    const items = await fs.promises.readdir(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stats = await fs.promises.stat(fullPath);

      if (isSubfolder && stats.isDirectory()) {
        const files = await fs.promises.readdir(fullPath);
        if (files.includes('creds.json')) continue;

        for (const file of files) {
          const filePath = path.join(fullPath, file);
          try {
            await fs.promises.unlink(filePath);
            deletedCount++;
          } catch {}
        }

        try {
          await fs.promises.rmdir(fullPath);
          foldersDeleted++;
        } catch {}
      } else if (stats.isFile() && item !== 'creds.json') {
        try {
          await fs.promises.unlink(fullPath);
          deletedCount++;
        } catch {}
      }
    }

    return { deletedCount, foldersDeleted };
  };

  const { deletedCount: jadiDeleted, foldersDeleted: jadiFolders } = await countDeletedFiles(jadiPath, true);
  const { deletedCount: sessionDeleted, foldersDeleted: sessionFolders } = await countDeletedFiles(sessionPath);

  const totalFolders = jadiFolders + sessionFolders;

  //await conn.reply(m.chat, `*[Sessions]* ${sessionDeleted} archivos borrados\n*[JadiBots]* ${jadiDeleted} archivos borrados\n*[Carpetas eliminadas]* ${totalFolders}`, null);
  //await m.react('⚡');
};

handler.customPrefix = /😂|😁|🤣|😅|😆|😎|🤖|👾|❤️/;
handler.command = new RegExp;
export default handler;
