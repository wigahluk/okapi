const rx = require('rxjs');
const http = require('../httprx');

const stop = port => {
    const options = {
        hostname: 'localhost',
        port: port,
        path: '/kill',
        method: 'GET'
    };
    return http.request(options).catch(error => {
        if (error.code === 'ECONNREFUSED') {
            return rx.Observable.of(`Server is not running at port ${port}.`);
        }
        return rx.Observable.throw(error);
    });
};

module.exports = stop;
