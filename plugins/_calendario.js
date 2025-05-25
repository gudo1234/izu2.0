import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';

let handler = async (m, { conn }) => {
  try {
    const tz = 'America/Argentina/Buenos_Aires';
    const today = moment().tz(tz);
    const month = today.format('MMMM');
    const year = today.format('YYYY');
    const currentDay = today.date();
    const startOfMonth = today.clone().startOf('month');
    const daysInMonth = today.daysInMonth();
    const startDay = startOfMonth.day();

    const width = 700;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fondo
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Título
    ctx.fillStyle = '#333';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`, width / 2, 50);

    // Días de la semana
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    ctx.font = 'bold 20px sans-serif';
    days.forEach((d, i) => {
      ctx.fillText(d, 100 + i * 80, 100);
    });

    // Días del mes
    ctx.font = '20px sans-serif';
    let x = 100 + startDay * 80;
    let y = 140;
    for (let i = 1; i <= daysInMonth; i++) {
      if ((i + startDay - 1) % 7 === 0 && i !== 1) {
        y += 50;
        x = 100;
      }

      if (i === currentDay) {
        ctx.fillStyle = '#ff5252';
        ctx.beginPath();
        ctx.arc(x - 10, y - 15, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
      } else {
        ctx.fillStyle = '#000';
      }

      ctx.fillText(i.toString(), x, y);
      x += 80;
    }

    // Guardar en archivo temporal
    const file = path.join('./tmp', `calendario-${Date.now()}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(file, buffer);

    try {
      await conn.sendMessage(m.chat, {
        image: fs.readFileSync(file),
        caption: `🗓 Calendario de ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`
      }, { quoted: m });
    } finally {
      fs.unlinkSync(file);
    }

  } catch (e) {
    await m.reply(`❌ Error al generar el calendario:\n${e.message}`);
  }
};

handler.command = ['calendario'];
export default handler;
