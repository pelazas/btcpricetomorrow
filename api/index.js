// Import Express
const express = require('express');

// Create Express app
const app = express();

// Define port
const PORT = 8000;

// Basic GET endpoint
app.get('/', (req, res) => {
  res.send('Server running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});