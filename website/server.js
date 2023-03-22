import fs from 'fs';

import express from 'express';
const app = express();

app.use(express.json())
app.use(express.urlencoded())

app.use('/scripts/functions.js', express.static('frontend/functions.js'))

import { Session } from './backend/session.js';

const server =  app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });

app.get('/', function (request, response) {
  response.set('Content-Type', 'text/html');
  fs.createReadStream('frontend/radio.html').pipe(response);
});

app.post('/login', function (request, response) {
  Session.login(request, response);
});

app.post('/verify', function (request, response) {
  Session.verify(request, response);
});

// just render the form for the user authenticate with us
app.get('/login', function (request, response) {
  response.set('Content-Type', 'text/html');
  fs.createReadStream('frontend/login.html').pipe(response);
});