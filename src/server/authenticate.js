const rx = require('rxjs');
const http = require('../httprx');

const auth = port => (user, pwd, mfa) => {
    const u = user.replace(/\+/g, '%2B');
    const options = {
        hostname: 'localhost',
        port: port,
        path: `/authenticate?user=${u}&pwd=${pwd}` + (mfa ? `&mfa=${mfa}` : ''),
        method: 'GET'
    };
    return http.request(options).catch(error => {
        if (error.code === 'ECONNREFUSED') {
            return rx.Observable.of(`Server is not running at port ${port}.`);
        }
        return rx.Observable.throw(error);
    });
};

module.exports = auth;
