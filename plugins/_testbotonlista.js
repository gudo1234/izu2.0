import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { randomBytes } from 'crypto';

let handler = async (m, { conn, usedPrefix, command }) => {
let vn = './media/snow.mp3'
let taguser = '@' + m.sender.split("@s.whatsapp.net")
const { imageMessage } = await prepareWAMessageMedia({
        image: { url: 'https://files.catbox.moe/02quu5.jpg' }
    }, { upload: conn.waUploadToServer});
    const sections = [
        {
            title: "🦄𝖃𝖊𝖔𝖓 𝕭𝖔𝖙 𝖎𝖓𝖈𝖔𝖗𝖕𝖔𝖗𝖆𝖉𝖔",
            highlight_label: "𝕸𝖊𝖓𝖚 𝖉𝖊 𝕽𝖊𝖉𝖊𝖘",
            rows: [
                { header: "", title: "Comandos", description: "", id: `.s` }
            ]
        },
        {
            title: "🦄𝕾𝖊𝖗𝖛𝖎𝖈𝖎𝖔 𝖝𝖊𝖔𝖓",
            highlight_label: "𝕳𝖆𝖇𝖑𝖆𝖗 𝖈𝖔𝖓 𝖚𝖓 𝖆𝖘𝖊𝖘𝖔𝖗",
            rows: [
                { header: "", title: "𝖃𝖊𝖔𝖓 𝕭𝖚𝖌 𝕭𝖔𝖙 ᴠɪᴘ", description: "", id: `.tes hola` }
            ]
        },
        {
            title: "🌐 𝕾𝖔𝖕𝖔𝖗𝖙𝖊 24/7",
            highlight_label: "𝕾𝖔𝖕𝖔𝖗𝖙𝖊 𝖆𝖑 𝖈𝖑𝖎𝖊𝖓𝖙𝖊",
            rows: [
                { header: "", title: "𝖃𝖊𝖔𝖓 𝕭𝖚𝖌 𝕭𝖔𝖙", description: "", id: `.take xeon`}
            ]
        },
        {
            title: "𝖃𝖊𝖔𝖓 𝕭𝖚𝖌 𝕭𝖔𝖙 𝕻𝖆𝖌𝖆𝖗",
            highlight_label: "𝕻𝖆𝖌𝖆𝖗 𝖃𝖊𝖔𝖓 ᴠɪᴘ",
            rows: [
                { header: "", title: "𝖃𝖊𝖔𝖓 🦄ユニコーコード", description: "", id: `.crash` }
            ]
        }
    ];

    const buttonParamsJson = JSON.stringify({
        title: "OPCIONES",
        description: "Seleccione una opción",
        sections: sections
    });

    const interactiveMessage = {
        body: { text: 'Le compartimos nuestro menú' },
        footer: { text: 'Seleccione opción requerida para ser atendido:' },
        header: {
            hasMediaAttachment: true,
            imageMessage: imageMessage
        },
        nativeFlowMessage: {
            buttons: [{
                name: "single_select",
                buttonParamsJson: buttonParamsJson
            }]
        }
    };

    const message = {
        messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
        },
        interactiveMessage: interactiveMessage
    };
await m.reply(`¡𝐇𝐨𝐥𝐚! *${taguser}*¡ ¡🦄𝐢𝐄𝐬𝐭𝐨𝐲 𝐥𝐞𝐠𝐚𝐥𝐦𝐞𝐧𝐭𝐞 𝐞𝐪𝐮𝐢𝐯𝐨𝐜𝐚𝐝𝐨, 𝐩𝐞𝐫𝐨 é𝐭𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐞 𝐜𝐨𝐫𝐫𝐞𝐜𝐭𝐨!

 𝐏𝐫𝐞𝐬𝐞𝐧𝐭𝐚𝐦𝐨𝐬 𝐚 𝐮𝐧 𝐜𝐡𝐢𝐜𝐨 𝐝𝐞 𝐞𝐧𝐬𝐮𝐞ñ𝐨 𝐥𝐥𝐚𝐦𝐚𝐝𝐨

_𝕯𝕲𝕮𝖆𝖗𝖑𝖔𝖘_𝖃𝖊𝖔𝖓_¡`).then(async (message) => {
const emojis = ['🛰️', '🛡️', '⚙️', '🤖', '⚡', '🦾', '☠️', '💥', '🔏', '👾'];
for (let i = 0; i < emojis.length; i++) {
setTimeout(async () => {
await message.react(emojis[i]);
}, i * 2000);
}})
    await conn.relayMessage(m.chat, { viewOnceMessage: { message} }, {});
conn.sendFile(m.chat, vn, 'carro.mp3', null, null, true, { 
type: 'audioMessage', 
ptt: true }).then(async (message) => {
const emojis = ['🛰️', '🛡️', '⚙️', '🤖', '⚡', '🦾', '☠️', '💥', '🔏', '👾'];
for (let i = 0; i < emojis.length; i++) {
setTimeout(async () => {
await message.react(emojis[i]);
}, i * 2000);
}})
}

handler.command = ['test']
export default handler;

    
