import moment from 'moment-timezone';
import fetch from 'node-fetch';
import { createCanvas, loadImage } from 'canvas';

let handler = async (m, { conn }) => {
  // configuración de zona y idioma
  moment.locale('es');
  const now = moment().tz('America/Mexico_City');
  const year = now.year();
  const month = now.month() + 1;
  const day = now.date();
  const hour = now.format('hh:mm A');

  // texto que enviarás como caption (puedes dejarlo o vaciarlo)
  let txt = `📅 *Calendario* - *${day} de ${now.format('MMMM')} del ${year}* || 🕓 *Hora:* ${hour}\n\n`;

  // URL de la imagen que nos diste
  const imageUrl = 'https://qu.ax/afzMH.jpg';

  // descarga la imagen
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error('No se pudo bajar la imagen de fondo.');
  const arrayBuffer = await res.arrayBuffer();
  const bgBuffer = Buffer.from(arrayBuffer);

  // carga la imagen con canvas
  const bg = await loadImage(bgBuffer);

  // crea canvas con el tamaño de la imagen (mantiene proporciones)
  const width = bg.width;
  const height = bg.height;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // dibuja la imagen de fondo
  ctx.drawImage(bg, 0, 0, width, height);

  // parámetros del panel del calendario (ajústalos si quieres)
  const panelWidth = Math.round(width * 0.86);
  const panelHeight = Math.round(height * 0.42);
  const panelX = Math.round((width - panelWidth) / 2);
  const panelY = Math.round(height * 0.48); // posicion vertical (ajusta)
  const radius = 18;

  // dibuja panel semi-transparente
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; // semitransparente
  roundRect(ctx, panelX, panelY, panelWidth, panelHeight, radius, true, false);

  // estilo texto
  const padding = 26;
  ctx.textBaseline = 'top';

  // titulo (fecha + hora)
  ctx.fillStyle = '#ffffff';
  const titleFont = Math.round(panelWidth * 0.04) + 'px Sans';
  ctx.font = `bold ${titleFont}`;
  const title = `Calendario - ${day} de ${now.format('MMMM')} del ${year}  |  Hora: ${hour}`;
  ctx.fillText(title, panelX + padding, panelY + padding);

  // fila de abreviaturas
  const labels = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const labelFont = Math.round(panelWidth * 0.028) + 'px Sans';
  ctx.font = `600 ${labelFont}`;
  const labelsY = panelY + padding + Math.round(panelHeight * 0.08);
  const gridX = panelX + padding;
  const gridWidth = panelWidth - padding * 2;
  const cellGap = Math.round(gridWidth * 0.01);
  const cellWidth = Math.floor((gridWidth - cellGap * 6) / 7);
  const cellHeight = Math.round(panelHeight * 0.11);

  // dibuja etiquetas dias
  for (let i = 0; i < 7; i++) {
    const lx = gridX + i * (cellWidth + cellGap);
    ctx.fillStyle = '#cfe7ff';
    ctx.fillText(labels[i], lx + Math.round(cellWidth*0.12), labelsY);
  }

  // datos del mes
  const firstDay = moment(`${year}-${String(month).padStart(2,'0')}-01`).day(); // 0..6 (Dom..Sab)
  const daysInMonth = now.daysInMonth();

  // fuente para números
  const numFont = Math.round(panelWidth * 0.032) + 'px Sans';
  ctx.font = `600 ${numFont}`;

  // dibujo de las celdas y números
  const startY = labelsY + Math.round(cellHeight * 0.9);
  let cursor = 0;
  for (let weekRow = 0; weekRow < 6; weekRow++) {
    for (let col = 0; col < 7; col++) {
      const idx = weekRow * 7 + col;
      const x = gridX + col * (cellWidth + cellGap);
      const y = startY + weekRow * (cellHeight + Math.round(cellHeight*0.25));

      const dayNumber = idx - firstDay + 1;
      if (idx < firstDay || dayNumber > daysInMonth) {
        // celdas vacías, no dibujar número
        continue;
      }

      // resaltar día actual
      if (dayNumber === day) {
        // fondo marcado (círculo)
        const cx = x + Math.round(cellWidth * 0.5);
        const cy = y + Math.round(cellHeight * 0.42);
        const r = Math.min(cellWidth, cellHeight) * 0.45;
        ctx.beginPath();
        ctx.fillStyle = '#2ecc71'; // color de marcado (verde)
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        // número en blanco encima
        ctx.fillStyle = '#ffffff';
        const txtX = cx - ctx.measureText(String(dayNumber)).width / 2;
        const txtY = cy - parseInt(numFont) / 2 + 3;
        ctx.fillText(String(dayNumber), txtX, txtY);
      } else {
        // número normal
        ctx.fillStyle = '#e6f2ff';
        const nx = x + Math.round(cellWidth * 0.12);
        const ny = y + Math.round(cellHeight * 0.08);
        ctx.fillText(String(dayNumber), nx, ny);
      }
      cursor++;
    }
  }

  // pie: Hora actual
  const footY = panelY + panelHeight - padding - Math.round(panelHeight * 0.06);
  const footFont = Math.round(panelWidth * 0.03) + 'px Sans';
  ctx.font = `500 ${footFont}`;
  ctx.fillStyle = '#ffd780';
  ctx.fillText(`Hora actual: ${hour}`, panelX + padding, footY);

  // convierte canvas a buffer y lo envía por WA
  const outBuffer = canvas.toBuffer('image/jpeg', { quality: 0.92 });
  // usamos la caption que ya tenías
  await conn.sendFile(m.chat, outBuffer, 'calendario.jpg', txt, m, null, rcanal);
};

handler.command = ['calendario'];
handler.group = true;
export default handler;

/**
 * helper: dibuja un rectángulo con bordes redondeados
 */
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof r === 'undefined') r = 5;
  if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
