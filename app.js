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