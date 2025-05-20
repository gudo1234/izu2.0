import { exec } from 'child_process';

let handler = async (m, { conn }) => {
  // Ignorar cambios locales en ese archivo antes de actualizar
  exec('git update-index --assume-unchanged plugins/jadibot-serbot.js', (err, stdout, stderr) => {
    if (err) {
      //conn.reply(m.chat, `Error al ignorar cambios locales: ${err.message}`, m);
      return;
    }

    // Hacer pull sin que se interrumpa por ese archivo
    exec('git pull', (err2, stdout2, stderr2) => {
      if (err2) {
        //conn.reply(m.chat, `Error al actualizar: ${err2.message}`, m);
        return;
      }

      if (stderr2) console.warn('Advertencia durante la actualización:', stderr2);

      if (stdout2.includes('Already up to date.')) {
        conn.reply(m.chat, 'El bot ya está actualizado...', m);
      } else {
        conn.reply(m.chat, `✅ ${stdout2}`, m);
      }

      // (Opcional) Dejar de ignorar el archivo después si quieres:
      exec('git update-index --no-assume-unchanged plugins/jadibot-serbot.js', (err3) => {
        if (err3) {
          conn.reply(m.chat, `Actualizado, pero hubo un error al restaurar el seguimiento del archivo:\n${err3.message}`, m);
        }
      });
    });
  });
};

handler.command = ['update', 'actualizar', 'up'];
handler.rowner = true;

export default handler;
