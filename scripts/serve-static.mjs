import http from 'http';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.join(__dirname, '..', 'build');
const PORT = process.env.PORT || 5000;

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.woff': return 'font/woff';
    case '.woff2': return 'font/woff2';
    default: return 'application/octet-stream';
  }
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, `http://localhost`).pathname);
    let filePath = path.join(BUILD_DIR, urlPath);

    // if path is directory, serve index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      // fallback to SPA index
      filePath = path.join(BUILD_DIR, 'index.html');
    }

    const stream = fs.createReadStream(filePath);
    res.writeHead(200, {'Content-Type': contentType(filePath)});
    stream.pipe(res);
  } catch (err) {
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('Server error');
  }
});

server.listen(PORT, () => console.log(`Static server running at http://localhost:${PORT}`));

// keep process alive
process.on('SIGINT', () => process.exit());