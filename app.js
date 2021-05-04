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
app.get('/cron', async (req, res) => {
    
    status = task.getStatus();
    if(status){
        task.stop();
        aviso = 'Cron se detuvo.'
    } else {
        task.stop();
        aviso = 'Cron se detuvo.'  
    }
    res.send(aviso);
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