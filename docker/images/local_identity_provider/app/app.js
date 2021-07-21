const Provider = require('oidc-provider');
const pem2jwk = require('pem-jwk').pem2jwk
const config = require('dotenv').config;
const readFileSync = require('fs').readFileSync;
const createServer = require('https').createServer;

config();
var pem = readFileSync(process.env.TLS_KEY);
var jwk = pem2jwk(pem);

const oidc = new Provider(process.env.ISSUER, {
    ttl: {
        /* for demonstration purposes 1 year in seconds */
        IdToken: 3600 * 24 * 365
    },
    jwks: {
        keys: [jwk],
    },
    clients: [{
        client_id: process.env.CLIENT_ID,
        token_endpoint_auth_method: 'none',
        redirect_uris: [process.env.LOGIN_REDIRECT],
        post_logout_redirect_uris: [process.env.LOGOUT_REDIRECT],
        response_types: ['id_token', 'code'],
        grant_types: ['implicit', 'authorization_code'],
        application_type: 'web'
    }],
    grant_types: ['implicit', 'authorization_code']
});
createServer({
    key: readFileSync(process.env.TLS_KEY),
    cert: readFileSync(process.env.TLS_CERT),
}, oidc.callback).listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT} with https`);
});
