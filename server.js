const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const publicDir = path.join(__dirname, 'public');
const dataFile = path.join(__dirname, 'server.json');

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.css':  return 'text/css; charset=utf-8';
    case '.js':   return 'application/javascript; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.png':  return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg':  return 'image/svg+xml';
    case '.ico':  return 'image/x-icon';
    default:      return 'application/octet-stream';
  }
}

const server = http.createServer((req, res) => {
  let filePath = '';

// Simple logging
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);

  // ---- API: Save contact (POST /api/contact) ----
  if (req.method === 'POST' && req.url === '/api/contact') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      // Try parse JSON body
      let payload;
      try {
        payload = JSON.parse(body || '{}');
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
      }
  const { name, email, message } = payload;
      if (!name || !email || !message) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'Missing fields' }));
      }

      const entry = {
        id: Date.now(),
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
      };

      // Read -> append -> write
      fs.readFile(dataFile, 'utf8', (readErr, content) => {
        let current = [];
        if (!readErr && content) {
          try { current = JSON.parse(content); } catch { current = []; }
        }
current.push(entry);

        fs.writeFile(dataFile, JSON.stringify(current, null, 2), (writeErr) => {
          if (writeErr) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: false, error: 'Failed to write file' }));
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, saved: entry }));
        });
      });
    });
    return; // Important: stop further handling
  }

  // ---- API: List contacts (GET /api/contact) ----
  if (req.method === 'GET' && req.url === '/api/contact') {
    fs.readFile(dataFile, 'utf8', (err, content) => {
let list = [];
      if (!err && content) {
        try { list = JSON.parse(content); } catch { list = []; }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(list));
    });
    return;
  }

  // ---- Static file serving from /public ----
  // Map URL to file in public/. Default: index.html
  let filePaths = path.join(publicDir, req.url === '/' ? 'index.html' : req.url);

  // If URL has no extension (e.g., /about), assume .html
  if (!path.extname(filePaths)) {
    filePaths += '.html';
  }

// Prevent path traversal (e.g., "../../etc/passwd")
  const normalized = path.normalize(filePaths);
  if (!normalized.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }


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

if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end('<h1>404 - Not Found</h1>');
      }
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Server Error');
    }
    res.writeHead(200, { 'Content-Type': contentTypeFor(normalized) });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
