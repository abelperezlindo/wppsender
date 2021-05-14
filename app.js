/**
 * @file proveedor del servicio
 * 
 */
const config  = require('../config.js');
// Globals variables
global.cronStatus = false;  // Contiene el estado de cron.
global.qr = null;           // Contiene el qr para escanear
const express   = require('express');                   // Servidor web
const task      = require('./src/cron');
const manager   = require('./src/manager');
const helper    = require('./lib/helper');

const app = express();
app.set('port', config.port);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/**
 * Rutas
 */
// get if server is online
app.get('/', async (req, res) => {
    console.log('reqest');
    res.status(200);
    res.json({'status': 'activo'});
})
// Obtener estado de cron.
app.get('/cron', async (req, res) => {
    console.log('reqest');
    res.json({cronStatus: global.cronStatus})
})
// Iniciar cron.
app.get('/cron/start', async (req, res) => {
    console.log('reqest');
    if(global.cronStatus){
        task.start();
        global.cronStatus = true;
    } 
    res.json({cronStatus: global.cronStatus});
});
// Detener cron.
app.get('/cron/stop', async (req, res) => {
    console.log('reqest');
    if(!global.cronStatus){
        task.stop();
        global.cronStatus = false;
    } 
    res.json({cronStatus: global.cronStatus});
});
// Obtener qr para nueva sesion
app.get('/qr', async (req, res) => {
    console.log('reqest');
    if(global.qr){
        // servimos el qr existestente
        res.json({
            status: 'isLoad',
            qr: global.qr
        });
        return;
    }
    // Esperamos por un nuevo qr.
    await manager.createClient();
    await helper.sleep(4000);
    res.json({
        status: 'loading',
        qr: global.qr
    }); 
});


//Start the server
app.listen(app.get('port'), () => {
    console.log('Server escuchando en puerto ', app.get('port'))
    console.log(`http://localhost:${app.get('port')}`);
});
