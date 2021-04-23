/**
 * Se encarga de realizar envio de mensajes desde una lista
 */
 
const  pool         = require('./database');         // Manejador de bases de datos mysql
const { Client }    = require('whatsapp-web.js');    // API whatsap web
const chalk         = require("chalk");              // Texto coloreado en consola
const helper        = require('./lib/helper');       // Helper, metodos de ayuda
const qrcode        = require('qrcode-terminal');    // Mostrar qr en la consola
const ora           = require('ora');                // Mensaje dimanico para spiner
const fs            = require('fs');                 // File System
const SESSION_FILE_PATH = './session.json'

const client = new Client(); // Cliente de whatsapp web que bamos a usar 

if (fs.existsSync(SESSION_FILE_PATH)){
    // Si exsite cargamos el archivo con las credenciales
    const spinner = ora(`Cargando ${chalk.yellow('Validando session con Whatsapp...')}`);
    sessionData = require(SESSION_FILE_PATH);
    spinner.start();
    client = new Client({
        session: sessionData
    })
}

    

client.on('qr', (qr) => {
    // Genera un codigo qr i lo muestra por la consola para que puedas escanearlo con tu celular.
    console.log(`${chalk.green('Escanee el código qr:')}`);
    qrcode.generate(qr, { small: true });
});



client.on('ready', () => {
    // Todo el procesamiento que vamos a lanzar cuando el cliente este listo
    console.log(`${chalk.green('Client is ready!')}`);
    console.log(`${chalk.green('Buscamos los mensajes a enviar')}`);
    let forSend; 
    pool.query('SELECT * FROM io_turno_mensaje tm WHERE tm.enviado = 0 AND tm.anulado = 0', (err, rows, fields) => {
        if (!err) {
        console.log(`${chalk.red(err)}`);
        } else {
            // Recorremos el arreglo enviando y guardando el resultado
            row.forEach(function(element, index) {
                console.log(element, index);
                number  = helper.validarNumero(5493454657618);
                text    = 'hola';
                message = client.sendMessage(number, text);
                
                console.log(`${chalk.green('⚡⚡⚡ Enviando mensajes....')}`);
            })  
        }

    });
    

});

client.on('auth_failure', () => {
    // Avisamos que la autenticación no fue correcta
    console.log( `${chalk.red('** Error de autentificacion vuelve a generar el QRCODE **')}`);
})

client.on('disconnected', (reason) => {
    // Avisamos que el cliente se desconectó
    console.log(
        `${chalk.red('Client was logged out')}`, 
        `${chalk.blue.bgRed.bold(reason)}`, 
        );
});

client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.log(err);
        }
    });
});

client.initialize();

