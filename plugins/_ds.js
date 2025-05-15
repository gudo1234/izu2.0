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
      } else if (!isSubfolder && stats.isFile() && item !== 'creds.json') {
        try {
          await fs.promises.unlink(fullPath);
          deletedCount++;
        } catch {}
      }
    }

    return { deletedCount, foldersDeleted };
  };

  // CORRECTO: tratar JadiBots como carpeta de subbots
  const { deletedCount: jadiDeleted, foldersDeleted: jadiFolders } = await countDeletedFiles(jadiPath, true);
  const { deletedCount: sessionDeleted, foldersDeleted: sessionFolders } = await countDeletedFiles(sessionPath);

  const totalFolders = jadiFolders + sessionFolders;

//  await conn.reply(m.chat, `*[Sessions]* ${sessionDeleted} archivos borrados\n*[JadiBots]* ${jadiDeleted} archivos borrados\n*[Carpetas eliminadas]* ${totalFolders}`, null);
//  await m.react('⚡');
};

handler.customPrefix = /😂|😁|🤣|😅|😆|😎|🤖|👾|❤️/;
handler.command = new RegExp;
export default handler;
