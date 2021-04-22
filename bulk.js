const { Client } = require('whatsapp-web.js');
const chalk = require("chalk");

const qrcode = require('qrcode-terminal');

const client = new Client();

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log(`${chalk.green('Escanee el código qr:')}`);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('auth_failure', () => {
    console.log('** Error de autentificacion vuelve a generar el QRCODE **');
})

client.initialize;

