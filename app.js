/**
 * Provee un wraper a whatsap-web.js
 */

var qrForAuth = false, cronStatus = false; // Variables con alcance global

const express = require('express');                   // Servidor web
const path = require('path');                      // Manejador de paths
const exphbs = require('express-handlebars');        // Plantillas
const pool = require('./src/database');            // Manejador de bases de datos mysql
const chalk = require("chalk");                     // Texto coloreado en consola
const helper = require('./lib/helper');             // Helper, metodos de ayuda
const fs = require('fs');                        // File System
const manager = require('./src/index');
const cron = require('node-cron');
const body_parser = require('body-parser');
const { response } = require('express');

const task = cron.schedule('5 * * * * *', async () => {
    //console.clear();
    console.log('Corriendo cron');
    var message = await manager.getNextMessageToSend();
    if (!message) {
        console.log('No hay mensajes a enviar');
        return;
    }
    var session = await manager.getNotUsedInMoreTime()
    if (!session) {
        console.log('No hay sessiones disponibles');
        return;
    }
    var session = session.pop();
    var destino = helper.validarNumero(message.destino);

    if (destino === false) {
        console.log('Error en formato de numero destino, el mensaje no será enviado.');
        return;
    }
    var mensaje = message.mensaje;
    var send = await manager.sendMessage(session.session_data, destino, mensaje);
    if (!send) { return };
    await manager.setMessageSend(message.id, session.numero);
    console.log(`Mensaje ${mensaje} enviado desde ${session.numero} a ${destino}`);
},
    {
        scheduled: false
    });

const app = express();
app.set('port', 4400);

app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    //partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    //helpers: require('./lib/handlebars')
}));

app.set('view engine', '.hbs');
app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/messages', async (req, res) => {
    const rows = await manager.getMessagesInQueue();
    res.render('session/messages', { rows });
});
app.post('/messages/add', async (req, res) => {

    const { destino, mensaje } = req.body;
    if (destino === undefined || mensaje === undefined) {
        res.redirect('/messages');
    }
    const newMessage = {
        destino,
        mensaje,
        enviado: '0',
        anulado: '0',
        prioridad: '1'
    };
    await pool.query("INSERT INTO io_turno_mensaje SET ?", [newMessage]);

    res.redirect('/messages');
});
app.get('/sessions', async (req, res) => {
    const rowsg = await manager.getSavedSessions();
    res.render('session/sessions', { rowsg });
});

app.get('/sessions/add', async (req, res) => {
    if (!qrForAuth) {
        manager.createClient();
        await setTimeout(() => { }, 3000);
        qrForAuth = true;
        res.redirect('/sessions/qr');
    } else {
        res.redirect('/sessions/qr');
    }

});

app.get('/sessions/qr', async (req, res) => {

    await setTimeout(() => { }, 3000);
    res.render('session/qr');

});
app.get('/cron/start', async (req, res) => {
    message = '';
    if (!cronStatus) {
        task.start();
        message = 'Cron se esta iniciando.'
        cronStatus = true;
    } else {
        message = 'Cron se esta iniciando.'
    }
    console.log(message);
    res.redirect('/',);

});
app.get('/cron/stop', async (req, res) => {
    let message = '';
    if (cronStatus) {
        task.stop();
        message = 'Cron se detendrá.'
        cronStatus = false;
    } else {
        message = 'Cron ya se ha detenido.'
    }
    console.log(message);
    res.redirect('/',);
});
app.get('/', async (req, res) => {
    const message = req.app.get('message_user');
    res.render('front', { cronStatus });
});
//Start the server
app.listen(app.get('port'), () => {
    console.log('Server escuchando en puerto ', app.get('port'))
    console.log(chalk.green(`http://localhost:${app.get('port')}`));
});
