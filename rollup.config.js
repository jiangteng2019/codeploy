const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const terser = require('@rollup/plugin-terser');

module.exports = {
    input: 'src/index.js',
    output: {
        format: 'cjs',
        file: 'bin/bundle.js',
    },
    plugins: [
        commonjs({
            ignoreDynamicRequires: true
        }),
        json(),
        terser(),
    ]
};