import fs from 'fs';
import express from 'express';

const app = express();

app.use(express.json())
app.use(express.urlencoded())

app.use('/scripts/functions.js', express.static('frontend/functions.js'))

import { Session } from './backend/session.js';
import { Radio } from './backend/radio.js';

const server =  app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });

// CORS setting
app.use((request, response, next) => {
  Session.use(request, response, next);
});

app.post('/login', function (request, response) {
  Session.login(request, response);
});

app.get('/login', function (request, response) {
  response.set('Content-Type', 'text/html');
  fs.createReadStream('frontend/login.html').pipe(response);
});

app.post('/sso', function (request, response) {
  Session.sso(request, response);
});

app.get('/', function (request, response) {
  response.set('Content-Type', 'text/html');
  fs.createReadStream('frontend/radio.html').pipe(response);
});

app.post('/radio', function (request, response) {
  Radio.handle(request, response);
});

app.post('')

app.get('*',function (request, response) {
});
