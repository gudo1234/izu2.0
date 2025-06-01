let handler = async (m, { conn }) => {
  const start = performance.now();
  const end = performance.now();

  const ping = Math.round(end - start);
  const uptime = formatUptime(process.uptime());

  const respuesta = `
🔔 *Pong!*
📡 *Velocidad:* ${ping} ms
⏱️ *Tiempo activo:* ${uptime}
`.trim();

  m.reply(respuesta);
};

handler.command = ['ping', 'speed', 'velocidad'];
export default handler;
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}
