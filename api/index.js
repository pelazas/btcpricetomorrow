require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Session setup (required for PKCE)
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://btcpricetomorrow.com' 
    : 'http://localhost:3000',
  credentials: true
}));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/predictions', require('./routes/predictionRoutes'));
app.use('/api/models', require('./routes/modelsRoutes'))
app.use('/api/votes', require('./routes/voteRoutes'))
app.use('/api/newsletter', require('./routes/newsletterRoutes'))
app.use('/api/auth', require('./routes/auth'))

app.get('/', (req, res) => {
  res.send('Server running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
