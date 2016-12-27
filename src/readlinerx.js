const rx = require('rxjs');
const readline = require('readline');
const Writable = require('stream').Writable;

const readQuestion = question => new rx.Observable(obs => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(question + ' ', (answer) => {
        rl.close();
        obs.next(answer);
        obs.complete();
    });
});

const readHidden = question => new rx.Observable(obs => {
    const mstdout = new Writable({
        write: function(chunk, encoding, callback) {
            if (!this.muted)
                process.stdout.write(chunk, encoding);
            callback();
        }
    });
    const rl = readline.createInterface({
        input: process.stdin,
        output: mstdout,
        terminal: true
    });
    mstdout.muted = false;
    rl.question(question + ' ', (answer) => {
        rl.close();
        obs.next(answer);
        obs.complete();
    });
    mstdout.muted = true;
});

module.exports = {
    readLine: readQuestion,
    readHidden: readHidden
};
