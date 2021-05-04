const { Client }    = require('whatsapp-web.js');           // API whatsap web
const qrcode        = require('qrcode-terminal');           // Mostrar qr en la consola
const fs            = require('fs');                        // File System
const pool          = require('./src/database');

async function createClient() {
    let outSession = null;
    let client = new Client(
        { puppeteer: {
            executablePath: '/usr/bin/google-chrome-stable', // rute to chrome or chromium bin
            headless: true,
        }
    });
    client.on('qr', (qr) => {
        console.log('Escanea el código.');
        qrcode.generate(qr, { small: true });
    });
    client.on('ready', async () => {
        if(outSession){
            console.log('Se creó una nueva sesion para whatsap web y se guardo en la base de datos');
            try{
                let info = client.info;
                console.log(info);
                row = {
                    'activo': 1,
                    'session_data': JSON.stringify(outSession),
                    'numero': info.wid.user,
                    'descripcion': info.phone.device_manufacturer + ' modelo: ' + info.phone.device_model,
                    'fecha': '2021-05-02 00:00:34',
                    'enviados': 0,
                }
                let result = await pool.query('INSERT INTO io_session SET ?', [row]);
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
}
async function loadClient(number){
    try{
        let result = await pool.query('SELECT * FROM io_session WHERE io_session.numero LIKE ?', [number]);
        console.log(result[0].session_data);
        let client = new Client(
            { puppeteer: {
                executablePath: '/usr/bin/google-chrome-stable', // rute to chrome or chromium bin
                headless: true,
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
}
 


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
}



sendMessage('5493434403331', '5493454657618@c.us', 'hola amigo');