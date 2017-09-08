const rx = require('rxjs');
const http = require('../httprx');
const readLine = require('../readlinerx');

const auth = port => (user, pwd, mfa) => rx.Observable.of({ port: port, user: user, pwd: pwd, mfa: mfa})
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
        // get password:
        if (!conf.pwd) {
            return readLine.readHidden('Password:').map(password => {
                if (!password) throw new Error('Password should have a value.');
                conf.pwd = password;
                return conf;
            })
        }
        return rx.Observable.of(conf);
    })
    .flatMap(conf => {
        // get MFA:
        if (!conf.mfa) {
            return readLine.readHidden('MFA (If you don\'t have it, leave it empty):').map(mfa => {
                console.log('\n');
                if (mfa) conf.mfa = mfa;
                return conf;
            })
        }
        return rx.Observable.of(conf);
    })
    .map(conf => {
        // Remove MFA it it was set by the CLI tool.
        if (conf.mfa === '_environment') { conf.mfa = undefined; }
        return {
            hostname: 'localhost',
            port: conf.port,
            path: `/authenticate?user=${conf.user}&pwd=${conf.pwd}` + (conf.mfa ? `&mfa=${conf.mfa}` : ''),
            method: 'GET'
        };
    })
    .flatMap(conf => http.request(conf));

module.exports = auth;
