// Required dependencies
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware to parse JSON data and handle CORS (Cross-Origin Resource Sharing)
app.use(bodyParser.json());
app.use(cors());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test',
});

// Connect to the MySQL database
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Start the server and listen on port 5001
app.listen(5001, () => {
  console.log('Server is running on port 5001');
});

// User registration route
app.post('/register', async (req, res) => {
  const { FirstName, LastName, Address, CreditCardInfo, PhoneNumber, Email, password } = req.body;

  if (!Email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const query = `INSERT INTO Clients (FirstName, LastName, Address, CreditCardInfo, PhoneNumber, Email, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [FirstName, LastName, Address, CreditCardInfo || null, PhoneNumber, Email, hashedPassword];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Database error:', err.message, err.sqlMessage);  // Log detailed error
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Registration failed', error: err.message });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request', error });
  }
});

// User login route
app.post('/login', (req, res) => {
  const { Email, password } = req.body;

  if (!Email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM Clients WHERE Email = ?';
  db.query(query, [Email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ ClientID: user.ClientID, Email: user.Email }, 'your_jwt_secret', { expiresIn: '3h' });

    res.json({ token });
  });
});

// Middleware function to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];  // Get the token from the 'Authorization' header

  if (!token) return res.status(401).json({ message: 'Access denied' });  // If no token is provided, deny access

  // Verify the JWT token
  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });  // If the token is invalid, send a 403 error
    req.user = user;  // Store the decoded user data in the request object
    next();  // Proceed to the next middleware/route handler
  });
};

// Protected route that requires JWT authentication
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the dashboard. You are authenticated!' });  // Send a success message if authentication is valid
});

app.get('/profile', authenticateToken, (req, res) => {
  const clientId = req.user.ClientID;  // Extract ClientID from the decoded JWT token

  // Query the database to get the user data based on the ClientID
  db.query('SELECT FirstName, LastName, Email FROM Clients WHERE ClientID = ?', [clientId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: 'User not found' });  // Send error if user not found
    }

    // Send user profile data as response
    res.json({
      FirstName: result[0].FirstName,
      LastName: result[0].LastName,
      Email: result[0].Email,
    });
  });
});
