const validator = require('./validator');

describe('Conf Vamlidator', () => {
    it('Created with undefined should default all values', () => {
        const c = validator();
        expect(c.buildPath).toBe('./build');
        expect(c.sourcePath).toBe('./src');
        expect(c.bundleType).toBe('apiproxy');
        expect(c.name).toBe('apiproxy');
        expect(c.server.port).toBe(8989);
    })
});
