export async function all(m) {
    if (!m || !m.chat || typeof m.chat !== 'string' || !m.chat.endsWith('.net')) return
    if (m.fromMe) return
    if (m.key?.remoteJid && m.key.remoteJid.endsWith('status@broadcast')) return
    
    if (!global.db.data?.chats?.[m.chat] || global.db.data.chats[m.chat].isBanned) return
    if (!global.db.data?.users?.[m.sender] || global.db.data.users[m.sender].banned) return
    if (m.isBaileys) return
    
    let msgs = global.db.data.msgs || {}
    if (!msgs || typeof msgs !== 'object' || !(m.text in msgs)) return
    
    try {
        let _m = this.serializeM(JSON.parse(JSON.stringify(msgs[m.text]), (_, v) => {
            if (v !== null && typeof v === 'object' && 'type' in v && 
                v.type === 'Buffer' && 'data' in v && Array.isArray(v.data)) {
                return Buffer.from(v.data)
            }
            return v
        }))
        
        if (_m && typeof _m.copyNForward === 'function') {
            await _m.copyNForward(m.chat, true)
        }
    } catch (e) {
        console.error('Error processing message:', e)
    }
}
