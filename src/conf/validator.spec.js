const validator = require('./validator');

describe('Conf Vamlidator', () => {
    it('Created with undefined should default all values', () => {
        const c = validator();
        expect(c.buildPath).toBe('./build');
        expect(c.sourcePath).toBe('./src');
        expect(c.bundleType).toBe('apiproxy');
        expect(c.name).toBe('apiproxy');
        expect(c.server.port).toBe(8989);
        expect(c.server.ssoEndpoint).toBe('login.apigee.com');
        expect(c.server.apigeeEndpoint).toBe('api.enterprise.apigee.com');
        expect(c.server.basePath).toBe('/v1');
    })
});
