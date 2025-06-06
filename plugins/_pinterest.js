import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function sendAlbum(m, medias, caption = '', delay = 500) {
    const conn = m.conn;
    const jid = m.chat;

    const root = await baileys.generateWAMessageFromContent(jid, { conversation: '' }, {});
    await conn.relayMessage(jid, root.message, { messageId: root.key.id });

    for (let i = 0; i < medias.length; i++) {
        const media = await baileys.generateWAMessage(jid, {
            image: { url: medias[i] },
            ...(i === 0 ? { caption } : {})
        }, {
            upload: conn.waUploadToServer,
            quoted: m
        });

        media.message.image.contextInfo = {
            messageAssociation: {
                type: 1, // ALBUM
                parentMessageKey: root.key
            }
        };

        await conn.relayMessage(jid, media.message, { messageId: media.key.id });
        await wait(delay);
    }
}

const handler = async (m, { text }) => {
    if (!text) return m.reply('📌 Escribí lo que querés buscar.\nEj: .pinalbum megumin');

    const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!Array.isArray(json?.data) || json.data.length < 2)
        return m.reply('❌ No se encontraron suficientes imágenes.');

    const urls = json.data.slice(0, 10).map(img => img.image_large_url);
    const caption = `📌 Resultados para: ${text}`;
    await sendAlbum(m, urls, caption);
};

handler.command = ['pinalbum'];

export default handler;
