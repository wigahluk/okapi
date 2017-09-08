const http = require('../httprx');

const upload = (port, org, proxyName, bundle) => {
    const options = {
        hostname: 'localhost',
        port: port,
        path: `/api/organizations/${org}/apis/?action=import&name=${proxyName}`,
        method: 'POST',
        headers: {
            'content-type': 'application/octet-stream'
        }
    };
    return http.request(options, bundle, true)
        .map(response => JSON.parse(response))
        .map(proxyRevision => proxyRevision.revision);
};

module.exports = upload;