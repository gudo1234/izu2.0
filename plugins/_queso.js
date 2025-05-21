let handler = async (m, { conn}) => {
if (command == 'que', 'q', 'ke', 'kee', 'quee') {
let txt = `zo🧀`}
//m.reply(`zo🧀`)}
if (command == 'a', 'aa', 'aaa', 'ah', 'ha', 'haa', 'ahh') {
txt += `arroz`}
//}
if (command == '🫩') {
txt += `Mucha paja vro`}
//}
conn.sendMessage(m.chat, { text: txt }, { quoted: m})
}

handler.customPrefix = /^(que|q|ke|kee|quee|a|aa|aaa|ah|ha|haa|ahh|🫩)$/i
handler.command = new RegExp
export default handler
