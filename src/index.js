const { Client }    = require('whatsapp-web.js');           // API whatsap web
const qrcode        = require('qrcode-terminal');           // Mostrar qr en la consola
const fs            = require('fs');                        // File System
const pool          = require('./database');
const qrImage       = require('qr-image');

async function createClient(){
    var qrConunt = 0;
    let outSession = null;
    let client = new Client(
        { puppeteer: {
            executablePath: '/usr/bin/google-chrome-stable', // rute to chrome or chromium bin
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--process-per-site",
                "--disable-gpu"
            ],
        }
    });
    client.on('qr', async  (qr) => {

        const path = 'public/qr.svg';
        if (qrConunt < 6){
            console.log('Escanea el código.');
            var qr_svg = qrImage.image(qr, { type: 'svg' });
            await qr_svg.pipe( fs.createWriteStream(path));
            qrConunt++;
        } else {
            let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="m0,0v1h1V0"/></svg>';
            fs.writeFile(path, svg, (err) => {  
                if (err) throw err;
            });
        }

    });
    client.on('ready', async () => {
        if(outSession){
            try{
                let info = client.info;
                const currentDate = new Date();
                const dateTimeStr = currentDate.toISOString().slice(0, 19).replace('T', ' ');
                console.log(info);
                row = {
                    'activo': 1,
                    'session_data': JSON.stringify(outSession),
                    'numero': info.wid.user,
                    'descripcion': info.phone.device_manufacturer + ' modelo: ' + info.phone.device_model,
                    'fecha': dateTimeStr,
                    'enviados': 0,
                }
                // Si existe una session guardada para el número no permitiremos la carga.
                let isSaved = await pool.query('SELECT * FROM io_session s WHERE s.numero LIKE ?;', [row.numero])
                if (isSaved[0] === undefined){
                    let result = await pool.query('INSERT INTO io_session SET ?', [row]);
                    console.log('Se creó una nueva sesion para whatsap web y se guardo en la base de datos');
                } else {
                    console.log(`El cliente para el numero ${row.numero} ya existe, eliminilo primero`);
                }

                let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="m0,0v1h1V0"/></svg>';
                fs.writeFile('public/qr.svg', svg, (err) => {  
                    if (err) throw err;
                });

                client.destroy();
                console.log('cliente destruido');

            }catch(err){
                console.log(err);
            }
        } else {
            console.log('no se creo la session');
        }

    });
    client.on('authenticated', async (session) => {
        console.log('Cliente autenticado')
        outSession = session;
    });

    client.initialize();    
};
async function loadClient(session){
    console.log('session data : \n', session);
    if(session === undefined) return false;
    let client = new Client(
        { puppeteer: {
            executablePath: '/usr/bin/google-chrome-stable', // rute to chrome or chromium bin
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--process-per-site",
                "--disable-gpu"
            ],
        }, 
        session: JSON.parse( session )
    });
    client.on('qr', (qr) => {

    });
    client.on('ready', async () => {
        console.log('cliente listo');    
    });
    client.on('authenticated', async (session) => {
        console.log('Cliente autenticado')
    });
        return client;
};
async function getMessagesInQueue(){
   
    try{
        //const row = await pool.query('SELECT * FROM io_turno_mensaje tm WHERE tm.enviado = 0 AND tm.anulado = 0 ORDER BY tm.prioridad DESC, tm.fecha_alta ');
        const row = await pool.query(`SELECT id, destino, mensaje, enviado, anulado, DATE_FORMAT(fecha_enviado,'%d/%m/%Y %h:%i hs') AS fecha_enviado, DATE_FORMAT(fecha_anulado,'%d/%m/%Y %h:%i hs') AS fecha_anulado, sender FROM io_turno_mensaje tm WHERE  1=1 ORDER BY tm.prioridad DESC, tm.fecha_alta` );
        if(row[0] === undefined) return;
        return row;

    } catch(err){
        console.log(err);
    }
};
async function getNextMessageToSend(){
    try{
        const row = await pool.query('SELECT * FROM io_turno_mensaje tm WHERE tm.enviado = 0 AND tm.anulado = 0 ORDER BY tm.prioridad DESC, tm.fecha_alta ASC LIMIT 1');
        if(row[0] === undefined) return;
        return row[0];

    } catch(err){
        console.log(err);
    }
};
async function sendMessage(session, to, text) {

    try{
        client = await loadClient(session);
        if(!client) return;
        await client.initialize();
        message = await client.sendMessage(to, text);
        if(message.ack < 0){
            return false; // error al enviar
        }else{
            return true;
        }
        console.log(message);
    }catch(err){
        console.log(err);
    }
};
async function getSavedSessions(){

    try{
        let result = await pool.query(`SELECT id, numero, activo, descripcion, DATE_FORMAT(fecha, '%d/%m/%Y %h:%i hs.') AS fecha, DATE_FORMAT(ultimo_uso,'%d/%m/%Y %h:%i hs.') AS ultimo_uso, enviados  FROM io_session WHERE io_session.activo = 1`);
        return result;
        console.log(result)
    } catch (err){
        console.log(err);
        return false;
    }
};
async function getNotUsedInMoreTime(){
    try{
        let result = await pool.query('SELECT * FROM io_session s WHERE s.activo = 1 ORDER BY s.ultimo_uso ASC LIMIT 1');
        return result;
        console.log(result)
    } catch (err){
        console.log(err);
        return false;
    }
}
async function setMessageSend(id, sender){
    if(id == undefined) return false;

    let now = await new Date()
    let date = await now.toISOString().slice(0, 19).replace('T', ' ');
    let rowData = {
        "enviado": 1,
        "fecha_enviado": date,
        "sender": sender,
    };
 
    let result = await pool.query('UPDATE io_turno_mensaje SET ? WHERE io_turno_mensaje.id = ?;', [rowData, id]);
    let upSession = await pool.query(`UPDATE io_session SET ultimo_uso = '${date}', enviados = enviados + 1  WHERE numero LIKE '${sender}'`);
    return true;
}


module.exports = {
    createClient,
    loadClient,
    getNextMessageToSend,
    sendMessage,
    getSavedSessions,
    getMessagesInQueue,
    getNotUsedInMoreTime,
    setMessageSend
}