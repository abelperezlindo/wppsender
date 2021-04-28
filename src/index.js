const { Client } = require('whatsapp-web.js');
const chalk = require("chalk");
const qrcode = require('qrcode-terminal');

const client = new Client();

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('Escanee el código qr:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log(`${chalk.green('⚡ Client is ready!')}`);
    //console.log('Client is ready!');
});

client.on('auth_failure', () => {
    console.log(`${chalk.red('Error de autentificacion vuelve a generar el QRCODE ')}`);
})

client.on('message', async msg => {
    console.log(`${chalk.green.yellow('Resiviste un mensaje:')}`, msg);

    if (msg.body === '!ping') {
        // Send a new message as a reply to the current one
        msg.reply('pong');

    }

    if (msg.body === '!groupinfo') {
        let chat = await msg.getChat();
        if (chat.isGroup) {
            msg.reply(`
                *Los detalles de este grupo son *
                Nombre: ${chat.name}
                descripción: ${chat.description}
                Creado por: ${chat.owner.user}
                Participantes: ${chat.participants.length}
            `);
        }
    }
    if (msg.body === '!time') {
        // Send a new message as a reply to the current one
        $time = Date.now();
        $days = $time / 86400;
        msg.reply( `An pasado ${$days} dias desde el primero de enero de 1970`);
    }

    if (msg.body === '!help') {
        // Send a new message as a reply to the current one
        msg.reply(`
        *Los comandos son*
        !ping, !groupinfo, !time, !help`);
    }
    
});

client.on('disconnected', () => {
    console.log('El cliente se a desconectado');
});

client.initialize();
