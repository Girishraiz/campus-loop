import {mkdirSync, readFileSync, writeFileSync, existsSync} from 'node:fs';
const read = path => readFileSync(path, 'utf8');
const hero = existsSync('src/hero.jpg') ? readFileSync('src/hero.jpg').toString('base64') : '';
mkdirSync('dist/server', {recursive:true});
writeFileSync('dist/server/index.js',
  'const page = '+JSON.stringify(read('src/index.html'))+';\n'+
  'const adminPage = '+JSON.stringify(read('src/admin.html'))+';\n'+
  'const events = '+read('src/events.json').trim()+';\n'+
  'const hero = '+JSON.stringify(hero)+';\n'+read('src/admin-api.js')+'\n'+read('src/worker.js'));
