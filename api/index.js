const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 8000;

// Only connect and start server here
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
