const { ConfigLoader, Bundler, processState } = require('@kano/kit-app-shell-core');
const { project } = require('@kano/kit-app-shell-cordova');
const { promisify } = require('util');
// TODO: Review the choice of locatunnel against ngrok
const localtunnel = promisify(require('localtunnel'));
const connect = require('connect');
const path = require('path');
const serveStatic = require('serve-static');
const cors = require('cors');
const androidPlatform = require('./plugins');
const { cordova } = require('cordova-lib');
const { getIPAddress } = require('./ip');
const livereload = require('livereload');

const namedResolutionMiddleware = require('@kano/es6-server/named-resolution-middleware');

function serve(app) {
    return connect()
        .use(cors())
        .use((req, res, next) => {
            if (req.method === 'GET') {
                if (req.url === '/_config') {
                    const config = ConfigLoader.load(app);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    config.APP_SRC = './www/index.js';
                    return res.end(JSON.stringify(config));
                }
            }
            next();
        })
        .use(namedResolutionMiddleware({ root: app }))
        .use(serveStatic(app));
}

function setupTunnel(app) {
    const server = serve(app).listen(0);
    const { port } = server.address();
    // TODO: Move this to core. It can be re-used to live-reload any platform or project
    const lrServer = livereload.createServer();
    return localtunnel(port)
        .then((tunnel) => {
            lrServer.watch(app);
            return {
                tunnel,
                stop() {
                    tunnel.close();
                    server.close();
                },
            };
        });
}

module.exports = (opts, commandOpts) => {
    // TODO: Move this to kit-app-shell-cordova.
    // It can then be shared and customised across all cordova based platforms
    return Promise.all([
        setupTunnel(opts.app),
        project.getProject({
            ...opts,
            cacheId: 'android',
            platforms: androidPlatform.platforms,
            plugins: androidPlatform.plugins,
            hooks: androidPlatform.hooks,
            skipCache: !commandOpts.cache,
        }),
    ])
        .then(([server, projectPath]) => {
            const wwwPath = path.join(projectPath, 'www');
            // Bundle the cordova shell and provided app into the www directory
            return Bundler.bundle(
                require.resolve('@kano/kit-app-shell-cordova/www/index.html'),
                require.resolve('@kano/kit-app-shell-cordova/www/index.js'),
                path.join(__dirname, '../www/run.js'),
                opts.config,
                {
                    appJs: {
                        replaces: {
                            TUNNEL_URL: `'${server.tunnel.url}'`,
                            LR_URL: `'http://${getIPAddress()}:35729'`,
                        },
                    },
                    js: {
                        replaces: {
                            // Avoid jsZip to detect the define from requirejs
                            // TODO: Move to kit-app-shell-cordova it is valid for all cordova platforms
                            'typeof define': 'undefined',
                        },
                    },
                })
                .then(bundle => Bundler.write(bundle, wwwPath))
                .then(() => processState.setStep('Starting dev app on device'))
                .then(() => cordova.run({ platforms: ['android'] }))
                .then(() => processState.setSuccess('Dev app started'))
                .then(() => projectPath)
                .catch((e) => {
                    server.stop();
                    throw e;
                });
        });
};
