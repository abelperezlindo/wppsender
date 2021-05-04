const { Client }    = require('whatsapp-web.js');           // API whatsap web
const qrcode        = require('qrcode-terminal');           // Mostrar qr en la consola
const fs            = require('fs');                        // File System
const pool          = require('./database');


async function createClient(){
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
    client.on('qr', (qr) => {
        console.log('Escanea el código.');
        qrcode.generate(qr, { small: true });
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
async function loadClient(number){
    try{
        let result = await pool.query('SELECT * FROM io_session WHERE io_session.numero LIKE ?', [number]);
        console.log(result[0].session_data);
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
            session: JSON.parse( result[0].session_data )
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
    } catch (err){
        console.log(err);
    }
};
async function getMessagesInQueue(){
    try{
        const row = await pool.query('SELECT * FROM io_turno_mensaje tm WHERE tm.enviado = 0 AND tm.anulado = 0 ORDER BY tm.prioridad DESC, tm.fecha_alta ');
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
async function sendMessage(from, to, text) {

    try{
        client = await loadClient(from);
        if(!client) return;
        await client.initialize();
        message = await client.sendMessage(to, text);
        console.log(message);
    }catch(err){
        console.log(err);
    }
};
async function getSavedSessions(){
    try{
        let result = await pool.query('SELECT * FROM io_session WHERE io_session.activo = 1');
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

module.exports = {
    createClient,
    loadClient,
    getNextMessageToSend,
    sendMessage,
    getSavedSessions,
    getMessagesInQueue,
    getNotUsedInMoreTime
}