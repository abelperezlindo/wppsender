
 const path          = require('path');                      // Manejador de paths
 const  pool         = require('./database');                // Manejador de bases de datos mysql
 const { Client }    = require('whatsapp-web.js');           // API whatsap web
 const chalk         = require("chalk");                     // Texto coloreado en consola
 const helper        = require('../lib/helper');              // Helper, metodos de ayuda
 const qrcode        = require('qrcode-terminal');           // Mostrar qr en la consola
 const fs            = require('fs');                        // File System
 
 const SESSION_FILE_PATH = './session.json';                 // json donde guardamos la session
 const EXECUTABLE_PATH   = '/usr/bin/google-chrome-stable';  // Binarios de chrome
 const SLEEP             = 20000;                            // MS for sleep btwn mssg and mssg


class clientWrapper {
    
    constructor(session){
        this.session = session;
        this.client = new Client(
            { 
                puppeteer: {
                    executablePath: '/usr/bin/google-chrome-stable',
                    headless: true,
                }, 
                session: session, 
        });
        this.client.on('ready', () => {
            this.ready = true;
            console.log('ready');
        })
        this.client.on('auth_failure', () => {
            this.auth_failure = true;
            console.log('auth_failure');

        })
        
        this.client.on('disconnected', (reason) => {
            this.disconnected = true;
            console.log('disconnected');
        });
        
        this.client.on('authenticated', (session) => {
            if(!this.session){
                console.log('Se creó una nueva session');
            } else {
                console.log('Se usó la session pasada por parametro');
            }
            // Si la session no existe en la base de datos la guardamos
        });
        this.client.initialize();
    };
    async close(){
        await this.client.logout();
    }

}

let manager = new clientWrapper(
    {"WABrowserId":"\"syn2NEqiu10q0DhRHCHw6g==\"","WASecretBundle":"{\"key\":\"j+jNo2s+rbS6H0Yd7rfRjq7kUEIZ9e3NK90JQq+9hb0=\",\"encKey\":\"iF0ixeP3sN3XE4F3DxUD/8gDailyeusypYlQdQMIIUk=\",\"macKey\":\"j+jNo2s+rbS6H0Yd7rfRjq7kUEIZ9e3NK90JQq+9hb0=\"}","WAToken1":"\"qn1RBZOiisUO5rq/geHVDsa9Jr31uju9/9DrIop4ZsE=\"","WAToken2":"\"1@n4f5WTY+SY88oA1espkPPIztg++FVkGxYhYA3TSmXQhJoZ/ncepu1FCJi8OnVUIqi3cE/bLioSOkSg==\""}
);