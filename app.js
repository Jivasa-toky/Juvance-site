const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Serve static files from the 'public' directory
app.use(express.static('images'));

// You can also specify a virtual path prefix
app.use('/static', express.static('images'));

// Using absolute path (recommended)
app.use('/assets', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send(`
    <h1>Static Files Example</h1>
    <img src="/1.jpg" alt="Logo">
    <link rel="stylesheet" href="/css/style.css">
    <script src="/js/script.js"></script>
  `);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
