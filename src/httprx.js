const rx = require('rxjs');
const http = require('http');

const request = options => new rx.Observable(obs => {
    const req = http.request(options, resp => {
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
    });

    req.end();
});

module.exports = {
    request: request
};
