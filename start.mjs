import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('.', import.meta.url)));
await import('./build.mjs');
const { default: worker } = await import('./dist/server/index.js');

const database = new DatabaseSync('campus-loop.sqlite');
database.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
for (const file of readdirSync('drizzle').filter(name => name.endsWith('.sql')).sort()) {
  if (database.prepare('SELECT 1 FROM local_migrations WHERE name = ?').get(file)) continue;
  database.exec('BEGIN');
  try {
    database.exec(readFileSync('drizzle/' + file, 'utf8'));
    database.prepare('INSERT INTO local_migrations VALUES (?)').run(file);
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

const password = process.env.ADMIN_PASSWORD || randomBytes(16).toString('hex');
const env = {
  ADMIN_PASSWORD: password,
  DB: {
    prepare(sql) {
      const query = database.prepare(sql);
      const bind = (...values) => ({
        first: () => query.get(...values),
        all: () => ({ results: query.all(...values) }),
        run: () => ({ meta: query.run(...values) })
      });
      return { ...bind(), bind };
    }
  }
};

createServer(async (incoming, outgoing) => {
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of incoming) {
      size += chunk.length;
      if (size > 16384) {
        outgoing.writeHead(413).end('Request too large');
        return;
      }
      chunks.push(chunk);
    }
    const url = new URL(incoming.url, 'http://localhost:3000');
    const body = ['GET', 'HEAD'].includes(incoming.method) ? undefined : Buffer.concat(chunks);
    const request = new Request(url, { method: incoming.method, headers: incoming.headers, body });
    const response = await worker.fetch(request, env);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    outgoing.writeHead(500).end('Local server error');
  }
}).listen(3000, 'localhost', () => {
  console.log('Campus Loop is running at http://localhost:3000');
  console.log('Admin portal: http://localhost:3000/admin');
  if (!process.env.ADMIN_PASSWORD) console.log('Local admin password: ' + password);
});
