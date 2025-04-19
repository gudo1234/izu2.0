// Code by Xnuvers007 ft. Jikarinka
// https://github.com/Xnuvers007/
// 
// Mejorado por @BrunoSobrino
////////////////////////////////////

import axios from 'axios';
import cheerio from 'cheerio';
let handler = async (m, { conn, text: tiktok, args, command, usedPrefix, text}) => {      
if (!text) return conn.reply(m.chat, `${e} Ejemplo: https://vm.tiktok.com/ZM6obVE7h/`, m)
  conn.sendMessage(m.chat, { text: global.espere + `*${m.pushName}*`, contextInfo: { externalAdReply: {title: `${wm}`, body: `${await conn.getName(m.chat)}`, thumbnailUrl: img.getRandom(), thumbnail: img.getRandom(), showAdAttribution: true, sourceUrl: canal}}} , { quoted: fkontak })
let imagesSent
if (imagesSent) return;
imagesSent = true    
try {   
let tioShadow = await ttimg(tiktok); 
let result = tioShadow?.data;
for (let d of result) {

  await conn.sendMessage(m.chat, {image: {url: d}}, {quoted: m});
 };
imagesSent = false
} catch {
    imagesSent = false    
    throw '*[❗] No se obtuvo respuesta de la página, intente más tarde.*'
 }
};
handler.command = ['ttimg', 'tiktokimg']
handler.group = true;
export default handler;

async function ttimg(link) {
    try {    
        let url = `https://dlpanda.com/es?url=${link}&token=G7eRpMaa`;    
        let response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        let imgSrc = [];
        $('div.col-md-12 > img').each((index, element) => {
            imgSrc.push($(element).attr('src'));
        });
        if (imgSrc.length === 0) {
            return { data: '> •No se encontraron imágenes en el enlace proporcionado.' };
        }
        return { data: imgSrc }; 
    } catch (error) {
        console.lo (error);
        return { data: '> •No se obtuvo respuesta de la página, intente más tarde.'};
    };
};
