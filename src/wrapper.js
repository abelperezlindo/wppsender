
const { Client }    = require('whatsapp-web.js');           // API whatsap web
const chalk         = require("chalk");                     // Texto coloreado en consola
const qrcode        = require('qrcode-terminal');           // Mostrar qr en la consola
const pool          = require('./database');
const helper        = require('../lib/helper');
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
/*
        var query = require('cli-interact').getYesNo;
        var answer = query('Quiere agregar una instancia?\n');
        if(!answer){
            return
        }
*/
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
        let newPos = (this.clientArr.length) ? this.clientArr.length : 0;
        console.log('NewPos: ', newPos);
        //this.clientsArr.insert(newPos, client);
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
     * Agrega instancias esperando la respuesta del usuario.
     */
    async addMultiple(callback){
        var query = require('cli-interact').getYesNo;
        var answer = await query('Quiere agregar una instancia?\n');
        if(answer){
            console.log('Agregando nueva ins');
            await this.add();
            await callback();
        } 
        return;
    };

    /**
     * Agrega una configuracion
     * @param {*} config 
     */
    addConfig(config){

        if(!config){
            this.config = {sleep: 20}
        } else {
            this.config = {
                sleep: (config.sleep) ? config.sleep : 20,
            };
        }

    };
    /**
     * Envio de mensajes repartiendo la carga
     */
    async sendMessages(){
        // Get mensajes to send
        console.log(`${chalk.green('Buscamos los mensajes a enviar')}`);
        //const rows = await pool.query('SELECT * FROM io_turno_mensaje tm WHERE tm.enviado = 0 AND tm.anulado = 0');
        let rows = [];
        // Recorremos el arreglo enviando y guardando el resultado
        for(let i = 0 ; i < rows.length; i++) {
            const number  = helper.validarNumero(rows[i].destino);
            const text    = rows[i].mensaje; 
            if(number === false){
                console.log(chalk.red(`Número mal Formateado "${rows[i].destino}"`));
                continue;
            }
            console.log(chalk.yellow(`Enviando mensaje a ${number} con el texto ${text}... \n`));
            if(this.clientArr.length > 0) {
                const msg = await this.clientArr[0].sendMessage(number, text); 
            }   
            console.log(chalk.magenta(`Chat ID:      ${msg._getChatId()}`));   
            console.log(chalk.magenta(`Message:      ${msg.body}`));
            console.log(chalk.magenta(`From:         ${msg.from}`));
            console.log(chalk.magenta(`To:           ${msg.to}`));
            console.log(chalk.magenta(`ACK:          ${msg.ack}`));

            // if ack = -1 error
            if (msg.ack >= 0){
                let date = new Date();
                const columns = {
                    'enviado': '1',
                    'fecha_enviado': date.toISOString().slice(0, 19).replace('T', ' '),
                    'sender': msg.from.replace('@c.us', ''),
                }
                const result = await pool.query("UPDATE io_turno_mensaje SET ? WHERE id = ?", [columns, rows[i].id]);
            } else if (msg.ack == -1){
                console.log(`${chalk.red('Error al enviar el mensaje, puede que el número no sea válido.')}`);
            }
            console.log(chalk.yellow(`Durmiendo por ${SLEEP} Ms...`));
            await helper.sleep(SLEEP);
        };  
        console.log(`${chalk.green('Terminó el envio de mensajes.')}`);

    };
    /**
     * Maneja la carga de mensajes para cada instancia de wpp
     * cada instancia tendrá un maximo para enviar. y un tiempo de inactividad minimo
     */
    /*
    getAvailableClient(){
        if(this.clientArr.length = 0) return false;
        now = new Date('now').
        let olderUsed = { id: 0, timestamp: };
        for(let i = 0 ; i < this.clientArr.length ; i++){

        }
    }
    */

    getAvailableClient(){
        if(this.clientArr.length = 0) return false;
        return 1; // el id
    }

}
myW = new wrapper();
await myW.addMultiple(rec = async () => {
    await myW.addMultiple(rec);
})
console.log('termino ani chan');

//myW.sendMessages();

module.export = wrapper;