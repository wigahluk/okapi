const rx = require('rxjs');
const http = require('http');
const https = require('https');

const request = httpClient => (options, data, isBinary) => new rx.Observable(obs => {
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
        if (!isBinary) {
            req.write(data);
            req.end();
        } else {
            data.pipe(req)
                .on('error', error => {
                    consoe.log(error);
                })
                .on('finish', () => {
                    req.end();
                });
        }
    } else {
        req.end();
    }


});

const proxy = httpClient => (req, res, endpoint, basePath, token) => {
    const headers = req.headers;
    headers['Authorization'] = `Bearer ${token}`;
    headers['host'] = endpoint;

    const opts = {
        hostname: endpoint,
        port: 443,
        path: basePath + req.url,
        method: req.method,
        headers: headers
    };

    const proxyRequest = httpClient.request(opts, proxyResponse => {
        proxyResponse.on('data', chunk => {
            res.write(chunk, 'binary');
        });
        proxyResponse.on('end', () => {
            res.end()
        });
        proxyResponse.on('error', er => {
            throw new Error('Error processing response: ' + er.message);
        });
        res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    });
    req.on('data', function(chunk) {
        proxyRequest.write(chunk, 'binary');
    });
    req.on('end', function() {
        proxyRequest.end();
    });
};

module.exports = {
    request: request(http),
    secureRequest: request(https),
    createServer: http.createServer,
    proxy: proxy(http),
    secureProxy: proxy(https)
};
