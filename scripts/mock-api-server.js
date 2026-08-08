// Servidor mock local para pruebas E2E con Maestro.
// Replica los mismos endpoints que src/mocks/handlers.ts (usados por MSW en Jest),
// pero como un servidor HTTP real al que el emulador puede conectarse.
const http = require('http');

let tasks = [];
let nextId = 1;

const server = http.createServer((req, res) => {
  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };

  if (req.method === 'GET' && req.url === '/tasks') {
    return send(200, tasks);
  }

  if (req.method === 'POST' && req.url === '/tasks') {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      let title = '';
      try {
        ({ title } = JSON.parse(raw || '{}'));
      } catch {
        return send(400, { message: 'JSON inválido' });
      }
      const task = { id: String(nextId++), title, status: 'pending' };
      tasks.push(task);
      send(201, task);
    });
    return;
  }

  send(404, { message: 'Not found' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Mock API escuchando en http://localhost:${PORT}`);
  console.log(`Desde el emulador de Android, usa http://10.0.2.2:${PORT}`);
});
