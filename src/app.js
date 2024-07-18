const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const wahaController = require('./controllers/wahaController');
const expressWs = require('express-ws');

const app = express();
const port = 4000;

expressWs(app);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/sendMessage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sendMessage.html'));
})

//Web Socket
app.ws('/websocket', (ws, req) => {
    console.log('WebSocket connection established');
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
    wahaController.addClient(ws)
})

app.post('/webhook', wahaController.handleWebhook)

//sessions
app.post('/api/sessions/start', wahaController.startSession);
app.post('/api/sessions/stop', wahaController.stopSession);
app.post('/api/sessions/logout', wahaController.logoutSession);
app.get('/api/sessions', wahaController.getSessions);
//login screenshots
app.get('/api/screenshot', wahaController.screenshotSession);
//send sessions
app.post('/api/sendText', wahaController.sendMessage);
app.get('/api/messages', wahaController.fetchLatestMessage)
//End point get messages
app.get('/api/messages', wahaController.getMessage)

app.listen(port, () =>{
    console.log(`Server running at http://localhost:${port}/`);
});