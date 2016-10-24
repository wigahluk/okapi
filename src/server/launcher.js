const rx = require('rxjs');
const cp = require('child_process');
const readline = require('readline');
const fs = require('fs');
const http = require('../httprx');

const readrx = question => new rx.Observable(obs => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(question + ' ', (answer) => {
        rl.close();
        obs.next(answer);
        obs.complete();
    });
});


const launch = conf => {
    const out = fs.openSync('./logs/out.log', 'a');
    const err = fs.openSync('./logs/out.log', 'a');
    const child = cp.spawn(
        'node',
        ['./src/server/main.js', '-p', conf.port, '--sso', conf.ssoEndpoint],
        { detached: true, stdio: ['ignore', out, err] }
    );
    child.unref();

    return rx.Observable.of(`Okapi server has been launched at port ${conf.port}`);
};

const authenticate = () => {
    return readrx('Apigee User:')
        .flatMap(u => readrx('Apigee Pwd:').map(p => { return {user: u, pwd: p}; }))
};

module.exports = launch;
