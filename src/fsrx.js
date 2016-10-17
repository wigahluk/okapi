const fs = require('fs');
const rx = require('rxjs');

const readFile = rx.Observable.bindNodeCallback(fs.readFile);
const readDir = rx.Observable.bindNodeCallback(fs.readdir);
const unlink = rx.Observable.bindNodeCallback(fs.unlink);
const rmdir = rx.Observable.bindNodeCallback(fs.rmdir);

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

module.exports = {
    readFile: readFile,
    readDir: readDir,
    lstat: lstat,
    exists: exists,
    rmrf: deleteRecursive
};
