const urlTool = require('url');
const queryTool = require('querystring');
const rx = require('rxjs');
const session = require('./jwtSession');
const http = require('../httprx');

const stateMessage = state => {
    if (state === 'empty' || state === 'expired') {
        return 'Server is running but not authenticated';
    }
    return 'Server is ready';
};

const startServer = (port, ssoEndpoint) => {
    // Keep the state in an object
    const state = session(http.secureRequest, ssoEndpoint);

    const server = http.createServer((req, res) => {
        // Terminate server on `/kill` path:
        const url = req.url;
        if (url.indexOf('/stop-server') === 0) {
            res.end(`Server at port: ${port} was terminated at ${new Date().toISOString()}`);
            server.close();
            return;
        }
        if (url.indexOf('/status') === 0) {
            res.end(stateMessage(state.status));
            return;
        }
        // Authenticate
        if (url.indexOf('/authenticate') === 0) {
            const query = queryTool.parse(urlTool.parse(url).query);
            state.authenticate(query.user, query.pwd, query.mfa)
                .subscribe(
                    data => {
                        res.end('You are now authenticated');
                    },
                    e => {
                        console.log('Error during authentication: ' + JSON.stringify(e));
                        res.end(`We got an error: ${e.error}\n`);
                    },
                    () => {
                        res.end('End\n');
                    }
                );
            return;
        }
        // Proxy calls
        if (url.indexOf('/organizations') === 0) {
            state.getToken().map();
            return;
        }

        res.end('Hello server');
    });
    server.listen(port);
};

module.exports = startServer;