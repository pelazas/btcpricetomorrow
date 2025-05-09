require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const MongoStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 8000;

console.log('NODE_ENV:', process.env.NODE_ENV);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Session setup (required for PKCE)
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    autoRemove: 'interval',
    autoRemoveInterval: 60 // Remove expired sessions every 60 minutes
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none',
    domain: 'btcpricetomorrow.com',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://btcpricetomorrow.com', 'https://www.btcpricetomorrow.com'] 
  : ['http://localhost:3000'];

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['set-cookie'] // Add this line
  }));


// Connect to MongoDB
connectDB();

// Add before your routes
app.use((req, res, next) => {
  if (!req.session) {
    return res.status(500).send('Session initialization failed');
  }
  next();
});

app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Cookies:', req.headers.cookie);
  next();
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin || allowedOrigins[0]);
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

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
