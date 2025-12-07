const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const server = http.createServer((req, res) => {
    // Normalize URL (remove query params)
    let urlPath = req.url === '/' ? '/index' : req.url;

    // Build file path
    let filePath = path.join(__dirname, 'public', urlPath);

    app.get('/', (req,res) => {
     res.send('Get request to home page');
    })

    let ext = path.extname(filePath);

    // If no extension, assume .html
    if (!ext) {
        filePath += '.html';
        ext = '.html';
    }

    // Set content type
    let contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.js') contentType = 'text/javascript';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

    // Read and serve file
    fs.readFile(filePath, (err, content) => {
        if (err) {
    fs.readFile(path.join(__dirname, 'public', '404.html'), (error404, content404) => {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(error404 ? '404 Page Not Found' : content404);
    })
     } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
app.listen(PORT, () => {
  console.log(`Example app running at http://localhost:${PORT}`)
});
