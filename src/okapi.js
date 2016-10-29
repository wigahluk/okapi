const rx = require('rxjs');
const fsrx = require('./fsrx');
const JSZip = require("jszip");
const serverStatus = require('./server/status');
const serverStop = require('./server/stop');
const serverAuth = require('./server/authenticate');
const serverLauncher = require('./server/launcher');
const serverUpload = require('./server/upload');

const clean = path => fsrx.exists(path)
    .flatMap(p => fsrx.rmrf(p));

const enforceBuildPath = path => {
    const idx = path.lastIndexOf('/');
    if (idx < 0) { return rx.Observable.of(path)}
    return fsrx.mkdirR(path.substr(0,idx));
};

const saveZip = (zip, fileName) => new rx.Observable(obs => {
    zip
        .generateNodeStream({
            streamFiles: false,
            compression: 'DEFLATE'
        })
        .pipe(fsrx.createWriteStream(fileName))
        .on('error', error => {
            obs.error(error);
        })
        .on('finish', () => {
            obs.next(fileName);
            obs.complete();
        });
});

const upload = port => (source, type) => bundle(source, type)
    .map(zip => zip.generateNodeStream({ streamFiles: false, compression: 'DEFLATE' }))
    .flatMap(stream => serverUpload(port, 'okapi', 'EmptyProxy', stream));

const build = (source, dest, type) => bundle(source, type)
    .flatMap(zip => enforceBuildPath(dest).count().map(x => zip))
    .flatMap(zip => saveZip(zip, dest));

const bundle = (source, type) => fsrx.exists(source)
    .flatMap(p => fsrx.traverse(p))
    .map(p => { return { source: p, dest: type + p.substr(source.length) } })
    .flatMap(p => fsrx.readFile(p.source).map(bits => { return { dest: p.dest, content: bits }; }) )
    .reduce((acc, p) => { acc.file(p.dest, p.content); return acc; },  new JSZip());

const status = port => serverStatus(port);

const start = conf => enforceBuildPath('logs/').count().flatMap(x => serverLauncher(conf));

const stop = port => serverStop(port);

const authenticate = port => serverAuth(port);

module.exports = {
    clean: clean,
    bundle: bundle,
    build: build,
    status: status,
    start: start,
    stop: stop,
    upload: upload,
    authenticate: authenticate
};