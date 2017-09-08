const http = require('../httprx');

const stop = port => http.request({
    hostname: 'localhost',
    port: port,
    path: '/stop-server',
    method: 'GET'
});

module.exports = stop;
