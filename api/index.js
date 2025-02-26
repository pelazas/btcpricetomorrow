
const express = require('express');

const app = express();

const PORT = 8000;

app.get('/', (req, res) => {
  res.send('Server running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});