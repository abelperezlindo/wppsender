
const { Client }    = require('whatsapp-web.js');           // API whatsap web
const chalk         = require("chalk");                     // Texto coloreado en consola
const qrcode        = require('qrcode-terminal');           // Mostrar qr en la consola
const pool          = require('./database');
const helper        = require('../lib/helper');
const config        = require('../config');

class wrapper {

    constructor(){
        //init 
        this.clientArr = new Array();
        this.addConfig();
    }
    /**
     * Crea nuevo cliente, lo guarda en clientsArr y lo inicia.
     * @param {string|undefined} session 
     */
    add(session = undefined){

        this.session = session;
        let client = new Client(
            { 
                puppeteer: {
                    executablePath: '/usr/bin/google-chrome-stable',
                    headless: true,
                },
                session
        });
        // Que hacemos cuando wpp nos envíe el qr
        client.on('qr', (qr) => {
            console. clear();
            console.log(`${chalk.green('Escanee el código qr:')}`);
            qrcode.generate(qr, { small: true }); // Genera y muestra el QR por consola
        });
        // Que hacemos cuando el cliente esté listo
        client.on('ready', async () => {
            //let info = await new ClientInfo(client);
            let info = client.info;
            console.clear();
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
            const state = await client.resetState();
            console.log('Client state: ', state);
            console.log(message);
            if (message.type !== 'chat') return;
            number = message.from;
            number = number.includes('@c.us') ? number : `${number}@c.us`;
            let chat = await message.getChat();
            console.log(chat);
            chat.sendSeen();
            // Vemos si el numero esta en nuestra tabla de mensajes 
            const result = await pool.query('SELECT * FROM io_turno_mensaje mt WHERE mt.destino LIKE ?', [number])
            if(result.length > 0){
                // Vemos que responde
                client.sendMessage(number, 'Gracias por la respuesta.');
            } else {
                //client.sendMessage(number, 'No se nada de vos');
            }
        });

        let newPos = (this.clientArr.length) ? this.clientArr.length : 0;

        this.clientArr[newPos] = client;
        this.clientArr[newPos].initialize();

    };
    /**
     * Termina todos los clientes en array de clientes
     */
    async close(){
        for(let i = 0 ; i < clientArr.length ; i++){
            this.clientArr[i].logout(); 
        }
    };

    /**
     * Envio de mensajes repartiendo la carga
     */
    async sendMessages(){
        // Get mensajes to send
        console.log(`${chalk.green('Buscamos los mensajes a enviar')}`);
        const rows = await pool.query('SELECT * FROM io_turno_mensaje tm WHERE tm.enviado = 0 AND tm.anulado = 0');

        // Cuantas instancias bamos a usar.
        const clientsLength = this.clientArr.length;

        // Por un lado temnemos un array con mensajes a enviar
        // Por otro lado un array con instancias de watsapp que pueden enviar los mensajes
        // Pero para evitar que bloqueen los numeros tenemos que tener un tiempo minimo entre envio
        // y envio por cada instancia.

        while (rows.length != 0){
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

                sendResult = await this.clientArr[inst].sendMessage(number, text); 
                console.log(chalk.magenta(`Chat ID:      ${sendResult._getChatId()}`));   
                console.log(chalk.magenta(`Message:      ${sendResult.body}`));
                console.log(chalk.magenta(`From:         ${sendResult.from}`));
                console.log(chalk.magenta(`To:           ${sendResult.to}`));
                console.log(chalk.magenta(`ACK:          ${sendResult.ack}`));
                if(sendResult.ack == -1){
                    // Si se produjo un error enviando el mensaje puede que el numero no sea valido o no tenga usuario de wpp
                    // Tambien puede que la instancia se desconecte, o que el número sea bloqueado  
                    console.log(`${chalk.red('Error al tratar de enviar el mensaje.')}`);
                    let state = await this.clientArr[inst].getState();
                    if (state == 'TOS_BLOCK'){
                        let info = client.info;
                        console.log(`${chalk.red(`El número ${info.wid.user} fue bloqueado por Wpp y ya no esatará disponible.`)}`);
                        this.clientArr[inst].logout();
                        this.clientArr[inst].destroy();
                        this.clientArr.pop(inst);
                        rows.push(message);
                    } else {
                        await client.resetState();
                        await sleep(20 * 1000);
                        let state = await this.clientArr[inst].getState();
                        // intentamos enviar una ves mas 

                        console.log(chalk.yellow(`Enviando mensaje a ${number} con el texto ${message.mensaje}... \n`));

                        sendResult = await this.clientArr[inst].sendMessage(number, text); 
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
                    const result = await pool.query("UPDATE io_turno_mensaje SET ? WHERE id = ?", [columns, message.id]);
                } 

                if(rows.length == 0) break;
                await helper.sleep(2 * 1000);
            }
            // Ocupamos todas las instancias
            // Tenemos que esperar un tiempo antes de seguir
            await helper.sleep(15 * 60 * 1000); // Min * sec * milisec
        }
        console.log(`${chalk.green('Terminó el envio de mensajes.')}`);
        return;
    };

}

(async () => {
    myW = new wrapper();
    var query = require('cli-interact').getYesNo;
    var answer = await query('Quiere agregar una instancia?\n');
    while(answer){
        await myW.add();
        await helper.sleep(30000); // Para dar tiempo decrear inst
        var answer = await query('Quiere agregar otra instancia?\n');
    }
    console.log(myW.clientArr.length);
    const rows = await pool.query('SELECT * FROM io_turno_mensaje tm WHERE tm.enviado = 0 AND tm.anulado = 0');
    console.log(`Instancias:        ${myW.clientArr.length}`)
    console.log(`Emnsages a enviar: ${rows.length}`)
    const timeOut = myW.config.sleep * 1000;
    var answer = await query('Proceder a realizar el envio?\n');
    if(answer){
        await myW.sendMessages();
        await myW.close();
    }else{
        await myW.close();
    }
})();


console.log('Termino la ejecucion del mensaje');

//myW.sendMessages();

module.export = wrapper;