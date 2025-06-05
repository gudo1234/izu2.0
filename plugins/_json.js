import fs from 'fs';
const disabledCmdFile = './comandos-desactivados.json';
let disabledCmds = [];
if (fs.existsSync(disabledCmdFile)) {
  disabledCmds = JSON.parse(fs.readFileSync(disabledCmdFile));
}
if (disabledCmds.includes(command)) {
  return conn.reply(m.chat, `❌ El comando *${command}* está desactivado. Usa *.activar ${command}* para reactivarlo.`, m);
}
