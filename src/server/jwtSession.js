const rx = require('rxjs');

const decode64 = s => Buffer.from(s, 'base64').toString();

const isJwtExpired = token => {
    if (!token) { return true; }
    const parts = token.split('.');
    if (parts !== 3) { return true; }
    const exp = Number(JSON.parse(decode64(parts[1])).exp) * 1000;
    return exp < (new Date().valueOf() - 1000);
};

const session = (httpRequest, endpoint) => {
    // As from Apigee public documentation:
    // http://docs.apigee.com/api-services/content/using-oauth2-security-apigee-edge-management-api
    const clientBearer = 'ZWRnZWNsaTplZGdlY2xpc2VjcmV0';

    const state = {};

    const status = () => {
        if (!state.token || !state.refreshToken) {
            return 'empty';
        }

        if (!isJwtExpired(state.token)) {
            return 'expired';
        }

        return 'ready';
    };

    const getToken = () => {
        if (!state.token || !state.refreshToken) {
            return rx.Observable.throw(new Error('Token is not available. Please authenticate.'));
        }

        if (!isJwtExpired(state.token)) {
            return rx.Observable.of(state.token);
        }

        return refreshToken(state.refreshToken)
            .map(data => JSON.parse(data))
            .flatMap(data => {
                // If there is an error, throw an error
                if (data.error) { return rx.Observable.throw(data); }
                // If there are no tokens, throw an error
                if (!data.access_token || !data.refresh_token) {
                    { return rx.Observable.throw({ error: 'Missing tokens in response'}); }
                }
                // Seems all went fine. Lets store the tokens
                state.token = data.access_token;
                state.refreshToken = data.refresh_token;
                return rx.Observable.of(state.token);
            });
    };

    const authenticate = (user, pwd, mfa) => {
        if (!user || !pwd) {
            return rx.Observable.throw(new Error('User and Password are needed to authenticate.'));
        }
        return requestToken({user: user, password: pwd, mfa: mfa})
            .map(data => JSON.parse(data))
            .flatMap(data => {
                // If there is an error, throw an error
                if (data.error) { return rx.Observable.throw(data); }
                // If there are no tokens, throw an error
                if (!data.access_token || !data.refresh_token) {
                    { return rx.Observable.throw({ error: 'Missing tokens in response'}); }
                }
                // Seems all went fine. Lets store the tokens
                state.token = data.access_token;
                state.refreshToken = data.refresh_token;
                return rx.Observable.of('authenticated');
            });
    };

    const refreshToken = token => rx.Observable.of(token)
        .flatMap(opts => {
            const data = `refresh_token=${token}&grant_type=refresh_token`;
            return httpRequest({
                hostname: endpoint,
                port: 443,
                path: '/oauth/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'Content-Length': Buffer.byteLength(data),
                    'Accept': 'application/json;charset=utf-8',
                    'Authorization': `Basic ${clientBearer}`
                }
            }, data);
        });

    const requestToken = options => rx.Observable.of(options)
        .flatMap(opts => {
            const user = opts.user.replace(/\+/g, '%2B');
            const pwd = opts.password.replace(/\%/g, '%25');
            const data = `username=${user}&password=${pwd}&grant_type=password`;
            return httpRequest({
                hostname: endpoint,
                port: 443,
                path: '/oauth/token' + (opts.mfa ? `?mfa_token=${opts.mfa}` : ''),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'Content-Length': Buffer.byteLength(data),
                    'Accept': 'application/json;charset=utf-8',
                    'Authorization': `Basic ${clientBearer}`
                }
            }, data);
        });

    return {
        getToken: getToken,
        authenticate: authenticate,
        status: status
    };
};

module.exports = session;
