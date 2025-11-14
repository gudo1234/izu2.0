/*let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await m.react('🕒')
        await m.reply(`${e} Reiniciando el bot...\n> Esto tomará unos segundos...`)
        setTimeout(() => {
            process.exit(0)
        }, 3000)
    } catch (error) {
        console.error(error)
        conn.reply(m.chat, `${error}`, m)
    }
}

handler.command = ['restart', 'reiniciar', 'res']
handler.rowner = true

export default handler

// 🕒 Reinicio automático cada 40 minutos
setInterval(() => {
    console.log('♻️ Reinicio automático cada 40 minutos...')
    process.exit(0)
}, 30 * 60 * 1000) // 40 minutos*/

/**
 * autorestart.js
 * 
 * Manejo de reinicio automático y watchdog para IzuBot
 */

import { setInterval } from 'node:timers';
let handler = async (m, { conn }) => {
    try {
        global.lastMessageTime = Date.now();
        if (m.command?.toLowerCase() === 'restart' || 
            m.command?.toLowerCase() === 'reiniciar' || 
            m.command?.toLowerCase() === 'res') {

            await m.react('🕒');
            await m.reply(`${e} Reiniciando el Bot...\n> Esto tomará unos segundos`);
            setTimeout(() => process.exit(0), 3000);
        }
    } catch (error) {
        console.log('[ERROR Handler]', error);
        await conn.reply(m.chat, `⚠️ Error interno: ${error}`, m);
    }
}

handler.command = ['restart', 'reiniciar', 'res'];
handler.rowner = true;

export default handler;

// ---------------- Watchdog Global ----------------

// Inicializamos última actividad
if (!global.lastMessageTime) global.lastMessageTime = Date.now();

// Cada minuto revisa si el bot está inactivo
setInterval(() => {
    const tiempoInactivo = Date.now() - global.lastMessageTime;
    if (tiempoInactivo > 15 * 60 * 1000) {
        console.log('[⚠️] Bot inactivo por 15 minutos, reiniciando...');
        process.exit(0);
    }
}, 60 * 1000);

// ---------------- Manejo de errores global ----------------

process.on('unhandledRejection', (reason, promise) => {
    console.log('[⚠️ Unhandled Rejection]', reason);
});

process.on('uncaughtException', (err) => {
    console.log('[⚠️ Uncaught Exception]', err);
});

process.on('SIGINT', () => {
    console.log('[🛑] Bot detenido con CTRL+C');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('[🛑] Bot detenido por SIGTERM');
    process.exit(0);
});
