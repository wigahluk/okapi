const defServer = {
    port: 8989,
    ssoEndpoint: 'login.apigee.com'
};

const validate = s => {
    const conf = s ? JSON.parse(s) : {};
    conf.buildPath = conf.buildPath || './build';
    conf.sourcePath = conf.sourcePath || './src';
    conf.bundleType = conf.bundleType || 'apiproxy';
    conf.name = conf.name || 'apiproxy';
    conf.server = conf.server || defServer;
    conf.server.port = conf.server.port || defServer.port;
    conf.server.ssoEndpoint = conf.server.ssoEndpoint || defServer.ssoEndpoint;
    return conf;
};

module.exports = validate;