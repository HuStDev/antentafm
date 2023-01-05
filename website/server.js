import fs from 'fs';

import express from 'express';
const app = express();

app.use(express.json())
app.use(express.urlencoded())

import { Session } from './backend/session.js';

const server =  app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/login', function (request, response) {
  Session.login(request, response);
});

// just render the form for the user authenticate with us
app.get('/login', function (request, response) {
  response.set('Content-Type', 'text/html');
  fs.createReadStream('frontend/login.html').pipe(response);
});