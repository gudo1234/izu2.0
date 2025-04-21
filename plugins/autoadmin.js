let handler = async (m, { conn, isAdmin }) => {
if (m.fromMe) throw 'Nggk'
if (isAdmin) throw '${e} Ya eres admin del grupo mi creador'
await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote")}
handler.command = ['autoadmin']
handler.rowner = true
handler.botAdmin = true
export default handler
