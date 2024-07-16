const axios = require('axios');

const WAHA_API_BASE_URL = 'http://localhost:3001/api';

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
        console.log('Stop session payload:', req.body);  // Logging payload for debugging
        const response = await axios.post(`${WAHA_API_BASE_URL}/sessions/stop`, req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error stopping session:', error.message);  // Logging error message
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
};

const logoutSession = async (req, res) => {
    try {
        console.log('Logout session payload:', req.body);  // Logging payload for debugging
        const response = await axios.post(`${WAHA_API_BASE_URL}/sessions/logout`, req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error logging out session:', error.message);  // Logging error message
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
};

const screenshotSession = async (req, res) => {
    try {
        const { session } = req.query;
        console.log('Screenshot session:', session);  // Logging session for debugging
        const response = await axios.get(`${WAHA_API_BASE_URL}/screenshot?session=${session}`, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error('Error taking screenshot:', error.message);  // Logging error message
        res.status(error.response ? error.response.status : 500).send(error.message);
    }
};

const getSessions = async (req, res) => {
    try {
        const { all } = req.query();
        const url = all ? `${WAHA_API_BASE_URL}/sessions?all=${all}` : `${WAHA_API_BASE_URL}/sessions`;
        const response = await axios.get(url);
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(error.response ? error.response.status: 500).send(error.message);
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
        res.status(error.response ? error.response.status : 500).send(error.message);
    }
};

const sendPoll = async (req,res) => {
    try {
        const response = await axios.post(`${WAHA_API_BASE_URL}/sendPoll`, req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error sending poll:', error.message);
        res.status(error.response ? error.response.status : 500).send(error.message);
    }
}

module.exports = {
    startSession,
    stopSession,
    logoutSession,
    getSessions,
    screenshotSession,
    sendMessage,
    sendPoll,
};
