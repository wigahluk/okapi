const path = require('path');
const cli = require('../cli');
const server = require('./server');
const args = process.argv;
const pwd = process.cwd();

if (cli.has(args, '-p')) {
    const port = cli.get(args, '-p');
    const ssoEndpoint = cli.get(args, '--sso');
    const apigeeEndpoint = cli.get(args, '--api');
    const basePath = cli.get(args, '--path');
    if (!port || !ssoEndpoint || !apigeeEndpoint || !basePath) {
        console.log('-p <port> --ssp <SSO Endpoint> --api <Apigee Endpoint> --path <Apigee Basepath>');
    } else {
        server(port, ssoEndpoint, apigeeEndpoint, basePath);
    }

} else {
    console.log('Okapi server cannot run without a port setting.');
}
