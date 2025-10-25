import fs from 'fs';

const directoryPath = `./${jadi}/`;
const sanSessionPath = `./${sessions}/`;
const tempPath = './temp/'; // Ruta de la carpeta temp

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

function cleanTempPNGs() {
  fs.readdir(tempPath, (err, files) => {
    if (err) return console.log('No se puede escanear la carpeta temp: ' + err);

    files.forEach((file) => {
      if (file.endsWith('.png')) {
        fs.unlink(`${tempPath}${file}`, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.log(`Error al eliminar PNG: ${file}: ` + err);
          }
        });
      }
    });
  });
}

const handler = async (m, { conn }) => {
  cleanSubbotDirectories();
  cleanSessionFiles();
  cleanTempPNGs();
  //m.reply('¡Sesiones y archivos .png limpiados correctamente!');
};

handler.customPrefix = /😂|😁|🤣|😅|😆|😎|🤖|👾|❤️/;
handler.command = new RegExp;

export default handler;
