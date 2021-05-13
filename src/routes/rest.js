
import { Router } from "express";
const router = Router();

router.get('/messages', async (req, res) => {
    const rows = await manager.getMessagesInQueue();
    res.render('session/messages', { rows });
});
app.post('/messages/add', async (req, res) => {

    const { destino, mensaje } = req.body;
    if (destino === undefined || mensaje === undefined) {
        res.redirect('/messages');
    }
    const newMessage = {
        destino,
        mensaje,
        enviado: '0',
        anulado: '0',
        prioridad: '1'
    };
    await pool.query("INSERT INTO io_turno_mensaje SET ?", [newMessage]);

    res.redirect('/messages');
});
router.get('/sessions', async (req, res) => {
    const rowsg = await manager.getSavedSessions();
    res.render('session/sessions', { rowsg });
});

router.get('/sessions/add', async (req, res) => {
    if (!qrForAuth) {
        manager.createClient();
        await setTimeout(() => { }, 3000);
        qrForAuth = true;
        res.redirect('/sessions/qr');
    } else {
        res.redirect('/sessions/qr');
    }

});

router.get('/sessions/qr', async (req, res) => {

    await setTimeout(() => { }, 3000);
    res.render('session/qr');

});
router.get('/cron/start', async (req, res) => {
    message = '';
    if (!cronStatus) {
        task.start();
        message = 'Cron se esta iniciando.'
        cronStatus = true;
    } else {
        message = 'Cron se esta iniciando.'
    }
    console.log(message);
    res.redirect('/',);

});
router.get('/cron/stop', async (req, res) => {
    let message = '';
    if (cronStatus) {
        task.stop();
        message = 'Cron se detendrá.'
        cronStatus = false;
    } else {
        message = 'Cron ya se ha detenido.'
    }
    console.log(message);
    res.redirect('/',);
});
router.get('/', async (req, res) => {
    const message = req.app.get('message_user');
    res.render('front', { cronStatus });
});

export default router;