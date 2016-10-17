const fs = require('./fsrx');

const clean = path => {
    fs.exists(path)
        .flatMap(p => fs.rmrf(p))
        .subscribe(
            p => { console.log('Deletion completed'); },
            e => { if (e.code !== 'ENOENT') { throw e; } }
        );
};

module.exports = {
    clean: clean
};