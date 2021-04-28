/**
 * Se encarga de realizar envio de mensajes desde una lista
 */
const express       = require('express');                   // Servidor web
const path          = require('path');                      // Manejador de paths
const exphdbs       = require('express-handlebars');        // Plantillas
const  pool         = require('./database');                // Manejador de bases de datos mysql
const { Client }    = require('whatsapp-web.js');           // API whatsap web
const chalk         = require("chalk");                     // Texto coloreado en consola
const helper        = require('./lib/helper');              // Helper, metodos de ayuda
const qrcode        = require('qrcode-terminal');           // Mostrar qr en la consola
const ora           = require('ora');                       // Mensaje dimanico para spiner
const fs            = require('fs');                        // File System

const SESSION_FILE_PATH = './session.json';                 // json donde guardamos la session
const EXECUTABLE_PATH   = '/usr/bin/google-chrome-stable';  // Binarios de chrome
const SLEEP             = 20000;                            // MS for sleep btwn mssg and mssg
// initializations server
const app = express();

//settings server
app.set('port', 4000);
app.set('views', path.join(__dirname, 'views'));

app.engine('.hbs', exphdbs({
    defaultLayout: 'main',
    extname: '.hbs',
}));
app.set('view engine', '.hbs');
//Publics
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', async (req, res) => {
    const mssgs = await pool.query('SELECT * FROM io_turno_mensaje WHERE 1=1');
    //console.log(mssgs);
    res.render('main', {mssgs});
});
//Start the server
app.listen(app.get('port'), () => {
    console.log('Server escuchando en puerto ', app.get('port'))
    console.log(chalk.green(`http://localhost:${app.get('port')}`));
});

if (fs.existsSync(SESSION_FILE_PATH)){
    // Si exsite cargamos el archivo con las credenciales
    console.log(chalk.yellow('Se encontró una sesión guardada'));
    sessionData   = require(SESSION_FILE_PATH);
} else {
    sessionData = null;
}

let client = new Client({ puppeteer: {
    executablePath: EXECUTABLE_PATH, // rute to chrome or chromium bin
    headless: false,
}, 
session: sessionData 
});

client.on('qr', (qr) => {
    // Genera un codigo qr i lo muestra por la consola para que puedas escanearlo con tu celular.
    console.log(`${chalk.green('Escanee el código qr:')}`);
    qrcode.generate(qr, { small: true });
});



client.on('ready', async () => {
    // Todo el procesamiento que vamos a lanzar cuando el cliente este listo
    console.log(`${chalk.green('Client is ready!')}`);
    console.log(`${chalk.green('Buscamos los mensajes a enviar')}`);

    const rows = await pool.query('SELECT * FROM io_turno_mensaje tm WHERE tm.enviado = 0 AND tm.anulado = 0');
    // Recorremos el arreglo enviando y guardando el resultado
    // Dato.. No usar foreach con promesas
    for(let i = 0 ; i < rows.length; i++) {
        const number  = helper.validarNumero(rows[i].destino);
        const text    = rows[i].mensaje; 
        if(number === false){
            console.log(chalk.red(`Número mal Formateado "${rows[i].destino}"`));
            continue;
        }
        console.log(chalk.yellow(`Enviando mensaje a ${number} con el texto ${text}... \n`));
        const msg = await client.sendMessage(number, text);  
        console.log(chalk.magenta(`Chat ID:      ${msg._getChatId()}`));   
        console.log(chalk.magenta(`Message:      ${msg.body}`));
        console.log(chalk.magenta(`From:         ${msg.from}`));
        console.log(chalk.magenta(`To:           ${msg.to}`));
        console.log(chalk.magenta(`ACK:          ${msg.ack}`));

        // if ack = -1 error
        if (msg.ack >= 0){
            let date = new Date();
            const columns = {
                'enviado': '1',
                'fecha_enviado': date.toISOString().slice(0, 19).replace('T', ' '),
                'sender': msg.from.replace('@c.us', ''),
            }
            const result = await pool.query("UPDATE io_turno_mensaje SET ? WHERE id = ?", [columns, rows[i].id]);
        } else if (msg.ack == -1){
            console.log(`${chalk.red('Error al enviar el mensaje, puede que el número no sea válido.')}`);
        }
        console.log(chalk.yellow(`Durmiendo por ${SLEEP} Ms...`));
        await helper.sleep(SLEEP);
    };  
    console.log(`${chalk.green('Terminó el envio de mensajes.')}`);

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

client.on('message', message => {
	console.log(message.body);
});

client.initialize();
