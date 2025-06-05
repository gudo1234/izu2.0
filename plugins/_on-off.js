import fs from 'fs';
import path from 'path';

const FILE = path.join('./comandos-desactivados.json');

function loadDisabled() {
  try {
    return JSON.parse(fs.readFileSync(FILE));
  } catch {
    return [];
  }
}

function saveDisabled(data) {
  fs.writeFileSync(FILE, JSON.stringify(data));
}

let handler = async (m, { command, args, usedPrefix }) => {
  if (!args[0]) throw `⚠️ Especifica el nombre del comando que quieres ${command == 'activar' ? 'activar' : 'desactivar'}`;
  let name = args[0].toLowerCase();
  let disabled = loadDisabled();

  if (command == 'desactivar') {
    if (disabled.includes(name)) return m.reply(`❌ El comando *${name}* ya está desactivado.`);
    disabled.push(name);
    saveDisabled(disabled);
    return m.reply(`✅ El comando *${name}* ha sido desactivado globalmente.`);
  } else if (command == 'activar') {
    if (!disabled.includes(name)) return m.reply(`⚠️ El comando *${name}* no está desactivado.`);
    disabled = disabled.filter(cmd => cmd !== name);
    saveDisabled(disabled);
    return m.reply(`✅ El comando *${name}* ha sido activado globalmente.`);
  }
};

handler.command = ['activar', 'desactivar'];
handler.rowner = true;

export default handler;
