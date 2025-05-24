import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {

    if (!db.data.chats[m.chat]?.nsfw && m.isGroup) {
        return m.reply(`${e} El contenido *NSFW* está desactivado en este grupo.\n> Un administrador puede activarlo con el comando » *${usedPrefix}nsfw on*`);
    }

    if (!args[0]) {
        return conn.reply(m.chat, `${e} Por favor, ingresa un tag para realizar la búsqueda.`, m);
    }

    const tag = encodeURIComponent(args.join('_'));
    const url = `https://rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}`;

    try {
        const response = await fetch(url);
        const text = await response.text();

        // A veces rule34.xxx responde con texto plano si no hay resultados o error
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            return conn.reply(m.chat, `${e} No hubo resultados para *${tag.replace(/_/g, ' ')}*`, m);
        }

        if (!Array.isArray(data) || data.length === 0) {
            return conn.reply(m.chat, `${e} No hubo resultados para *${tag.replace(/_/g, ' ')}*`, m);
        }

        const randomImage = data[Math.floor(Math.random() * data.length)];
        const imageUrl = randomImage?.file_url;

        if (!imageUrl) {
            return conn.reply(m.chat, `${e} No se encontró una imagen válida.`, m);
        }

        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: `${e} Resultados para » *${tag.replace(/_/g, ' ')}*`,
            mentions: [m.sender]
        });
    } catch (error) {
        console.error(error);
        await m.reply(`${e} Ocurrió un error al obtener los resultados.`);
    }
};

handler.command = ['r34', 'rule34'];
handler.group = true;

export default handler;
