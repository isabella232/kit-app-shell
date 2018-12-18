const { run } = require('@kano/kit-app-shell-cordova');
const androidPlatform = require('./plugins');

module.exports = (opts) => {
    return run({
        ...opts,
        platforms: androidPlatform.platforms,
        plugins: androidPlatform.plugins,
        hooks: androidPlatform.hooks,
        cacheId: 'android-legacy',
    });
};
