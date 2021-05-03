
const { Client }    = require('whatsapp-web.js');           // API whatsap web
const chalk         = require("chalk");                     // Texto coloreado en consola
const qrcode        = require('qrcode-terminal');           // Mostrar qr en la consola
const pool          = require('./database');
const helper        = require('../lib/helper');
const config        = require('../config');
const { sleep }     = require('../lib/helper');
const fs = require('fs');
const { timeStamp } = require('console');
const SESSION_FILE_PATH = '../session.json'; 

class wrapper {

    constructor(){
        //init 
        this.clientArr = new Array();
        this.proccessed = false;
    }
    /**
     * Agrega una session y la guarda en la base de datos
     */
    /*
    addSession(){
        // New client instance
        client = new Client(
            { 
                puppeteer: {
                    executablePath: '/usr/bin/google-chrome-stable',
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
        });
        client.on('qr', (qr) => {
            console. clear();
            console.log(`${chalk.green('Escanee el código qr:')}`);
            qrcode.generate(qr, { small: true }); // Genera y muestra el QR por consola
        });
        client.on('authenticated', (session) => {
            
            sessionData = session;
            fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
                if (err) {
                    console.log(err);
                }
            });
        });
        client.on('ready', async () => {
            helper.sleep(5000);
            client.logout();
        });
        let newPos = (this.sessions.length) ? this.sessions.length : 0;

        this.sessions[newPos] = {
            activo: true,
            last_used: null,
            message_sends: 0,
            client
        }
        this.sessions[newPos].client.initialize();
    }
    
*/
    /**
     * Crea nuevo cliente, lo guarda en clientsArr y lo inicia.
     * @param {string|undefined} session 
     */
    add(session = undefined){
        let sessionData = null;
        //var node_env = process.env.NODE_ENV || 'development';
        var node_env = 'development';
        if (node_env === 'development'){
            if (fs.existsSync(SESSION_FILE_PATH)){
                // Si exsite cargamos el archivo con las credenciales
                console.log(chalk.yellow('Se encontró una sesión guardada'));
                sessionData   = require(SESSION_FILE_PATH);
            } 
        }
        let client = new Client(
            { 
                puppeteer: {
                    executablePath: '/usr/bin/google-chrome-stable',
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
                session: sessionData
        });
        // Que hacemos cuando wpp nos envíe el qr
        client.on('qr', (qr) => {
            if(!this.proccessed){
                console. clear();
                console.log(`${chalk.green('Escanee el código qr:')}`);
                qrcode.generate(qr, { small: true }); // Genera y muestra el QR por consola
            }
        });
        // Que hacemos cuando el cliente esté listo
        client.on('ready', async () => {
            //let info = await new ClientInfo(client);
            let info = client.info;
            console.log(
                `Cliente listo: \n`,
                `WID:        ${info.wid.user}\n`,
                `Phone:      ${info.phone.device_manufacturer + ' modelo: ' + info.phone.device_model }\n`,
                `Wpp Version:${info.phone.wa_version}\n`,
                `Plataforma: ${info.platform}\n`,
                `PushName:   ${info.pushname}\n`,
                );
        })
        // Que hacemos cuando la autenticación falle
        client.on('auth_failure', () => {
            console.log('auth_failure');
        })
        // Que hacemos cuando se desconecte @TODO Ver si el evento corresponde a cuando se desconecta wpp web y el celular
        client.on('disconnected', (reason) => {
            this.disconnected = true;
            console.log('disconnected');
        });
        // Que hacemos cuando el cliente este autenticado
        client.on('authenticated', (session) => {
            // Si la session no existe en la base de datos la guardamos
            sessionData = session;
            fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
                if (err) {
                    console.log(err);
                }
            });
        });
        // Cuando el % de bateria cambia
        client.on('change_battery', (batteryInfo) => {
            // Battery percentage for attached device has changed
            const { battery, plugged } = batteryInfo;
            console.log(`Battery: ${battery}% - Charging? ${plugged}`);
        });
        // Cuando el estado del cliente cambie
        client.on('change_state', state => {
            let info = client.info;
            console.clear();
            console.log(
                `Canbio de estado para la instancia ${info.wid.user}. Nuevo estado ${state}. `
            );
        });

        client.on('message', async message => {
            // Si no es un mensage de un chat no nos importa.
            if (message.type !== 'chat') return;
            number = message.from;
            number = number.includes('@c.us') ? number : `${number}@c.us`;

            let chat = await message.getChat();
            let info = await message.getInfo();
            await chat.sendSeen(); // Vemos el chat
            await sleep(2 * 1000); // esoeramos 2 segundos antes de empezar a escribir.
            await chat.sendStateTyping(); // 25 segunsdos

            message.reply('gracias por respondernos');


            /* Vemos si el numero esta en nuestra tabla de mensajes 
            const result = await pool.query('SELECT * FROM io_turno_mensaje mt WHERE mt.destino LIKE ?', [number])
            if(result.length > 0){
                // Vemos que responde
                client.sendMessage(number, 'Gracias por la respuesta.');
            } else {
                //client.sendMessage(number, 'No se nada de vos');
            }
            */
        });

        let newPos = (this.clientArr.length) ? this.clientArr.length : 0;

        this.clientArr[newPos] = {
            activo: true,
            last_used: null,
            message_sends: 0,
            client
        }
        this.clientArr[newPos].client.initialize();


    };
    /**
     * Termina todos los clientes en array de clientes
     */
    async close(){
        if(!this.clientArr) {return}
        for(let i = 0 ; i < this.clientArr.length ; i++){
            this.clientArr[i].client.logout();
            this.clientArr[i].active = false;
        }
    };

    /**
     * Envio de mensajes repartiendo la carga
     */
     
    //async sendMessages(){ console.log('hola hola hola'); this.proccessed = true;}
    async sendMessages(){



        await this.clientArr[0].client.sendMessage('5493454657618', 'Hola como estas');
/*
        // Get mensajes to send
        console.log(`${chalk.green('Buscamos los mensajes a enviar')}`);
        let rows;
        const sql = 'SELECT * FROM io_turno_mensaje tm WHERE tm.enviado = 0 AND tm.anulado = 0';
        rows = await pool.query(sql, (error) => {
            if (error) throw error;
        });      
        console.log(rows);
        // Cuantas instancias bamos a usar.
        const clientsLength = this.clientArr.length;

        // Por un lado temnemos un array con mensajes a enviar
        // Por otro lado un array con instancias de watsapp que pueden enviar los mensajes
        // Pero para evitar que bloqueen los numeros tenemos que tener un tiempo minimo entre envio
        // y envio por cada instancia.
        console.log('pasa la busqueda de columnas');
        while (rows.length > 0){
            let notSend = [];
            // Entramos siempre que tengamos mensajes a enviar 
            for(const inst = 0 ; i < clientsLength ; i++){

                const message = rows.pop(); // Sacamos un elemento del array de mensajes
                const number  = helper.validarNumero(message.destino); // Validamos el número
                // Si el numero no es valido no pdemos enviar el mensaje
                // Tenemos que usar la instancia en la que estamos para enviar el siguiente mensaje, si este existe
                while (number === false){
                    console.log(chalk.red(`Número mal Formateado "${message.destino}"`));
                    if(rows.length == 0) break; // Rompemos el bucle si no hay mas elementos
                    const message = rows.pop();
                    const number  = helper.validarNumero(message.destino);
                
                }
                // Ahora que estamos seguros de que el mensaje puede enviarse lo procesamos
                console.log(chalk.yellow(`Enviando mensaje a ${number} con el texto ${message.mensaje}... \n`));

                sendResult = await this.clientArr[inst].client.sendMessage(number, text);
                console.log(chalk.magenta(`Chat ID:      ${sendResult._getChatId()}`));   
                console.log(chalk.magenta(`Message:      ${sendResult.body}`));
                console.log(chalk.magenta(`From:         ${sendResult.from}`));
                console.log(chalk.magenta(`To:           ${sendResult.to}`));
                console.log(chalk.magenta(`ACK:          ${sendResult.ack}`));
                if(sendResult.ack == -1){
                    // Si se produjo un error enviando el mensaje puede que el numero no sea valido o no tenga usuario de wpp
                    // Tambien puede que la instancia se desconecte, o que el número sea bloqueado  
                    console.log(`${chalk.red('Error al tratar de enviar el mensaje.')}`);
                    let state = await this.clientArr[inst].client.getState();
                    if (state == 'TOS_BLOCK'){
                        let info = client.info;
                        console.log(`${chalk.red(`El número ${info.wid.user} fue bloqueado por Wpp y ya no esatará disponible.`)}`);
                        this.clientArr[inst].client.logout();
                        this.clientArr[inst].client.destroy();
                        this.clientArr[inst].active = false;
                        this.clientArr.pop(inst);
                        rows.push(message);
                    } else {
                        await client.resetState();
                        await sleep(20 * 1000);
                        let state = await this.clientArr[inst].client.getState();
                        // intentamos enviar una ves mas 

                        console.log(chalk.yellow(`Enviando mensaje a ${number} con el texto ${message.mensaje}... \n`));

                        sendResult = await this.clientArr[inst].client.sendMessage(number, text); 
                        console.log(chalk.magenta(`Chat ID:      ${sendResult._getChatId()}`));   
                        console.log(chalk.magenta(`Message:      ${sendResult.body}`));
                        console.log(chalk.magenta(`From:         ${sendResult.from}`));
                        console.log(chalk.magenta(`To:           ${sendResult.to}`));
                        console.log(chalk.magenta(`ACK:          ${sendResult.ack}`));
                    }

                }

                if (sendResult.ack >= 0){
                    let date = new Date();
                    const columns = {
                        'enviado': '1',
                        'fecha_enviado': date.toISOString().slice(0, 19).replace('T', ' '),
                        'sender': sendResult.from.replace('@c.us', ''),
                    }
                    
                    let result;
                    const sql = "UPDATE io_turno_mensaje SET ? WHERE id = ?";
                    pool.query(sql,[columns, message.id], (error, results, fields) => {
                        if (error) throw error;
                        result = results;
                    });
                    this.clientArr[inst].last_used = new Date().now();
                    this.clientArr[inst].message_sends++;
                } 

                if(rows.length == 0) break;
                await helper.sleep(2 * 1000);
            }
            // Ocupamos todas las instancias
            // Tenemos que esperar un tiempo antes de seguir
            await helper.sleep(config.delay_minutes * 60 * 1000); // Min * sec * milisec
        }
        console.log(`${chalk.green('Terminó el envio de mensajes.')}`);
        this.proccessed = true;
        return;
*/        
    };

}

(async () => {
    myW = new wrapper();
    var query = require('cli-interact').getYesNo;
    let answer, rows;

    await (async () => {
        //var node_env = process.env.NODE_ENV || 'development';
        var node_env = 'development';

        if (node_env !== 'development'){
                
            var answer = await query('Quiere agregar una instancia?\n');
            while(answer){
                await myW.add();
                await helper.sleep(30000); // Para dar tiempo decrear inst
                var answer = await query('Quiere agregar otra instancia?\n');
            }
        } else {
            await myW.add();
        }

        const sql = 'SELECT * FROM io_turno_mensaje tm WHERE tm.enviado = 0 AND tm.anulado = 0';
        console.log('despues de agregar instancias');
        rows = await pool.query(sql);         
        console.log(rows);
        console.log(myW.clientArr.length);
        console.log(`Instancias:        ${myW.clientArr.length}`)
        console.log(`Emnsages a enviar: ${rows.length}`)

        //const timeOut = myW.config.sleep * 1000;
        console.log('llego hasta el ultimo');
        var answer = await query('Proceder a realizar el envio?\n');
        if(answer){
            console.log(myW.clientArr);
            let element = myW.clientArr.pop();
            await element.client.sendMessage('5493454657618', 'Hola como estas');
        }else{
            //await myW.close();
        }
        return;
    })();
    
})();

module.export = wrapper;