const path = require('path');
const cli = require('../cli');
const server = require('./server');
const args = process.argv;
const pwd = process.cwd();

if (cli.has(args, '-p')) {
    const port = cli.get(args, '-p');
    server(port);
} else {
    console.log('Okapi server cannot run without a port setting.');
}
