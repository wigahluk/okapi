const fs = require('fs');
const rx = require('rxjs');

const readFile = rx.Observable.bindNodeCallback(fs.readFile);
const readDir = rx.Observable.bindNodeCallback(fs.readdir);
const unlink = rx.Observable.bindNodeCallback(fs.unlink);
const rmdir = rx.Observable.bindNodeCallback(fs.rmdir);
const mkdir = rx.Observable.bindNodeCallback(fs.mkdir);

const lstat = path => rx.Observable.bindNodeCallback(fs.lstat)(path).map(s => { return { path: path, stats: s }; } );

const exists = path => rx.Observable.bindNodeCallback(fs.access)(path).map(x => path);

const traverse = path => readDir(path)
    .flatMap(ar => rx.Observable.from(ar))
    .map(p => `${path}/${p}`)
    .flatMap(p => lstat(p))
    .flatMap(s => {
        if (s.stats.isDirectory()) {
            return traverse(s.path);
        }
        return rx.Observable.of(s.path);
    });

const deleteRecursive = path => readDir(path)
    .flatMap(ar => rx.Observable.from(ar))
    .map(p => `${path}/${p}`)
    .flatMap(p => lstat(p))
    .flatMap(s => {
        if (s.stats.isDirectory()) {
            return deleteRecursive(s.path).count().flatMap(n => rmdir(s.path));
        }
        return unlink(s.path);
    });

const mkdirR = path => rx.Observable
    .of(path)
    .flatMap( p => {
        if (!p) { throw new Error('Cannot create directory with empty name'); }
        const a = p.split('/').filter(s => s.length > 0);
        if (a.length === 0) { throw new Error('Cannot create directory with empty name'); }
        return rx.Observable.from(a);
    })
    .scan((acc, v) => `${acc}/${v}`)
    .flatMap(p =>
        exists(p)
            .map(p => { return {path: p, exists: true} })
            .catch(e => rx.Observable.of({ path: p, exists: false })))
    .flatMap(b => b.exists ? rx.Observable.of(b.path) : mkdir(b.path).map(x => b.path));

module.exports = {
    readFile: readFile,
    readDir: readDir,
    lstat: lstat,
    exists: exists,
    rmrf: deleteRecursive,
    traverse: traverse,
    createWriteStream: fs.createWriteStream,
    mkdirR: mkdirR
};
