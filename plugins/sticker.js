import sharp from 'sharp';
import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import { webp2png } from '../lib/webp2mp4.js';
import { spawn } from 'child_process';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const shapeFlags = {
    // Básicas
    '-c': 'circle', '-t': 'triangle', '-d': 'diamond', '-h': 'hexagon', '-p': 'pentagon',
    // Decorativas
    '-a': 'heart', '-b': 'blob', '-l': 'leaf', '-n': 'moon', '-s': 'star', '-z': 'zap',
    // Especiales
    '-r': 'curve', '-e': 'edges', '-m': 'mirror', '-f': 'arrow', '-x': 'attach', '-i': 'expand'
  };
  const selectedFlag = args.find(arg => Object.keys(shapeFlags).includes(arg));
  const selectedShape = shapeFlags[selectedFlag] || null;

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || '';
  let img;

  if (/webp|image|video|gif/g.test(mime)) {
    if (/video/g.test(mime) && (q.msg || q).seconds > 8)
      return m.reply('¡El video no puede durar más de 8 segundos!');
    img = await q.download?.();
  } else if (args[0] && isUrl(args[0])) {
    img = await fetch(args[0]).then(res => res.buffer());
    mime = 'image/url';
    //let im = await (await fetch(`https://files.catbox.moe/nir33y.jpg`)).buffer()
  } else {
    /*return conn.reply(m.chat,*/
let txt = `${e} Responde a una imágen o video/gif para generar un sticker y agrega una de las siguientes opciones:

┌───────────
│ 🖼 *Requiere:* Imagen o video corto
│ 🧪 *Tipo:* Sticker personalizado
│ ⚙ \`Formas disponibles:\`
│  ● *Básicas:*
│ ├─ -c ⟶ Circular
│ ├─ -t ⟶ Triangular
│ ├─ -d ⟶ Diamante
│ ├─ -h ⟶ Hexágono
│ └─ -p ⟶ Pentágono
│  ● *Decorativas:*
│ ├─ -a ⟶ Corazón
│ ├─ -b ⟶ Burbuja
│ ├─ -l ⟶ Hoja
│ ├─ -n ⟶ Luna
│ ├─ -s ⟶ Estrella
│ └─ -z ⟶ Rayo
│  ● *Especiales:*
│ ├─ -r ⟶ Curvado (arco)
│ ├─ -e ⟶ Esquinas redondeadas
│ ├─ -m ⟶ Espejo
│ ├─ -f ⟶ Flecha
│ ├─ -x ⟶ Acoplado
│ └─ -i ⟶ Ampliado
└───────────

◈ Usa \`${usedPrefix + command} -a\` respondiendo a una imagen o video.`;
  await conn.sendFile(m.chat, `https://files.catbox.moe/nir33y.jpg`, "Thumbnail.jpg", txt, m, null, rcanal)
  }

  m.react('🧩');
  let stiker = false;

  try {
    if (selectedShape && /image|webp|url|video|gif/.test(mime)) {
      let frameBuffer = img;

      if (/video|gif/.test(mime)) {
        const ffmpeg = spawn('ffmpeg', [
          '-i', 'pipe:0',
          '-vframes', '1',
          '-f', 'image2',
          '-'
        ]);

        ffmpeg.stdin.write(img);
        ffmpeg.stdin.end();

        frameBuffer = await new Promise((resolve, reject) => {
          const chunks = [];
          ffmpeg.stdout.on('data', chunk => chunks.push(chunk));
          ffmpeg.stderr.on('data', () => {}); // ignorar logs de error
          ffmpeg.on('close', () => resolve(Buffer.concat(chunks)));
          ffmpeg.on('error', reject);
        });
      }

      const masked = await applyShapeMask(frameBuffer, selectedShape, 500);
      const stickerBuffer = await sharp(masked)
        .ensureAlpha()
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp()
        .toBuffer();

      return await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
    }

    try {
      stiker = await sticker(img, false, `${m.pushName}`);
    } catch (e) {
      let out;
      if (/webp/.test(mime)) out = await webp2png(img);
      else if (/image|url/.test(mime)) out = await uploadImage(img);
      else if (/video/.test(mime)) out = await uploadFile(img);
      if (typeof out !== 'string') out = await uploadImage(img);
      stiker = await sticker(false, out, `${m.pushName}`);
    }

    if (stiker) {
      return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true);
    }

  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, `${e} Por favor, envía una imagen o video para hacer un sticker.`, m);
  }
};

handler.group = true;
handler.command = ['s', 'sticker', 'stiker'];
export default handler;

// Funciones auxiliares

async function applyShapeMask(imageBuffer, shape = 'circle', size = 500) {
  const svgMask = getSVGMask(shape, size);
  const maskedImage = await sharp(imageBuffer)
    .ensureAlpha()
    .resize(size, size, { fit: sharp.fit.fill })
    .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
    .png()
    .toBuffer();
  return maskedImage;
}

function getSVGMask(shape, size) {
  const half = size / 2;
  const quarter = size / 4;
  const threeQuarter = 3 * quarter;
  const radius = size * 0.15;

  switch (shape) {
    case 'circle':
      return `<svg width="${size}" height="${size}"><circle cx="${half}" cy="${half}" r="${half}" fill="black"/></svg>`;
    case 'triangle':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${size} 0,${size}" fill="black"/></svg>`;
    case 'diamond':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${half} ${half},${size} 0,${half}" fill="black"/></svg>`;
    case 'hexagon':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${quarter} ${size},${threeQuarter} ${half},${size} 0,${threeQuarter} 0,${quarter}" fill="black"/></svg>`;
    case 'pentagon':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${quarter} ${(3 * quarter)},${size} ${quarter},${size} 0,${quarter}" fill="black"/></svg>`;
    case 'heart':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 29.6"><path d="M23.6,0c-2.7,0-5.1,1.3-6.6,3.3C15.5,1.3,13.1,0,10.4,0C4.7,0,0,4.7,0,10.4c0,6,6.2,10.9,15.7,18.5L16,29.6l0.3-0.3 C25.8,21.3,32,16.4,32,10.4C32,4.7,27.3,0,21.6,0H23.6z" fill="black"/></svg>`;
    case 'blob':
      return `<svg width="${size}" height="${size}"><path d="M150 0 C250 50, 250 150, 150 200 C50 250, 0 150, 50 50 Z" fill="black" transform="scale(${size/300})"/></svg>`;
    case 'leaf':
      return `<svg width="${size}" height="${size}"><path d="M${half},0 C${size},${quarter},${quarter},${size} 0,${size} C0,${half} 0,${quarter} ${half},0 Z" fill="black"/></svg>`;
    case 'moon':
      return `<svg width="${size}" height="${size}"><path d="M${half},0 A${half},${half} 0 1,0 ${half},${size} A${size*0.6},${half} 0 1,1 ${half},0 Z" fill="black"/></svg>`;
    case 'star':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${half + 15},${half - 10} ${size},${half} ${half + 15},${half + 10} ${half},${size} ${half - 15},${half + 10} 0,${half} ${half - 15},${half - 10}" fill="black"/></svg>`;
    case 'zap':
      return `<svg width="${size}" height="${size}"><polygon points="${half - 20},${half} ${half + 10},${half} ${half - 10},${size} ${half + 30},${half} ${half},${half} ${half + 10},0" fill="black"/></svg>`;
    case 'curve':
      return `<svg width="${size}" height="${size}"><path d="M0,${size} Q${half},0 ${size},${size} Z" fill="black"/></svg>`;
    case 'edges':
      return `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="black"/></svg>`;
    case 'mirror':
      return `<svg width="${size}" height="${size}"><rect width="${half}" height="${size}" x="0" fill="black"/></svg>`;
    case 'arrow':
      return `<svg width="${size}" height="${size}"><polygon points="0,${half - 50} ${half},${half - 50} ${half},0 ${size},${half} ${half},${size} ${half},${half + 50} 0,${half + 50}" fill="black"/></svg>`;
    case 'attach':
    case 'expand':
      return `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="black"/></svg>`;
    default:
      throw new Error(`Forma no soportada: ${shape}`);
  }
}

function isUrl(text) {
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|mp4)$/i.test(text);
}
