#!/usr/bin/env node
const path = require('path');
const parser = require('yargs-parser');
const { ConfigLoader, log, processState } = require('@kano/kit-app-shell-common');
const { loadPlatform } = require('../lib/platform');
const spinner = require('../lib/spinner');
const output = require('../lib/output');

function parseCommon(y) {
    return y
        .positional('platform', {
            describe: 'Target platform',
        })
        .positional('app', {
            describe: 'Root of the app',
            default: './',
        })
        .option('env', {
            description: 'Target environment',
            alias: 'e',
            devault: 'development',
        })
        .coerce('app', path.resolve);
}

/**
 * Loads the config file from the app's directory
 * @param {String} app path to the app directory
 */
function loadRc(app) {
    const rcPath = path.join(app, 'kit-app-shell.conf.js');
    try {
        return require(rcPath);
    } catch(e) {
        return {};
    }
}

function agregateArgv(platform, argv, command) {
    const platformOpts = parser(process.argv.slice(2), platform.cli(command));
    // Remove the flat args
    delete platformOpts._;
    const config = ConfigLoader.load(argv.app, argv.env);
    // Load config file
    const rcOpts = loadRc(argv.app);
    // Options specific to the platform defined in the config file
    const rcPlatformOpts = rcOpts[argv.platform] || {};
    // Merge the command options
    const commandOpts = Object.assign({}, platformOpts, rcOpts[command] || {}, rcPlatformOpts[command] || {});
    argv.config = config;
    return {
        opts: argv,
        commandOpts,
    };
}

function end() {
    spinner.stop();
}

function runCommand(command, argv) {
    const platform = loadPlatform(argv.platform);
    const { opts, commandOpts } = agregateArgv(platform, argv, command);
    log.trace('OPTIONS', opts);
    log.trace('COMMAND OPTIONS', commandOpts);
    // About to start the big boy tasks. Let the process breathe and setup its CLI interface
    process.nextTick(() => {
        const result = platform[command](opts, commandOpts);
        if (result instanceof Promise) {
            result.catch(e => processState.setFailure(e))
                .then(() => end());
        } else {
            end();
        }
    });
}

const argv = require('yargs') // eslint-disable-line
    .command('run <platform> [app]', 'run the application', (yargs) => {
        parseCommon(yargs);
    }, (argv) => {
        runCommand('run', argv);
    })
    .command('build <platform> [app]', 'build the application', (yargs) => {
        parseCommon(yargs)
            .array('resources')
            .option('out', {
                alias: 'o',
                required: true,
            })
            .coerce('out', (v) => {
                return path.resolve(v);
            }); 
    }, (argv) => {
        runCommand('build', argv);
    })
    .option('quiet', {
        alias: 'q',
        default: false,
    })
    .option('verbose', {
        alias: 'v',
        default: false
    }).argv;

if (!argv.quiet) {
    if (process.stdout.isTTY) {
        spinner.setup(processState);
    } else {
        output.setup(processState);
    }
}
