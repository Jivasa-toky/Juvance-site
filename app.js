const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
// Respond to GET request on the root route>

app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.json()); // for JSON data

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Respond to POST request on the root route
app.post('/', (req, res) => {
  const name = req.body.username;
  const password = req.body.password;
  res.send('We receive your login info');
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
