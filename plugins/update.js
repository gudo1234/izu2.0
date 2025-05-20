import { exec } from 'child_process';

let handler = async (m, { conn }) => {

  exec('git pull', (err, stdout, stderr) => {
    if (err) {
      //conn.reply(m.chat, `${msm} Error: No se pudo realizar la actualización.\nRazón: ${err.message}`, m);
      return;
    }

    if (stderr) {
      console.warn('Advertencia durante la actualización:', stderr);
    }

    if (stdout.includes('Already up to date.')) {
      conn.reply(m.chat, `${e} El bot ya está actualizado...`, m);
    } else {
      conn.reply(m.chat, `${stdout}`, m);
    }
  });
};

handler.command = ['update', 'actualizar', 'up'];
handler.rowner = true;

export default handler;
