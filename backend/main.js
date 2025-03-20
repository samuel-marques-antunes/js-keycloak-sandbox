const session = require('express-session');
const Keycloak = require('keycloak-connect');
const cors = require('cors');
const express = require('express');
const app = express();

const keycloak = new Keycloak({
    store: new session.MemoryStore()
});

app.use(cors({
    origin: 'http://localhost:63342',
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(keycloak.middleware());

app.get('/', function (req, res) {
    res.send('This is a public endpoint.');
});

app.get('/protected', keycloak.protect(), function (req, res) {
    res.send('This is a private endpoint.');
});

app.get('/protected-for-special-role', keycloak.protect('realm:superuser'), function (req, res) {
    res.send('This is a private endpoint for special role.');
});

app.listen(3000, function () {
    console.log('App listening on port 3000');
});
