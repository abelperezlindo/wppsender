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
const routes = require('./src/routes');

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
app.use(express.json());
app.use(routes);

//Start the server
app.listen(app.get('port'), () => {
    console.log('Server escuchando en puerto ', app.get('port'))
    console.log(chalk.green(`http://localhost:${app.get('port')}`));
});
