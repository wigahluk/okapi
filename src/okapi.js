const fs = require('./fsrx');
const rx = require('rxjs');

function clean (srcPath) {
    console.log(`Cleaning ${srcPath}\n`);
    deleteFolderRecursive(srcPath);
    function deleteFolderRecursive (path) {
        if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file){
                var curPath = `${path}/${file}`;
                if(fs.lstatSync(curPath).isDirectory()) {
                    deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }
}

const clean = path => {
    fs.exists(path)
        .subscribe(
            p => clean(p),
            e => { if (e.code !== 'ENOENT') { throw e; } }
        );
    // fs.traverse(path).subscribe(
    //     n => console.log(n)
    // );
};

module.exports = {
    clean: clean
};