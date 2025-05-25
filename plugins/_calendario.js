/*import { createCanvas } from 'canvas';
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

    const width = 800;
    const height = 700;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Estilos disponibles
    const styles = [
      estiloDegradado,
      estiloOscuroNeon,
      estiloPastel,
      estiloGalaxia,
      estiloRetro
    ];

    // Elegir uno aleatoriamente
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];

    // Dibujar estilo
    await randomStyle(ctx, width, height, month, year, daysInMonth, startDay, currentDay);

    const file = path.join('./tmp', `calendario-${Date.now()}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(file, buffer);

    try {
      await conn.sendFile(m.chat, fs.readFileSync(file), "Thumbnail.jpg", `🗓 *Calendario de ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}*`, m, null, rcanal)
    } finally {
      fs.unlinkSync(file);
    }

  } catch (e) {
    await m.reply(`❌ Error al generar el calendario:\n${e.message}`);
  }
};

handler.command = ['calendario'];
export default handler;

// === ESTILOS ===

function estiloDegradado(ctx, width, height, month, year, daysInMonth, startDay, currentDay) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#4facfe');
  gradient.addColorStop(1, '#00f2fe');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  renderCalendarioBase(ctx, width, month, year, daysInMonth, startDay, currentDay);
}

function estiloOscuroNeon(ctx, width, height, month, year, daysInMonth, startDay, currentDay) {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, width, height);

  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#0ff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${month.toUpperCase()} ${year}`, width / 2, 70);
  ctx.shadowBlur = 0;

  renderCalendarioBase(ctx, width, month, year, daysInMonth, startDay, currentDay, '#0ff', '#333', '#fff');
}

function estiloPastel(ctx, width, height, month, year, daysInMonth, startDay, currentDay) {
  ctx.fillStyle = '#ffe0f0';
  ctx.fillRect(0, 0, width, height);

  renderCalendarioBase(ctx, width, month, year, daysInMonth, startDay, currentDay, '#ff69b4', '#333', '#fff', '#ffb6c1');
}

function estiloGalaxia(ctx, width, height, month, year, daysInMonth, startDay, currentDay) {
  ctx.fillStyle = '#0b0033';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 2 + 1;
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
    ctx.fill();
  }

  renderCalendarioBase(ctx, width, month, year, daysInMonth, startDay, currentDay, '#ffffff', '#ccc', '#222', '#ffffff55');
}

function estiloRetro(ctx, width, height, month, year, daysInMonth, startDay, currentDay) {
  ctx.fillStyle = '#fef5c4';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#000';
  for (let i = 0; i < height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  renderCalendarioBase(ctx, width, month, year, daysInMonth, startDay, currentDay, '#333', '#000', '#fff', '#fff99f');
}

// === FUNCIÓN BASE PARA RENDER CALENDARIO ===
function renderCalendarioBase(ctx, width, month, year, daysInMonth, startDay, currentDay, titleColor = '#fff', dayBoxColor = '#fff', textColor = '#000', highlightColor = '#ff4081') {
  ctx.fillStyle = titleColor;
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`, width / 2, 70);

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  ctx.font = 'bold 22px sans-serif';
  days.forEach((d, i) => {
    ctx.fillStyle = dayBoxColor;
    ctx.fillRect(80 + i * 90, 100, 70, 40);
    ctx.fillStyle = textColor;
    ctx.fillText(d, 115 + i * 90, 130);
  });

  ctx.font = '22px sans-serif';
  let x = 80 + startDay * 90;
  let y = 160;

  for (let i = 1; i <= daysInMonth; i++) {
    if ((i + startDay - 1) % 7 === 0 && i !== 1) {
      y += 60;
      x = 80;
    }

    if (i === currentDay) {
      ctx.beginPath();
      ctx.arc(x + 35, y + 25, 28, 0, Math.PI * 2);
      ctx.fillStyle = highlightColor;
      ctx.shadowColor = highlightColor;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = dayBoxColor;
      ctx.fillRect(x, y, 70, 50);
      ctx.fillStyle = textColor;
    }

    ctx.textAlign = 'center';
    ctx.fillText(i.toString(), x + 35, y + 35);
    x += 90;
  }
}*/

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import axios from 'axios';
import PhoneNum from 'awesome-phonenumber';

const banderaEmoji = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = [...countryCode.toUpperCase()].map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
};

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

const handler = async (m, { conn }) => {
  try {
    const number = m.sender.split('@')[0];
    const phoneInfo = PhoneNum('+' + number);
    const countryCode = phoneInfo.getRegionCode('international');
    const country = regionNames.of(countryCode) || 'Desconocido';
    const flag = banderaEmoji(countryCode);

    const tz = 'America/Argentina/Buenos_Aires';
    const today = moment().tz(tz);
    const month = today.format('MMMM');
    const year = today.format('YYYY');
    const currentDay = today.date();
    const startOfMonth = today.clone().startOf('month');
    const daysInMonth = today.daysInMonth();
    const startDay = startOfMonth.day();

    const width = 800;
    const height = 700;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // === ESTILOS DEFINIDOS AQUÍ ===

    function estiloDegradado(ctx, width, height) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#4facfe');
      gradient.addColorStop(1, '#00f2fe');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    function estiloOscuroNeon(ctx, width, height) {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, width, height);
    }

    function estiloPastel(ctx, width, height) {
      ctx.fillStyle = '#ffe0f0';
      ctx.fillRect(0, 0, width, height);
    }

    function estiloGalaxia(ctx, width, height) {
      ctx.fillStyle = '#0b0033';
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 100; i++) {
        ctx.beginPath();
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 2 + 1;
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
        ctx.fill();
      }
    }

    function estiloRetro(ctx, width, height) {
      ctx.fillStyle = '#fef5c4';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#000';
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
    }

    const styles = [
      estiloDegradado,
      estiloOscuroNeon,
      estiloPastel,
      estiloGalaxia,
      estiloRetro
    ];

    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    randomStyle(ctx, width, height);

    renderCalendarioBase(ctx, width, month, year, daysInMonth, startDay, currentDay);

    // Mostrar país y bandera
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`País: ${country} ${flag}`, 40, height - 40);

    const file = path.join('./tmp', `calendario-${Date.now()}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(file, buffer);

    try {
      await conn.sendFile(m.chat, fs.readFileSync(file), "calendario.jpg", `🗓 *Calendario de ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}*`, m);
    } finally {
      fs.unlinkSync(file);
    }

  } catch (e) {
    await m.reply(`❌ Error al generar el calendario:\n${e.message}`);
  }
};

handler.command = ['calendario'];
export default handler;

// === FUNCIÓN BASE PARA RENDER CALENDARIO ===
function renderCalendarioBase(ctx, width, month, year, daysInMonth, startDay, currentDay) {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`, width / 2, 70);

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  ctx.font = 'bold 22px sans-serif';
  days.forEach((d, i) => {
    ctx.fillStyle = '#ffffff99';
    ctx.fillRect(80 + i * 90, 100, 70, 40);
    ctx.fillStyle = '#000';
    ctx.fillText(d, 115 + i * 90, 130);
  });

  ctx.font = '22px sans-serif';
  let x = 80 + startDay * 90;
  let y = 160;

  for (let i = 1; i <= daysInMonth; i++) {
    if ((i + startDay - 1) % 7 === 0 && i !== 1) {
      y += 60;
      x = 80;
    }

    if (i === currentDay) {
      ctx.beginPath();
      ctx.arc(x + 35, y + 25, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#ff4081';
      ctx.shadowColor = '#ff4081';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = '#ffffffaa';
      ctx.fillRect(x, y, 70, 50);
      ctx.fillStyle = '#000';
    }

    ctx.textAlign = 'center';
    ctx.fillText(i.toString(), x + 35, y + 35);
    x += 90;
  }
}
