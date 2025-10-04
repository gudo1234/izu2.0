import moment from 'moment-timezone';

let handler = async (m, { conn }) => {
    const now = moment().tz('America/Mexico_City');
    const year = now.year();
    const month = now.month() + 1;
    const day = now.date();
    const hour = now.format('hh:mm A');

    let txt = `📅 *Calendario* - *${day} de ${now.format('MMMM')} del ${year}* || 🕓 *Hora:* ${hour}\n\n`;
    txt += 'Dom Lun Mar Mié Jue Vie Sáb\n';

    const firstDay = moment(`${year}-${month}-01`).day();
    const daysInMonth = now.daysInMonth();

    for (let i = 0; i < firstDay; i++) {
        txt += '    ';
    }

    for (let i = 1; i <= daysInMonth; i++) {
        if (i === day) {
            txt += `[${i.toString().padStart(2, ' ')}]`;
        } else {
            txt += ` ${i.toString().padStart(2, ' ')}`;
        }
        if ((firstDay + i) % 7 === 0) {
            txt += '\n';
        }
    }

    txt += `\n\n🧭 *Hora actual:* ${hour}`;

    // 🔹 Solo agrego esta línea para evitar el error
    const imageUrl = 'https://qu.ax/afzMH.jpg'; // Puedes cambiarla por la que desees

    await conn.sendFile(m.chat, imageUrl, `thumbnail.mp4`, txt, m, null, rcanal);
};

handler.command = ['calendario'];
handler.group = true;
export default handler;
