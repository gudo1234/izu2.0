import { 
  downloadTrack2,
} from "@nechlophomeriaa/spotifydl"
import fetch from 'node-fetch';
import axios from "axios"

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
if (!text) return conn.reply(m.chat, `${emoji} Por favor proporciona el nombre de una canción o artista.`, m)
  try{
    await m.react('🕒')
    let downTrack = await downloadTrack2(`${text}`)
    let urlspo=await spotifydl(downTrack.url)
    if (!urlspo.status) return await m.react('❌')
    urlspo=urlspo.download
    const videoUrls = [
  'https://files.catbox.moe/rdyj5q.mp4',
  'https://files.catbox.moe/693ws4.mp4'
]
const jpg = videoUrls[Math.floor(Math.random() * videoUrls.length)];
    let txt = `╭───── • ─────╮
  𖤐 \`SPOTIFY EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ *Artista*: ${downTrack.artists}
✦ *Título:* ${downTrack.title}
✦ *Duración:* ${downTrack.duration}

╭───── • ─────╮
> 🔊 Enviando audio...
╰───── • ─────╯`
const imBuffer = await getBuffer(downTrack.imageUrl);

const formatos = [
  async () => conn.sendMessage(m.chat, {
  text: txt,
  contextInfo: {
    externalAdReply: {
      title: wm,
      body: textbot,
      thumbnailUrl: redes,
      thumbnail: imBuffer,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: true
    }
  }
}, { quoted: m }),

  async () => conn.sendMessage(
    m.chat,
    {
      video: { url: jpg },
      gifPlayback: true,
      caption: txt,
      contextInfo: {
        forwardingScore: 0,
        isForwarded: true,
        externalAdReply: {
          title: wm,
          body: textbot,
          thumbnailUrl: redes,
          thumbnail: imBuffer,
          sourceUrl: redes,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    },
    { quoted: m }
  ),

  async () => conn.sendMessage(m.chat, {
      text: txt,
      contextInfo: {
          mentionedJid: [],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
              newsletterJid: channelRD.id,
              newsletterName: channelRD.name,
              serverMessageId: -1,
          },
          forwardingScore: false,
          externalAdReply: {
              title: wm,
              body: textbot,
              thumbnailUrl: redes,
              thumbnail: imBuffer,
              sourceUrl: redes,
              mediaType: 1,
              showAdAttribution: true,
              renderLargerThumbnail: true,
          },
      },
  }, { quoted: m })
];

const randomFormato = formatos[Math.floor(Math.random() * formatos.length)];
await randomFormato();

    await conn.sendMessage(m.chat, {audio: {url: urlspo}, fileName: `${downTrack.title}.mp3`, mimetype: 'audio/mpeg'}, {quoted: m});
    return await m.react('✅')
    }
  catch
  {
    return await m.react('❌')
  }
}

handler.command = ['spotify']
handler.group = true;
export default handler

async function spotifydl(url) {
  try {
    let maxIntentos = 10
    let intentos = 0;
    let statusOk = 0;
    let res;
    while (statusOk!==3 && statusOk!==-3 && intentos < maxIntentos) {
      try 
      {
          var { data } = await axios.get('https://api.fabdl.com/spotify/get?url=' + url, {
          headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          referer: "https://spotifydownload.org/",
          }});
          const datax = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${data.result.gid}/${data.result.id}`, {
          headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          referer: "https://spotifydownload.org/",
          }});
          res=datax.data
          statusOk=res.result.status
          intentos++;
          if (statusOk!==3 && statusOk!==-3) await new Promise(resolve => setTimeout(resolve, 3000));
      } 
      catch (error) {
        return {
          status: false,
          message:"Error inesperado.",
          code: 500,
          creator:"Enigma Team"
        };
      }
    }
    if(statusOk!==3) return {
      status: false,
      message:"Error inesperado.",
      code: 500,
      creator:"Enigma Team"
    };
    
    return({
    status: true,
    title: data.result.name,
    duration: data.result.duration_ms,
    cover: data.result.image,
    download: "https://api.fabdl.com" + res.result.download_url,
    creator:"Enigma Team"
    })
  } 
  catch (e) {
  return {
    status: false,
    message:"Error inesperado.",
    code: 500,
    creator:"Enigma Team"
  }}
           }
