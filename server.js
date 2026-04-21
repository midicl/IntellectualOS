import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBareServer } from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const bare = createBareServer('/bare/');

app.use('/uv/', express.static(uvPath));
app.use(express.static(__dirname, { extensions: ['html'] }));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer();
server.on('request', (req, res) => {
  if (bare.shouldRoute(req)) bare.routeRequest(req, res);
  else app(req, res);
});
server.on('upgrade', (req, socket, head) => {
  if (bare.shouldRoute(req)) bare.routeUpgrade(req, socket, head);
  else socket.end();
});

const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`[server] listening on :${port}`));
