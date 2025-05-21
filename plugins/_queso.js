let handler = async (m, { command }) => {
  if (/^(que|q|ke|kee|quee|a|aa|aaa|ah|ha|haa|ahh|🫩)$/i.test(command)) {
    let txt = `zo🧀`
    m.reply(txt)
  }
}

handler.customPrefix = /^(que|q|ke|kee|quee|a|aa|aaa|ah|ha|haa|ahh|🫩)$/i
handler.command = /^$/ // necesario para que funcione con customPrefix
handler.nonPrefix = true

export default handler
