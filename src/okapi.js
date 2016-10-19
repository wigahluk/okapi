const rx = require('rxjs');
const fsrx = require('./fsrx');
const JSZip = require("jszip");

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

const build = (source, dest, type) => fsrx.exists(source)
    .flatMap(p => fsrx.traverse(p))
    .map(p => {
        return { source: p, dest: type + p.substr(source.length) }
    })
    .flatMap(p =>
        fsrx.readFile(p.source).map(bits => { return { dest: p.dest, content: bits }; })
    )
    .reduce((acc, p) => { acc.file(p.dest, p.content); return acc; },  new JSZip())
    .flatMap(zip => enforceBuildPath(dest).count().map(x => zip))
    .flatMap(zip => saveZip(zip, dest));

module.exports = {
    clean: clean,
    build: build
};