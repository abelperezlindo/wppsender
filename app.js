/**
 * Provee un wraper a whatsap-web.js
 */
 const express       = require('express');                   // Servidor web
 const path          = require('path');                      // Manejador de paths
 const exphdbs       = require('express-handlebars');        // Plantillas
 const  pool         = require('./src/database');            // Manejador de bases de datos mysql
 const chalk         = require("chalk");                     // Texto coloreado en consola
 const helper        = require('./lib/helper');             // Helper, metodos de ayuda
 const fs            = require('fs');                        // File System
 const manager       = require('./src/index');
 const cron          = require('node-cron');

const task = cron.schedule('20 * * * * *', () => {
  console.log('Corriendo cron');
},
 {
    scheduled: false
 });

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

 app.get('/queue', async (req, res) => {
     const rows = await manager.getMessagesInQueue();
     res.render('main', {rows});
 });
 app.get('/sessions', async (req, res) => {
    const rowsg = await manager.getSavedSessions();
    res.render('layouts/sessions', {rowsg});
});
app.get('/sessions/add', async (req, res) => {
    // Como obtener qr y enviarlo al cliente por express ?
    console.log('hola');
    await manager.createClient();
    let result = await pool.query(`SELECT * FROM io_variables v WHERE v.nombre = 'var_last_qr'`);
    value = JSON.parse(result[0].valor);
    res.send(value.qr)

});
app.get('/cron/start', async (req, res) => {
    let start = task.start();
    console.log(start);
    try {
        data = JSON.stringify({ scheduled: true });
        let result = pool.query(`UPDATE io_variables v SET v.valor = ? WHERE v.nombre = 'var_cron_status'`, [data]);
    } catch(err) {
        console.log(err);
    }
    res.send('ok iniciando cron ')
});
app.get('/cron/stop', async (req, res) => {
    let start = task.stop();
    console.log(start);
    try {
        data = JSON.stringify({ scheduled: false });
        let result = pool.query(`UPDATE io_variables v SET v.valor = ? WHERE v.nombre = 'var_cron_status'`, [data]);
    } catch(err) {
        console.log(err);
    }
    res.send('ok parando cron ')
});

 //Start the server
 app.listen(app.get('port'), () => {
     console.log('Server escuchando en puerto ', app.get('port'))
     console.log(chalk.green(`http://localhost:${app.get('port')}`));
 });

(async () => {
    message = await manager.getNextMessageToSend();
    console.log(message)
})();