let handler = async (m, { conn, text, command, usedPrefix }) => {
if (!text) throw `${e} *Formato incorrecto*\n*Ejemplo:*\n${command + usedPrefix} Hola`
const avatar = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');
const displayName = conn.getName(m.sender);
const username = m.sender.split('@')[0];
const replies = '69'; 
const retweets = '69'; 
const theme = 'dark'; 
const url = `https://some-random-api.com/canvas/misc/tweet?displayname=${encodeURIComponent(displayName)}&username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(avatar)}&comment=${encodeURIComponent(text)}&replies=${encodeURIComponent(replies)}&retweets=${encodeURIComponent(retweets)}&theme=${encodeURIComponent(theme)}`;
conn.sendFile(m.chat, url, 'tweet.png', '*Gracias por comentar*', m, null, rcanal);
};  

handler.command = ['tweet']
handler.group = true;
export default handler;
