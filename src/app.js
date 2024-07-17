const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const wahaController = require('./controllers/wahaController');
const notifier =  require('node-notifier')
const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/sendMessage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sendMessage.html'));
})

app.get('/sendPoll',(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sendPoll.html'));
})

function sendNotification(sender, message) {
    notifier.notify({
        title: 'New WhatsApp Message',
        message: `From: ${sender}\nMessage: ${message}`,
        sound: true,
        wait: true
    })
}

app.post('/webhook', wahaController.handleWebhook)

//sessions
app.post('/api/sessions/start', wahaController.startSession);
app.post('/api/sessions/stop', wahaController.stopSession);
app.post('/api/sessions/logout', wahaController.logoutSession);
app.post('/api/sessions', wahaController.getSessions);
//login screenshots
app.post('/api/screenshot', wahaController.screenshotSession);
//send sessions
app.post('/api/sendText', wahaController.sendMessage);
app.post('/api/sendPoll', wahaController.sendPoll);

app.listen(port, () =>{
    console.log(`Server running at http://localhost:${port}/`);
});