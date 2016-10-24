const rx = require('rxjs');
const http = require('http');
const https = require('https');

const request = httpClient => (options, data) => new rx.Observable(obs => {
    const req = httpClient.request(options, resp => {
        resp.setEncoding('utf8');
        resp.on('data', chunk => {
            obs.next(chunk);
        });
        resp.on('end', () => {
            obs.complete();
        });
        resp.on('error', er => {
            obs.error(er);
        });
    });
    req.on('error', er => {
        obs.error(er);
        obs.complete();
    });
    if (data && options.method === 'POST') {
        req.write(data);
    }

    req.end();
});

module.exports = {
    request: request(http),
    secureRequest: request(https),
    createServer: http.createServer
};
