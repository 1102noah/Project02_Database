const mysql = require('mysql');
const bcrypt = require('bcrypt');

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to the MySQL server.');
    }
});

async function authenticateClient(email, password) {
    const query = "SELECT ClientID, password FROM Clients WHERE Email = ?"; // Use 'password' instead of 'PasswordHash'
    return new Promise((resolve, reject) => {
        connection.query(query, [email], async (err, results) => {
            if (err) {
                reject(err);
            } else if (results.length === 0) {
                resolve(false); // No client found
            } else {
                // Compare the provided password with the hashed password in the database
                const isMatch = await bcrypt.compare(password, results[0].password);
                resolve(isMatch ? results[0].ClientID : false); // Return ClientID if password matches
            }
        });
    });
}


function getClientById(clientId) {
    const query = "SELECT firstName, lastName, email, address FROM Clients WHERE ClientID = ?";
    return new Promise((resolve, reject) => {
        connection.query(query, [clientId], (err, results) => {
            if (err) {
                reject(err);
            } else if (results.length === 0) {
                reject(new Error('No client found'));
            } else {
                resolve(results[0]);
            }
        });
    });
}

module.exports = { authenticateClient, getClientById };
