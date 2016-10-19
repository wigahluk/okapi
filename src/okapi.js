const fsrx = require('./fsrx');
const JSZip = require("jszip");

const clean = path => {
    fsrx.exists(path)
        .flatMap(p => fsrx.rmrf(p))
        .subscribe(
            undefined,
            e => { if (e.code !== 'ENOENT') { throw e; } },
            () => { console.log('Deletion completed'); }
        );
};

const enforceBuildPath = path => {
    const idx = path.lastIndexOf('/');
    if (idx < 0) { return rx.Observable.of(path)}
    return fsrx.mkdirR(path.substr(0,idx));
};

const build = (source, dest, type) => {
    const zip = new JSZip();

    fsrx.exists(source)
        .flatMap(p => fsrx.traverse(p))
        .map(p => {
            return { source: p, dest: type + p.substr(source.length) }
        })
        .flatMap(p =>
            fsrx.readFile(p.source).map(bits => { return { dest: p.dest, content: bits }; })
        )
        .reduce((acc, p) => { zip.file(p.dest, p.content); return zip; }, zip)
        .flatMap(zip => enforceBuildPath(dest).count().map(x => zip))
        .subscribe(
            zip => {
                zip
                    .generateNodeStream({
                        streamFiles: false,
                        compression: 'DEFLATE'
                    })
                    .pipe(fsrx.createWriteStream(`${dest}`))
                    .on('finish', function () {
                        console.log('Bundle completed.\n');
                    });
            },
            e => { if (e.code !== 'ENOENT') { throw e; } }
        );
};

module.exports = {
    clean: clean,
    build: build
};