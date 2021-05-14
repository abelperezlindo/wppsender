const cron = require('node-cron');
const manager = require('./manager');
const helper = require('../lib/helper');  

const task = cron.schedule('5 * * * * *', async () => {
    //console.clear();
    console.log('Corriendo cron');
    var message = await manager.getNextMessageToSend();
    if (!message) {
        console.log('No hay mensajes a enviar');
        return;
    }
    var session = await manager.getNotUsedInMoreTime()
    if (!session) {
        console.log('No hay sessiones disponibles');
        return;
    }
    var session = session.pop();
    var destino = helper.validarNumero(message.destino);

    if (destino === false) {
        console.log('Error en formato de numero destino, el mensaje no será enviado.');
        return;
    }
    var mensaje = message.mensaje;
    var send = await manager.sendMessage(session.session_data, destino, mensaje);
    if (!send) { return };
    await manager.setMessageSend(message.id, session.numero);
    console.log(`Mensaje ${mensaje} enviado desde ${session.numero} a ${destino}`);
    },
    {
        scheduled: false
    });

module.export = task;