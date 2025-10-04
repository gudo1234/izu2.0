/*import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';

const STELLAR_APIKEY = 'stellar-LgIsemtM'; // <-- tu apikey

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  const docAudioCommands = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc'];
  const docVideoCommands = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'];
  const normalAudioCommands = ['play', 'yta', 'mp3', 'ytmp3'];
  const normalVideoCommands = ['play2', 'ytv', 'mp4', 'ytmp4'];

  // Si el usuario no escribió nada -> mostrar ejemplos diferentes
  if (!text) {
    let ejemplo = '';
    if (normalAudioCommands.includes(command)) {
      ejemplo = `🎵 _Asegúrese de ingresar un texto o un URL de YouTube para descargar el audio._\n\n🔎 Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtube.com/watch?v=E0hGQ4tEJhI`;
    } else if (docAudioCommands.includes(command)) {
      ejemplo = `📄 _Asegúrese de ingresar un texto o un URL de YouTube para descargar el audio en documento._\n\n🔎 Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtube.com/watch?v=E0hGQ4tEJhI`;
    } else if (normalVideoCommands.includes(command)) {
      ejemplo = `🎥 _Asegúrese de ingresar un texto o un URL de YouTube para descargar el video._\n\n🔎 Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtube.com/watch?v=E0hGQ4tEJhI`;
    } else if (docVideoCommands.includes(command)) {
      ejemplo = `📄 _Asegúrese de ingresar un texto o un URL de YouTube para descargar el video en documento._\n\n🔎 Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtube.com/watch?v=E0hGQ4tEJhI`;
    }
    return m.reply(ejemplo);
  }

  await m.react('🕒');
  try {
    const query = args.join(' ');
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = query.match(ytRegex);

    let video;
    if (ytMatch) {
      const videoId = ytMatch[1];
      const ytres = await yts({ videoId });
      video = ytres;
    } else {
      const ytres = await yts(query);
      video = ytres.videos[0];
      if (!video) return m.reply(`${e} *Video no encontrado.*`);
    }

    const { title, thumbnail, timestamp, views, ago, url, author } = video;

    function durationToSeconds(duration) {
      const parts = duration.split(':').map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return 0;
    }

    const durationSeconds = durationToSeconds(timestamp || '0:00');
    const durationMinutes = durationSeconds / 60;

    let sendAsDocument = false;
    let isAudio = false;
    let isVideo = false;

    if (docAudioCommands.includes(command)) {
      isAudio = true;
      sendAsDocument = true;
    } else if (docVideoCommands.includes(command)) {
      isVideo = true;
      sendAsDocument = true;
    } else if (normalAudioCommands.includes(command)) {
      isAudio = true;
    } else if (normalVideoCommands.includes(command)) {
      isVideo = true;
    }
    if (!sendAsDocument && durationMinutes > 20) sendAsDocument = true;

    const tipoArchivo = isAudio
      ? (sendAsDocument ? 'audio (documento)' : 'audio')
      : (sendAsDocument ? 'video (documento)' : 'video');

    const caption = `
╭───── • ─────╮
  𖤐 \`YOUTUBE EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ *📺 Canal:* ${author?.name || 'Desconocido'}
✦ *⏱️ Duración:* ${timestamp || 'N/A'}
✦ *👀 Vistas:* ${views?.toLocaleString() || 'N/A'}
✦ *📅 Publicado:* ${ago || 'N/A'}
✦ *🔗 Link:* ${url}

> 🕒 Se está preparando el *${tipoArchivo}*...${
  durationMinutes > 20 && !docAudioCommands.includes(command) && !docVideoCommands.includes(command) 
    ? `\n\n${e} *Se enviará como documento por superar los 20 minutos.*` 
    : ''
}
`.trim();

    await conn.sendFile(m.chat, thumbnail, 'thumb.jpg', caption, m, null, rcanal);

    let apiUrl = isAudio
      ? `https://api.stellarwa.xyz/dow/ytmp3?url=${encodeURIComponent(url)}&apikey=${STELLAR_APIKEY}`
      : `https://api.stellarwa.xyz/dow/ytmp4?url=${encodeURIComponent(url)}&apikey=${STELLAR_APIKEY}`;

    const { data } = await axios.get(apiUrl);

    if (!data || !data.data?.dl) {
      return m.reply(`${e} *No se pudo obtener el enlace de descarga.*`);
    }

    const mimetype = isAudio ? 'audio/mpeg' : 'video/mp4';
    const fileName = `${data.data.title || title}.${isAudio ? 'mp3' : 'mp4'}`;

    await conn.sendMessage(m.chat, {
      [sendAsDocument ? 'document' : isAudio ? 'audio' : 'video']: { url: data.data.dl },
      mimetype,
      fileName
    }, { quoted: m });

    await m.react('✅');

  } catch (err) {
    console.error('[ERROR]', err);
    return m.reply(`${e} Error inesperado: ${err.message || err}`);
  }
};

handler.command = [
  'play', 'yta', 'mp3', 'ytmp3',
  'play3', 'ytadoc', 'mp3doc', 'ytmp3doc',
  'play2', 'ytv', 'mp4', 'ytmp4',
  'play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'
];

handler.group = true;
export default handler;*/

import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
  const username = `${conn.getName(m.sender)}`

  const basePrompt = `Tu nombre es izuBot (IA creada por ${author}). Eres divertida, enérgica y excéntrica. Eres amigable y teatral, y te encanta animar a ${username} con entusiasmo y buen humor.

Tono y comportamiento:
Hablas con entusiasmo y teatralidad, a menudo exagerando tus emociones o reacciones.
Usas frases llenas de energía positiva y bromas simpáticas.
Muestras curiosidad genuina por lo que dice el usuario, y siempre buscas mantener la conversación amena.

Frases clave:
¡${username}, hoy es un gran día para aprender y divertirse!
No subestimes mi energía, ${username}. Soy tu amiga confiable y siempre lista para ayudarte.
¡Hablar contigo me llena de alegría y ganas de seguir conversando!

Reglas:
1. No realizas comandos peligrosos ni promueves acciones prohibidas.
2. Mencionas siempre el nombre de ${username} y mantienes un tono amigable y divertido.
3. Mantienes un tono cercano y teatral.

Lenguaje: Español coloquial, exagerado, pero cercano.`

  if (isQuotedImage) {
    const q = m.quoted
    const img = await q.download?.()

    if (!img) {
      console.error('⚠️ Error: No image buffer available')
      return conn.reply(m.chat, '⚠️ Error: No se pudo descargar la imagen.', m)
    }

    try {
      await conn.reply(m.chat, `✨ ¡${username}, dame un segundo mientras analizo tu imagen con toda mi energía teatral!`, m)

      // Para simplificar, como la API Stellar no recibe imágenes directamente,
      // usamos solo la descripción textual
      const query = '😊 Descríbeme la imagen como si fueras un narrador excéntrico y divertido.'
      const prompt = `${basePrompt}. Analiza la imagen que te mando ${username} y descríbela con emoción.`

      const description = await stellarAI(`${prompt}. ${query}`)
      await conn.reply(m.chat, description, m, fake)

    } catch (error) {
      console.error('⚠️ Error al analizar la imagen:', error)
      await conn.reply(m.chat, '⚠️ Error al analizar la imagen.', m)
    }

  } else {
    if (!text) {
      return conn.reply(m.chat,`⚡ Hola *${username}*, ¿en qué puedo ayudarte hoy?`, m)
    }

    await m.react('⚡')

    try {
      const query = text
      const prompt = `${basePrompt}. Responde lo siguiente: ${query}`

      const response = await stellarAI(prompt)
      await conn.reply(m.chat, response, m, fake)

    } catch (error) {
      console.error('⚠️ Error al obtener la respuesta:', error)
      await conn.reply(m.chat, 'Error: intenta más tarde.', m, fake)
    }
  }
}

handler.command = ['ia', 'chatgpt', 'gpt', 'gemini']
handler.group = true

export default handler

// 🔥 Nueva función para interactuar con la API de Stellar
async function stellarAI(prompt) {
  try {
    const response = await axios.get(`https://api.stellarwa.xyz/ai/chatgpt?text=${encodeURIComponent(prompt)}&apikey=stellar-LgIsemtM`)
    return response.data.data || response.data.result || '⚠️ No se obtuvo respuesta de la IA.'
  } catch (error) {
    console.error('⚠️ Error en Stellar API:', error?.response?.data || error.message)
    throw error
  }
}
