import fs from 'fs';
import express from 'express';

import * as Global from './backend/globals.js';
import { rocket_chat_url } from './backend/config.js';

const app = express();

app.use(express.json())
app.use(express.urlencoded())

app.use('/scripts/functions.js', express.static('frontend/functions.js'))

import { Session } from './backend/session.js';

const server =  app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });

// CORS setting
app.use((request, response, next) => {
  response.set('Access-Control-Allow-Origin', rocket_chat_url);
  response.set('Access-Control-Allow-Credentials', 'true');

  //request.query[Global.key_origin] = request.originalUrl.split('?')[0];
      
  if (Global.key_user_name in request.body) {
      request.query[Global.key_user_name] = request.body;
  }
  if (Global.key_user_password in request.body) {
      request.query[Global.key_user_password] = request.body[Global.key_user_password];
  }
  if (Global.key_auth_token in request.body) {
      request.query[Global.key_auth_token] = request.body[Global.key_auth_token];
  }

  next();
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

app.get('*',function (request, response) {
});