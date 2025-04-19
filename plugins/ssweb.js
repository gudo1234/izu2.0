import fetch from 'node-fetch' 
const handler = async (m, {conn, text, args}) => {   
if (!args[0]) return conn.reply(m.chat, `${e} Ingrese la url de una página web para generar jpg`, m);
 try {
     const ss = await (await fetch(`https://image.thum.io/get/fullpage/${args[0]}`)).buffer();
        conn.sendFile(m.chat, ss, '', `${m.pushName}`, m, null, rcanal);
   } catch { 
   try {  
     const ss2 = `https://api.screenshotmachine.com/?key=c04d3a&url=${args[0]}&screenshotmachine.com&dimension=720x720`;
        await conn.sendFile(m.chat, ss2, "Thumbnail.jpg", `${m.pushName}`, m, null, rcanal)
   } catch {  
   try { 
     const ss3 =  `https://api.lolhuman.xyz/api/SSWeb?apikey=${lolkeysapi}&url=${text}`; 
        conn.sendMessage(m.chat, {image: {url: ss3}}, {quoted: m}); 
   } catch { 
     const ss4 = `https://api.lolhuman.xyz/api/SSWeb2?apikey=${lolkeysapi}&url=${text}`;
        conn.sendFile(m.chat, ss4, `thumbnail.jpg`, `${m.pushName}`, m, null, rcanal)
   }
  }
 }
}; 

handler.command = ['ssweb', 'ss']
handler.group = true;
export default handler
