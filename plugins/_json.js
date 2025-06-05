import fs from 'fs';

const disabledCmdFile = './comandos-desactivados.json';
let disabledCmds = [];
if (fs.existsSync(disabledCmdFile)) {
  try {
    disabledCmds = JSON.parse(fs.readFileSync(disabledCmdFile));
  } catch (e) {
    console.error('Error al leer comandos desactivados:', e);
    disabledCmds = [];
  }
}
if (disabledCmds.includes(command)) {
  return conn.reply(m.chat, `❌ El comando *${command}* está desactivado. Usa *.activar ${command}* para reactivarlo.`, m);
}
