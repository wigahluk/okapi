const http = require('http');

const startServer = port => {

    const server = http.createServer((req, res) => {
        // Terminate server on `/kill` path:
        const url = req.url;
        if (url.indexOf('/kill') === 0) {
            res.end(`Server at port: ${port} was terminated at ${new Date().toISOString()}`);
            server.close();
        }
        res.end('Hello server');
    });
    // server.on('clientError', (err, socket) => {
    //     socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    // });
    server.listen(port);
};

module.exports = startServer;