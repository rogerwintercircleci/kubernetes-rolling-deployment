'use strict';

const http = require('http');

const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || '1.0.0';
const HOSTNAME = process.env.HOSTNAME || 'unknown';

function renderPage() {
  const shortVersion = VERSION.length > 12 ? VERSION.slice(0, 7) : VERSION;
  const timestamp = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rolling Deployment Demo</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f1117;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #1a1d27;
      border: 1px solid #2a2d3e;
      border-radius: 16px;
      padding: 52px 48px;
      width: 100%;
      max-width: 500px;
      margin: 24px;
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 100px;
      padding: 6px 18px;
      font-size: 12px;
      font-weight: 600;
      color: #818cf8;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 28px;
    }
    .dot {
      width: 7px;
      height: 7px;
      background: #818cf8;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
    h1 {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 13px;
      color: #6b7080;
      margin-bottom: 40px;
      letter-spacing: 0.04em;
    }
    .meta {
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-align: left;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #12141d;
      border: 1px solid #1e2130;
      border-radius: 8px;
      padding: 13px 16px;
    }
    .label {
      font-size: 12px;
      font-weight: 500;
      color: #6b7080;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .value {
      font-family: 'SF Mono', 'Fira Code', 'Fira Mono', monospace;
      font-size: 12px;
      color: #c8cde0;
    }
    .footer {
      margin-top: 36px;
      font-size: 11px;
      color: #3a3d52;
    }
    .footer a {
      color: #4a5080;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="dot"></span>
      Deployment Successful
    </div>
    <h1>Rolling Deployment Demo</h1>
    <p class="subtitle">Kubernetes &nbsp;·&nbsp; CircleCI &nbsp;·&nbsp; Node.js &nbsp;·&nbsp; v4</p>
    <div class="meta">
      <div class="row">
        <span class="label">Version</span>
        <span class="value">${shortVersion}</span>
      </div>
      <div class="row">
        <span class="label">Pod</span>
        <span class="value">${HOSTNAME}</span>
      </div>
      <div class="row">
        <span class="label">Timestamp</span>
        <span class="value">${timestamp}</span>
      </div>
    </div>
    <p class="footer">
      <a href="https://github.com/rogerwintercircleci/kubernetes-rolling-deployment">
        rogerwintercircleci/kubernetes-rolling-deployment
      </a>
    </p>
  </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET') {
    res.writeHead(405);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderPage());
    return;
  }

  // Keep JSON API endpoint for programmatic access
  if (req.url === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      version: VERSION,
      hostname: HOSTNAME,
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`rolling-tutorial-app v${VERSION} listening on port ${PORT}`);
});
