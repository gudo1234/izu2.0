import fetch from 'node-fetch';

let handler = async(m, { conn, text, usedPrefix, command }) => {

if (!text) return conn.reply(m.chat, `${emoji} Por favor ingresa un nombre de un repositorio GitHub.`, m);

try {
let api = `https://dark-core-api.vercel.app/api/search/github?key=api&text=${text}`;

let response = await fetch(api);
let json = await response.json();
let result = json.results[0];

let txt = `🍬 *Nombre:* ${result.name}\n👑 *Owner:* ${result.creator}\n🌟 *Estrellas:* ${result.stars}\n🔖 *Bifurcaciones:* ${result.forks}\n📜 *Descripcion:* ${result.description}\n📆 *Creado:* ${result.createdAt}\n🔗 *Link:* ${result.cloneUrl}`;

let img = 'https://files.catbox.moe/oc4myc.png';

conn.sendMessage(m.chat, { image: { url: img }, caption: txt }, { quoted: m});
conn.sendFile(m.chat, img, `thumbnail.mp4`, txt, m, null, rcanal)
 
} catch (error) {
console.error(error)
m.reply(`Error: ${error.message}`);
m.react('✖️');
 }
};

handler.command = ['githubsearch', 'gbsearch'];
handler.group = true;

export default handler;
