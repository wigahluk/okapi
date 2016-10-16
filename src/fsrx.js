const fs = require('fs');
const rx = require('rxjs');

const readFile = rx.Observable.bindNodeCallback(fs.readFile);
const exists = path => rx.Observable.bindNodeCallback(fs.access)(path);

module.exports = {
    readFile: readFile,
    exists: exists

};
