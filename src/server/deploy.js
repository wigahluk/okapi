const http = require('../httprx');

const deploy = (port, org, proxyName, environment, revision) => {
    const options = {
        hostname: 'localhost',
        port: port,
        path: `/api/organizations/${org}/environments/${environment}` +
              `/apis/${proxyName}/revisions/${revision}/deployments?override=true`,
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    };
    return http.request(options)
        .map(r => JSON.parse(r))
        .map(r => r.environment);
};

module.exports = deploy;
