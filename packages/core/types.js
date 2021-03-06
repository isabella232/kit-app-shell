/* eslint max-len: 'off' */
/**
 * @typedef {Object} BuildConfig
 * @property {Array<String>} resources List of glob patterns of files to add to the generated packages
 * @property {Object} moduleContext Define the context of the provided modules. See: https://rollupjs.org/guide/en#context
 * @property {Array<String>} polyfills List of modules to be injected as polyfills
 * @property {Array<Object>} replaces List of replacements to apply to the sources. See: https://github.com/rollup/rollup-plugin-replace#options
 * @property {Array<Sring>} babelExclude List of paths that won't be processed by babel
 * @property {Object} targets Object specifying the browser targets. See: https://babeljs.io/docs/en/babel-preset-env#targets
 */

/**
 * @typedef {Object} TestConfig
 * @property {Array<String>} spec List of glob patterns for the test files of this project
 */

// Here we load the types from the platforms we know about. Fails gracefully if not installed.
// This smoothen the autocomplete experience

/**
 * @typedef { import('@kano/kit-app-shell-android/types').AndroidConfig } AndroidConfig
 * @typedef { import('@kano/kit-app-shell-android-legacy/types').AndroidLegacyConfig } AndroidLegacyConfig
 * @typedef { import('@kano/kit-app-shell-ios/types').IOSConfig } IOSConfig
 * @typedef { import('@kano/kit-app-shell-web/types').WebConfig } WebConfig
 * @typedef { import('@kano/kit-app-shell-windows').WindowsConfig } WindowsConfig
 * @typedef { import('@kano/kit-app-shell-windows-store').WindowsStoreConfig } WindowsStoreConfig
 * @typedef { import('@kano/kit-app-shell-macos').MacOSConfig } MacOSConfig
 * @typedef { import('@kano/kit-app-shell-kano').KanoConfig } KanoConfig
 */

/**
 * @typedef {Object} KashConfig
 * @property {AndroidConfig} android Android platform configuration
 * @property {AndroidLegacyConfig} 'android-legacy' Android legacy platform configuration
 * @property {IOSConfig} ios iOS platform configuration
 * @property {WindowsConfig} windows Windows platform configuration
 * @property {WindowsStoreConfig} 'windows-store' Windows Store platform configuration
 * @property {MacOSConfig} macos macOS platform configuration
 * @property {KanoConfig} kano KanoOS platform configuration
 * @property {WebConfig} web Web platform configuration
 * @property {BuildConfig} build Build options
 * @property {TestConfig} test Test options
 */

export {};
