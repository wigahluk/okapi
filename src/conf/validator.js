const defServer = {
    port: 8989
};

const validate = s => {
    const conf = s ? JSON.parse(s) : {};
    conf.buildPath = conf.buildPath || './build';
    conf.sourcePath = conf.sourcePath || './src';
    conf.bundleType = conf.bundleType || 'apiproxy';
    conf.name = conf.name || 'apiproxy';
    conf.server = conf.server || defServer;
    conf.server.port = conf.server.port || defServer.port;
    return conf;
};

module.exports = validate;