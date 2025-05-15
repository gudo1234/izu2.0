import fs from 'fs';

const directoryPath = `./${jadi}/`;
const sanSessionPath = `./${sessions}/`;

function cleanSubbotDirectories() {
  fs.readdir(directoryPath, (err, subbotDirs) => {
    if (err) return console.log('No se puede escanear el directorio: ' + err);

    subbotDirs.forEach((subbotDir) => {
      const subbotPath = `${directoryPath}${subbotDir}/`;

      fs.readdir(subbotPath, (err, files) => {
        if (err) return console.log('No se puede escanear el directorio: ' + err);

        files.forEach((file) => {
          if (file !== 'creds.json') {
            fs.unlink(`${subbotPath}${file}`, (err) => {
              if (err && err.code !== 'ENOENT') {
                console.log(`Error al eliminar JadiBot: ${file}: ` + err);
              }
            });
          }
        });
      });
    });
  });
}

function cleanSessionFiles() {
  fs.readdir(sanSessionPath, (err, files) => {
    if (err) return console.log('No se puede escanear el directorio: ' + err);

    files.forEach((file) => {
      if (file !== 'creds.json') {
        fs.unlink(`${sanSessionPath}${file}`, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.log(`Error al eliminar Session: ${file}: ` + err);
          }
        });
      }
    });
  });
}

const handler = async (m, { conn }) => {
  cleanSubbotDirectories();
  cleanSessionFiles();
  //m.reply('¡Sesiones limpiadas correctamente!');
};

handler.customPrefix = /😂|😁|🤣|😅|😆|😎|🤖|👾|❤️/;
handler.command = new RegExp;

export default handler;
