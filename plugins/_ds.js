import fs from 'fs';

let handler = async (m, { conn }) => {
  const jadiPath = './JadiBots/';
  const sessionPath = './Sessions/';

  const countDeletedFiles = (path, isSubfolder = false) => {
    return new Promise((resolve) => {
      let deletedCount = 0;

      fs.readdir(path, (err, items) => {
        if (err) return resolve(0);

        let pending = items.length;
        if (!pending) return resolve(0);

        items.forEach(item => {
          const fullPath = path + item + '/';

          if (isSubfolder) {
            fs.readdir(fullPath, (err, files) => {
              if (err) {
                if (!--pending) resolve(deletedCount);
                return;
              }

              let innerPending = files.length;
              if (!innerPending) {
                if (!--pending) resolve(deletedCount);
                return;
              }

              files.forEach(file => {
                if (file !== 'creds.json') {
                  fs.unlink(`${fullPath}${file}`, err => {
                    if (!err) deletedCount++;
                    if (!--innerPending && !--pending) resolve(deletedCount);
                  });
                } else {
                  if (!--innerPending && !--pending) resolve(deletedCount);
                }
              });
            });
          } else {
            if (item !== 'creds.json') {
              fs.unlink(path + item, err => {
                if (!err) deletedCount++;
                if (!--pending) resolve(deletedCount);
              });
            } else {
              if (!--pending) resolve(deletedCount);
            }
          }
        });
      });
    });
  };

  const jadiDeleted = await countDeletedFiles(jadiPath, true);
  const sessionDeleted = await countDeletedFiles(sessionPath);

  conn.reply(m.chat, `*[sessions]* ${sessionDeleted} archivos borrados\n*[JadiBot]* ${jadiDeleted} archivos borrados`, m);
m.react('⚡')
};

handler.command = ['ds'];
export default handler;
