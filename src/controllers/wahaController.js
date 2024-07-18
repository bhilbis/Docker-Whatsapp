const axios = require('axios');
const notifier = require('node-notifier');

const WAHA_API_BASE_URL = 'http://localhost:3001/api';

let clients = [];

const addClient = (ws) => {
    clients.push(ws);
    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    })
}

const notifyClients = (message) => {
    clients.forEach(client => {
        client.send(JSON.stringify(message));
    })
}

const startSession = async (req, res) => {
    try {
        const response = await axios.post(`${WAHA_API_BASE_URL}/sessions/start`, req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error starting session:', error.message);
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
};

const stopSession = async (req, res) => {
    try {
        console.log('Stop session payload:', req.body);
        const response = await axios.post(`${WAHA_API_BASE_URL}/sessions/stop`, req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error stopping session:', error.message);  
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
};

const logoutSession = async (req, res) => {
    try {
        console.log('Logout session payload:', req.body);
        const response = await axios.post(`${WAHA_API_BASE_URL}/sessions/logout`, req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error logging out session:', error.message);
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
};

const screenshotSession = async (req, res) => {
    try {
        const { session } = req.query;
        console.log('Screenshot session:', session);
        const response = await axios.get(`${WAHA_API_BASE_URL}/screenshot?session=${session}`, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error('Error taking screenshot:', error.message);  
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
};

const getSessions = async (req, res) => {
    try {
        const { all } = req.query;
        const url = all ? `${WAHA_API_BASE_URL}/sessions?all=${all}` : `${WAHA_API_BASE_URL}/sessions`;
        const response = await axios.get(url);
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(error.response ? error.response.status: 500).send(error.response ? error.response.data : error.message);
    }
};

const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.body;
        const countryCode = chatId.split('@')[0].slice(0, 2);
        if (countryCode === '62') {
            if (chatId.startsWith('62')) {
                return res.status(400).send('Nomor international sudah terdeteksi');
            }
        }

        const response = await axios.post(`${WAHA_API_BASE_URL}/sendText`, req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error sending message:', error.message); 
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
};

const fetchLatestMessage = async (req, res) => {
    const { chatId, downloadMedia, limit, session } = req.query;
    
    try {
        const url = `${WAHA_API_BASE_URL}/messages?chatId=${chatId}&downloadMedia=${downloadMedia}&limit=${limit}&session=${session}`;
        const response = await axios.get(url);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error fetching latest message :', error.message);
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
}

let message = [];

const handleWebhook = (req, res) => {
    console.log('Webhook received : ', JSON.stringify(req.body, null, 2));

    if (req.body.event === 'message') {
        const messageData = req.body.payload;
        const messageText = messageData.body;
        const sender = messageData.from;

        console.log(`Received message from ${sender}: ${messageText}`);

        sendNotification(sender, messageText);

        message.push({
            sender: sender,
            message: messageText,
            timestamp: messageData.timestamp,
        });

        notifyClients({
            sender: sender,
            message: messageText,
            timestamp: messageData.timestamp,
        });
    } else if (req.body.event === 'session.status') {
        console.log('Session status :', req.body.payload.status)
    }
    res.status(200).send('Webhook received');
};

const getMessage = (req, res) => {
    res.status(200).json(message);
}

const sendNotification = (sender, message) => {
    notifier.notify({
        title: 'New Whatsapp Message',
        message: `from: ${sender}\nMessage: ${message}`,
        sound: true,
        wait: true
    });
};

module.exports = {
    startSession,
    stopSession,
    logoutSession,
    getSessions,
    screenshotSession,
    sendMessage,
    fetchLatestMessage,
    handleWebhook,
    getMessage,
    addClient,
};
