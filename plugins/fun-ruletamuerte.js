import { delay } from '@whiskeysockets/baileys';

const salasRuleta = {};

const handler = async (m, { conn }) => {
    const chatId = m.chat;
    const senderId = m.sender;

    if (salasRuleta[chatId]) 
        return conn.reply(m.chat, '${e} Ya se encuentra una sala activa en este grupo, espera a que termine.', m);

    salasRuleta[chatId] = { jugadores: [senderId], estado: 'esperando' };

    await conn.sendMessage(m.chat, { 
        text: `${e} *Ruleta de la Muerte* ${e}\n\n@${senderId.split('@')[0]} inicio una sala de juego.\n> ${e} Para participar responde con *acepto* para entrar, Tiempo restante 60 segundos...`, 
        mentions: [senderId] 
    }, { quoted: m });

    await delay(60000);
    if (salasRuleta[chatId] && salasRuleta[chatId].estado === 'esperando') {
        delete salasRuleta[chatId];
        await conn.sendMessage(m.chat, { text: '${e} Nadie aceptó el reto, la sala ha sido cerrada.' });
    }
};

handler.command = ['ruletamuerte'];

export default handler;

    const chatId = m.chat;
    const senderId = m.sender;
    const texto = m.text?.toLowerCase();

    if (!salasRuleta[chatId]) return

    if (texto === 'acepto' || texto === 'aceptar') {
        if (salasRuleta[chatId].jugadores.length >= 2) 
            return conn.reply(m.chat, '${e} Ya se encuentran dos jugadores en esta sala.', m);

        if (senderId === salasRuleta[chatId].jugadores[0])
            return conn.reply(m.chat, '${e} No puedes aceptar tu propio reto.', m);

        salasRuleta[chatId].jugadores.push(senderId);
        salasRuleta[chatId].estado = 'completa';

        await conn.sendMessage(m.chat, { 
            audio: { url: "https://qu.ax/iwAmy.mp3" }, 
            mimetype: "audio/mp4", 
            ptt: true 
        });

        await conn.sendMessage(m.chat, { 
            text: '${e} *Ruleta de la Muerte* ${e}\n\n${e} ¡La sala está completa!\n\n> ${e} Seleccionando al perdedor...' 
        });

        const loadingMessages = [
            "${e} █▒▒▒▒▒▒▒▒▒▒▒${e}10%\n- Calculando probabilidades...",
            "${e} ████▒▒▒▒▒▒▒▒${e}30%\n- El destino está echado...",
            "${e} ███████▒▒▒▒▒${e}50%\n- La suerte está decidida...",
            "${e} ██████████▒▒${e}80%\n- ¡Pronto conoceremos al perdedor!",
            "${e} ████████████${e}100%\n- ¡Resultado final!"
        ];

        let { key } = await conn.sendMessage(m.chat, { text: "${e} ¡Calculando resultado!" }, { quoted: m });

        for (let msg of loadingMessages) {
            await delay(3000);
            await conn.sendMessage(m.chat, { text: msg, edit: key }, { quoted: m });
        }

        const [jugador1, jugador2] = salasRuleta[chatId].jugadores;
        const perdedor = Math.random() < 0.5 ? jugador1 : jugador2;

        await conn.sendMessage(m.chat, { 
            text: `${e} *Veredicto final* ${e}\n\n@${perdedor.split('@')[0]} ha sido el perdedor.\n\n> ${e} Tiene 60 segundos para tus últimas palabras...`, 
            mentions: [perdedor] 
        });

        await delay(60000);        
            await conn.groupParticipantsUpdate(m.chat, [perdedor], 'remove');
            await conn.sendMessage(m.chat, { 
                text: `${e} @${perdedor.split('@')[0]} ha sido eliminado. Fin del juego.`, 
                mentions: [perdedor] 
            });        
        delete salasRuleta[chatId];
    }

    if (texto === 'rechazar' && senderId === salasRuleta[chatId].jugadores[0]) {
        delete salasRuleta[chatId];
        await conn.sendMessage(m.chat, { text: '${e} El juego ha sido cancelado por el retador.' });
    }
};
handler.group = true;
