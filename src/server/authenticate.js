const rx = require('rxjs');
const http = require('../httprx');
const readLine = require('../readlinerx');

const auth = port => (user, pwd, mfa) => {
    return rx.Observable.of({ port: port, user: user, pwd: pwd, mfa: mfa})
        .flatMap(conf => {
            // get user name:
            if (!conf.user) {
                return readLine.readLine('User Name:')
                    .map(un => un.replace(/\+/g, '%2B'))
                    .map(un => {
                        if (!un) throw new Error('User Name should have a value.');
                        conf.user = un;
                        return conf;
                    })
            }
            return rx.Observable.of(conf);
        })
        .flatMap(conf => {
            // get PWD:
            if (!conf.pwd) {
                return readLine.readHidden('Password:').map(p => {
                    if (!p) throw new Error('Password should have a value.');
                    conf.pwd = p;
                    return conf;
                })
            }
            return rx.Observable.of(conf);
        })
        .flatMap(conf => {
            // get MFA:
            if (!conf.mfa) {
                return readLine.readHidden('MFA (If you don\'t have it, leave it empty):').map(m => {
                    console.log('\n');
                    if (m) conf.mfa = m;
                    return conf;
                })
            }
            return rx.Observable.of(conf);
        })
        .map(conf => {
            return {
                hostname: 'localhost',
                port: conf.port,
                path: `/authenticate?user=${conf.user}&pwd=${conf.pwd}` + (conf.mfa ? `&mfa=${conf.mfa}` : ''),
                method: 'GET'
            };
        })
        .flatMap(conf =>
            http.request(conf).catch(error => {
                if (error.code === 'ECONNREFUSED') {
                    return rx.Observable.of(`Server is not running at port ${port}.`);
                }
                return rx.Observable.throw(error);
            })
        );
};

module.exports = auth;
