const rx = require('rxjs');
const path = require('path');
const fs = require('../fsrx');
const cli = require('../cli');
const validate = require('./validator');

const pwd = process.cwd();

const reader = args => rx.Observable
    .of('./okapi.json')
    .map(p => {
        if (cli.has(args, '--conf')) {
            return cli.get(args, '--conf');
        }
        return p;
    })
    .map(p => path.resolve(pwd, p))
    .flatMap(p => fs.readFile(p, 'utf8'))
    .map(s => {
        const conf = validate(s);
        return conf;
    });

module.exports = reader;
