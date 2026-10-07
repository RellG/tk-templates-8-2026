/** Static server for ./site. Usage: node serve.js [port] */
import http from 'http';
import fs from 'fs/promises';
import path from 'path';

const ROOT = path.resolve('./site');
const PORT = Number(process.argv[2]) || 4173;
const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.css': 'text/css' };

http.createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const rel = url === '/' ? 'index.html' : url.slice(1);
  const file = path.join(ROOT, rel);
  // Keep traversal inside ROOT.
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  try {
    const body = await fs.readFile(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<p>Not found. <a href="/">Back to index</a></p>');
  }
}).listen(PORT, () => console.log(`Serving ${ROOT} → http://localhost:${PORT}`));
