const morral = require('morral').logger('Okapi');

const has = (args, value) => {
    const v = args.filter(s => s.toLowerCase() === value.toLowerCase());
    return v.length > 0
};

const getValue = (args, value) => {
    const rx = new RegExp('^' + value + '(?:=|\\:)?(.*)$', 'i');
    const vs = args.filter(s => rx.test(s));

    if (vs.length === 0) return;
    const v = vs[0];
    if (v === value) return args[args.indexOf(v) + 1];
    const m = rx.exec(v)[1];
    if (m === '') return args[args.indexOf(v) + 1];
    return m;
};

module.exports = {
    has: has,
    get: getValue,
    log: morral.log
};