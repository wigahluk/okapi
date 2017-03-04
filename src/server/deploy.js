const rx = require('rxjs');
const http = require('../httprx');

const deploy = (port, org, proxyName, environment, revision) => {
    const options = {
        hostname: 'localhost',
        port: port,
        path: `/api/organizations/${org}/environments/${environment}/apis/${proxyName}/revisions/${revision}/deployments?override=true`,
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    };
    return http.request(options)
        .catch(error => {
            if (error.code === 'ECONNREFUSED') {
                return rx.Observable.of(`Server is not running at port ${port}.`);
            }
            return rx.Observable.throw(error);
        })
        .map(r => JSON.parse(r))
        .map(r => {
            if (r.code) {
                throw r;
            }
            return r.environment;
        });
};

module.exports = deploy;
