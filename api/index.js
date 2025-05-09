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
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.btcpricetomorrow.com' : undefined,
    maxAge: 1000 * 60 * 60 // 1 hour
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

// Routes
app.use('/api/predictions', require('./routes/predictionRoutes'));
app.use('/api/models', require('./routes/modelsRoutes'))
app.use('/api/votes', require('./routes/voteRoutes'))
app.use('/api/newsletter', require('./routes/newsletterRoutes'))
app.use('/api/auth', require('./routes/auth'))

app.get('/', (req, res) => {
  res.send('Server running!');
});

app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Cookies:', req.headers.cookie);
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
