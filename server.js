const http = require('http');
const https = require('https');

const TARGET = 'https://moysklad-mcp.onrender.com';
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Content-Length': body.length
      }
    };
    const proxyReq = https.request(TARGET + req.url, options, proxyRes => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      proxyRes.pipe(res);
    });
    proxyReq.on('error', err => {
      res.writeHead(502);
      res.end(JSON.stringify({ error: err.message }));
    });
    if (body.length) proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PORT, () => console.log('CORS proxy listening on ' + PORT));
