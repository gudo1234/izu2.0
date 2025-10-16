import axios from 'axios';
let enviando = false;

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
    if (!args || !args[0]) return conn.reply(m.chat, `${emoji} Te faltó el link de una imagen/video de twitter.`, m);
    if (enviando) return; 
    enviando = true;

    try {
        const apiResponse = await axios.get(`https://delirius-apiofc.vercel.app/download/twitterdl?url=${args[0]}`);
        const res = apiResponse.data;

        const caption = res.caption ? res.caption : `${e} _Video de Twitter, "X"_`;

        if (res?.type === 'video') {
            await conn.sendFile(m.chat, res.media[0].url, 'tiktok.mp4', caption, m, null, rcanal);
        } else if (res?.type === 'image') {
            await conn.sendFile(m.chat, res.media[0].url, `image.jpg`, `${e} _Imagen de Twitter, "X"_`, m, null, rcanal);
        }

        enviando = false;
        return;

    } catch (error) {
        enviando = false;
        console.error(error);         
        conn.reply(m.chat, `${msm} Error al descargar su archivo`, m);
    }
};

handler.command = ['x', 'xdl', 'dlx', 'twdl', 'tw', 'twt', 'twitter'];
handler.group = true;

export default handler;
