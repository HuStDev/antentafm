import fs from 'fs';
import express from 'express';

import * as Config from './backend/config.js';
import * as Global from './backend/globals.js';

const app = express();

app.use(express.json())
app.use(express.urlencoded())

app.use('/scripts/functions.js', express.static('frontend/functions.js'))
app.use('/scripts/config.js', express.static('frontend/config.js'))
app.use('/template/recordings.html', express.static('frontend/recordings.html'))
app.use('/scripts/dummy.mp3', express.static('frontend/dummy.mp3'))
app.use('/recordings', express.static('recordings/'))

import { Session } from './backend/session.js';
import { Radio } from './backend/radio.js';

const radio = new Radio();

const server =  app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });

// CORS setting
app.use((request, response, next) => {
  Session.use(request, response, next);
});

app.get('/chat', function (request, response) {
  response.set('Content-Type', 'text/html');
  fs.createReadStream('frontend/chat.html').pipe(response);
});

app.post('/login', function (request, response) {
  Session.login(request, response);
});

app.get('/login', function (request, response) {
  response.set('Content-Type', 'text/html');
  fs.createReadStream('frontend/login.html').pipe(response);
});

app.post('/logout', function (request, response) {
  Session.logout(request, response);
});

app.post('/register', function (request, response) {
  Session.register(request, response);
});

app.get('/register', function (request, response) {
  response.set('Content-Type', 'text/html');
  fs.createReadStream('frontend/register.html').pipe(response);
});

app.post('/password', function (request, response) {
  Session.change_password(request, response);
});

app.get('/password', function (request, response) {
  response.set('Content-Type', 'text/html');
  fs.createReadStream('frontend/password.html').pipe(response);
});

app.post('/sso', function (request, response) {
  Session.sso(request, response);
});

app.post('/chat_token', function (request, response) {
  Session.chat_token(request, response);
});

app.get('/', function (request, response) {
  response.set('Content-Type', 'text/html');
  fs.createReadStream('frontend/radio.html').pipe(response);
});

app.post('/radio', function (request, response) {
  radio.handle(request, response);
});

app.post('/radio_info', function (request, response) {
  radio.info(response);
});

app.post('')

app.get('*',function (request, response) {
});
