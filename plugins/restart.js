let handler = async (m, { conn }) => {
    try {
        await m.react('🕒');
        await m.reply(`${e} Reiniciando El Bot...\n> Esto tomará unos segundos`);
        setTimeout(() => process.exit(0), 3000);
    } catch (error) {
    }
}

handler.command = ['restart', 'reiniciar', 'res'];
handler.rowner = true;

export default handler;
process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
