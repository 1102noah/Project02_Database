require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dbService = require('./dbService');

const app = express();
const PORT = 5050; // Backend port

// CORS Configuration
const corsOptions = {
    origin: 'http://localhost', // Allow requests from the frontend
    credentials: true // Allow cookies to be sent
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Routes
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const clientId = await dbService.authenticateClient(email, password);
        if (clientId) {
            req.session.clientId = clientId;
            console.log("Session after signin:", req.session);
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during authentication:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.get('/getClientData', (req, res) => {
    console.log("Session during getClientData:", req.session);
    if (!req.session.clientId) {
        return res.status(401).send('Unauthorized');
    }

    dbService.getClientById(req.session.clientId)
        .then(client => res.json(client))
        .catch(error => {
            console.error('Error fetching client data:', error);
            res.status(500).send('Internal Server Error');
        });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
