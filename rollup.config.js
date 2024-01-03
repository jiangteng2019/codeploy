const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const terser = require('@rollup/plugin-terser');
const shebang = require('rollup-plugin-add-shebang');

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
        shebang({
            include: 'bin/bundle.js'
        })
        // terser(),
    ]
};