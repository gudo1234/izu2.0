import axios from 'axios';

const handler = async (m, { conn, args }) => {
    if (!args[0]) {
        await conn.reply(m.chat, `${emoji} Por favor, proporciona una descripción para generar la imagen.`, m);
        return;
    }

    const prompt = args.join(' ');
    const apiUrl = `https://eliasar-yt-api.vercel.app/api/ai/text2img?prompt=${prompt}`;

    try {

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
m.react('🕒')
await conn.sendFile(m.chat, Buffer.from(response.data), `thumbnail.mp4`, `${m.pushName}`, m, null, rcanal)
    } catch (error) {
        console.error('Error al generar la imagen:', error);
        await conn.reply(m.chat, `${msm} No se pudo generar la imagen, intenta nuevamente mas tarde.`, m);
    }
};

handler.command = ['dalle'];
handler.group = true;

export default handler;
