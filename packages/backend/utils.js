const crypto = require('crypto');

function generateRandomString(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

function base64URLEncode(str) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
}

module.exports = {
    generateRandomString,
    base64URLEncode,
    sha256
};