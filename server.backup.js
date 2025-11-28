const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  let filePath = '';
  
  // Simple routing
  if (req.url === '/' || req.url === '/home') {
    filePath = path.join(__dirname, 'public', 'index.html');
  } else if (req.url === '/about') {
    filePath = path.join(__dirname, 'public', 'about.html');
  } else if (req.url === '/contact') {
    filePath = path.join(__dirname, 'public', 'contact.html');
  } else {
    filePath = path.join(__dirname, 'public', '404.html');
  }

// Read and serve the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
