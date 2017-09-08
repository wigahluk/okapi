const http = require('../httprx');

const status = port => http.request({
    hostname: 'localhost',
    port: port,
    path: '/status',
    method: 'GET'
});

module.exports = status;
