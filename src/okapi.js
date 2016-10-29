/*
 Copyright 2016 Oscar Ponce Bañuelos

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const rx = require('rxjs');
const fsrx = require('./fsrx');
const JSZip = require("jszip");
const serverStatus = require('./server/status');
const serverStop = require('./server/stop');
const serverAuth = require('./server/authenticate');
const serverLauncher = require('./server/launcher');
const serverUpload = require('./server/upload');
const serveDeploy = require('./server/deploy');

const clean = path => fsrx.exists(path)
    .flatMap(p => fsrx.rmrf(p));

const enforceBuildPath = path => {
    const idx = path.lastIndexOf('/');
    if (idx < 0) { return rx.Observable.of(path)}
    return fsrx.mkdirR(path.substr(0,idx));
};

const saveZip = (zip, fileName) => new rx.Observable(obs => {
    zip
        .generateNodeStream({
            streamFiles: false,
            compression: 'DEFLATE'
        })
        .pipe(fsrx.createWriteStream(fileName))
        .on('error', error => {
            obs.error(error);
        })
        .on('finish', () => {
            obs.next(fileName);
            obs.complete();
        });
});

const upload = port => (source, type, org, name) => bundle(source, type)
    .map(zip => zip.generateNodeStream({ streamFiles: false, compression: 'DEFLATE' }))
    .flatMap(stream => serverUpload(port, org, name, stream));

const build = (source, dest, type) => bundle(source, type)
    .flatMap(zip => enforceBuildPath(dest).count().map(x => zip))
    .flatMap(zip => saveZip(zip, dest));

const bundle = (source, type) => fsrx.exists(source)
    .flatMap(p => fsrx.traverse(p))
    .map(p => { return { source: p, dest: type + p.substr(source.length) } })
    .flatMap(p => fsrx.readFile(p.source).map(bits => { return { dest: p.dest, content: bits }; }) )
    .reduce((acc, p) => { acc.file(p.dest, p.content); return acc; },  new JSZip());

const status = port => serverStatus(port);

const start = conf => enforceBuildPath('logs/').count().flatMap(x => serverLauncher(conf));

const stop = port => serverStop(port);

const deploy = port => (type, org, env, name, revision) => serveDeploy(port, org, name, env, revision);

const authenticate = port => serverAuth(port);

module.exports = {
    clean: clean,
    bundle: bundle,
    build: build,
    status: status,
    start: start,
    stop: stop,
    upload: upload,
    deploy: deploy,
    authenticate: authenticate
};