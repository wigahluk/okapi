const cli = require('./cli');

describe('CLI', () => {
    it('Assert when array has a value', () => {
        expect(cli.has(['-p', 'something else'], '-p')).toBe(true);
    });

    it('Assert when array has a value regardless of casing', () => {
        expect(cli.has(['-p', 'something else'], '-P')).toBe(true);
        expect(cli.has(['-P', 'something else'], '-p')).toBe(true);
    });

    it('Assert fails when array doesn\'t has a value', () => {
        expect(cli.has(['-p', 'something else'], '-b')).toBe(false);
    })
});
