const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const app = require('express')();
const port = process.env.PORT || 3000;
const { generateRandomString, base64URLEncode, sha256 } = require('./utils');

app.use(cors({
    origin: process.env.FRONTEND_URI,
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'my-custom-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.get('/login', (req, res) => {
    const codeVerifier = generateRandomString();
    const codeChallenge = base64URLEncode(sha256(codeVerifier));

    req.session.codeVerifier = codeVerifier;

    const authUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.REALM}/protocol/openid-connect/auth` +
        `?response_type=code` +
        `&client_id=${process.env.CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256`;

    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const { code } = req.query;
    const codeVerifier = req.session.codeVerifier;

    if (!code || !codeVerifier) {
        return res.status(400).send(`Error during authentication.`);
    }

    const tokenEndpoint = `${process.env.KEYCLOAK_URL}/realms/${process.env.REALM}/protocol/openid-connect/token`;

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.CLIENT_ID);
    params.append('code', code);
    params.append('redirect_uri', process.env.REDIRECT_URI);
    params.append('code_verifier', codeVerifier);

    try {
        const tokenResponse = await axios.post(tokenEndpoint, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        req.session.tokenData = tokenResponse.data;
        res.redirect(process.env.REDIRECT_FRONTEND_URI);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Internal error during code exchange.`);
    }
});

const verifyToken = (req, res, next) => {
    if (!req.session.tokenData) {
        return res.status(401).send('Unauthorized: Not authenticated');
    }

    next();
};

app.get('/private-route', verifyToken, function (req, res) {
    res.send('This is a private endpoint.');
});

app.get('/check-auth', (req, res) => {
    res.json({ authenticated: !!req.session.tokenData });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error during logout');
        }

        const logoutUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.REALM}/protocol/openid-connect/logout` +
            `?post_logout_redirect_uri=${encodeURIComponent(process.env.REDIRECT_FRONTEND_URI) + 
            `&client_id=${process.env.CLIENT_ID}`}`;

        res.redirect(logoutUrl);
    });
});

app.listen(3000, function () {
    console.log(`App listening on port ${port}`);
});
