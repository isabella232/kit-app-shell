const cli = require('@kano/kit-app-shell-cordova/lib/cli');

module.exports = Object.assign({}, cli, {
    test(yargs) {
        yargs.option('browserstack', {
            type: 'boolean',
            default: false,
            describe: 'Run the tests on browserstack',
        });
    }
});