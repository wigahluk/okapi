const rx = require('rxjs');
const http = require('../httprx');

const upload = (port, org, proxyName, bundle) => {
    const options = {
        hostname: 'localhost',
        port: port,
        path: `/organizations/${org}/apis/?action=import&name=${proxyName}`,
        method: 'POST',
        headers: {
            'content-type': 'application/octet-stream'
        }
    };
    return http.request(options, bundle, true).catch(error => {
        if (error.code === 'ECONNREFUSED') {
            return rx.Observable.of(`Server is not running at port ${port}.`);
        }
        return rx.Observable.throw(error);
    }).map(r => JSON.parse(r))
        .map(r => r.revision);
};

module.exports = upload;