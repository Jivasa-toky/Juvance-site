
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const publicDir = path.join(__dirname, 'public');

// Ensure data directory & file exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dataFile = path.join(dataDir, 'server.json');
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, '[]');
}

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
const logFile = path.join(logsDir, 'app.log');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper: write logs to logs/app.log
function logLine(line) {
  const ts = new Date().toISOString();
  fs.appendFile(logFile, `${ts} ${line}\n`, () => {});
}

// Content-Type helper
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
  const reqInfo = `${req.method} ${req.url}`;
  console.log(reqInfo);
  logLine(reqInfo);

  // ---- API: Save contact (POST /api/contact) ----
  if (req.method === 'POST' && req.url === '/api/contact') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      let payload;
      try {
        payload = JSON.parse(body || '{}');
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
      }

      const { name, email, message } = payload;
      if (!name || !email || !message) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'Missing fields' }));
      }

      const entry = { id: Date.now(), name, email, message, createdAt: new Date().toISOString() };

      fs.readFile(dataFile, 'utf8', (readErr, content) => {
        let current = [];
        if (!readErr && content) {
          try { current = JSON.parse(content); } catch { current = []; }
        }
        current.push(entry);

        fs.open(dataFile, 'w', (openErr, fd) => {
          if (openErr) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: false, error: 'Failed to open data file' }));
          }

          const updated = Buffer.from(JSON.stringify(current, null, 2));
          fs.write(fd, updated, 0, updated.length, null, (writeErr) => {
            if (writeErr) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ ok: false, error: 'Failed to write data file' }));
            }
            fs.close(fd, (closeErr) => {
              if (closeErr) console.error('Close error:', closeErr);
              logLine(`Saved contact id=${entry.id}`);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true, saved: entry }));
            });
          });
        });
      });
    });
    return;
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

  // ---- Static file serving ----
  let filePath = path.join(publicDir, req.url === '/' ? 'index.html' : req.url);
  if (!path.extname(filePath)) filePath += '.html';

  const normalized = path.normalize(filePath);
  if (!normalized.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  fs.readFile(normalized, (err, content) => {
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
  logLine(`Server started on port ${PORT}`);
});

