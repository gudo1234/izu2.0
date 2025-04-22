import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        if (!args[0]) {
            return m.reply(`${e} Ingresa el texto para el sticker.\n\nEjemplo: *${usedPrefix + command} hola*`);
        }

        const text = encodeURIComponent(args.join(" "));
        const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${text}`;

        await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });
        await conn.sendFile(m.chat, apiUrl, 'sticker.webp', '',m, true, { contextInfo: { 'forwardingScore': 200, 'isForwarded': false, externalAdReply:{ showAdAttribution: false, title: `${m.pushName}`, body: textbot, mediaType: 2, sourceUrl: redes, thumbnailUrl: icono}}}, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error(err);
        m.reply(`❌ Ocurrió un error al generar el sticker.`);
    }
};

handler.command = ['brat']
handler.group = true;
export default handler;
