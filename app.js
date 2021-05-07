/**
 * Provee un wraper a whatsap-web.js
 */

 var qrForAuth = false, cronStatus = false; // Variables con alcance global

 const express       = require('express');                   // Servidor web
 const path          = require('path');                      // Manejador de paths
 const exphbs       = require('express-handlebars');        // Plantillas
 const  pool         = require('./src/database');            // Manejador de bases de datos mysql
 const chalk         = require("chalk");                     // Texto coloreado en consola
 const helper        = require('./lib/helper');             // Helper, metodos de ayuda
 const fs            = require('fs');                        // File System
 const manager       = require('./src/index');
 const cron          = require('node-cron');
const { image }      = require('qr-image');
const bodyParser     = require('body-parser');

const task = cron.schedule('20 * * * * *', () => {
  console.log('Corriendo cron');
},
 {
    scheduled: false
 });
 //app.use(express.static('public')); // archivos publicos

 // initializations server
 const app = express();
 
 //settings server
 app.set('port', 4400);

app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  //partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  //helpers: require('./lib/handlebars')
}))
app.set('view engine', '.hbs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

 app.get('/queue', async (req, res) => {
     const rows = await manager.getMessagesInQueue();
     res.render('session/messages', {rows});
 });
 app.get('/sessions', async (req, res) => {
    const rowsg = await manager.getSavedSessions();
    res.render('session/sessions', {rowsg});
});

app.get('/sessions/add', async (req, res) => {
    if (!qrForAuth) {
        manager.createClient();
        await setTimeout(() => {}, 3000);
        qrForAuth = true;
        res.redirect('/sessions/qr');
    }    
});

app.get('/sessions/qr', async (req, res) => {

    await setTimeout(() => {}, 3000);
    res.render('session/qr');
    
});
app.get('/cron/start', async (req, res) => {
    if (!cronStatus){
        task.start();
        res.send('ok iniciando cron ')
    } else {
        res.send('Cron ya está iniciado');

    }
    
});
app.get('/cron/stop', async (req, res) => {
    if (cronStatus){
        task.stop();
        res.send('ok terminando cron ')
    } else {
        res.send('Cron ya está parado');

    }
});
app.get('/', async (req, res) => {
    res.render('front', {cronStatus});
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