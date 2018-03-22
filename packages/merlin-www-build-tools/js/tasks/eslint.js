'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');
/* eslint-disable no-unused-vars */
module.exports = function taskEsLintExport(taskConfig, browserSync){
/* eslint-enable no-unused-vars */
    return function taskEsLint(){
        return gulp.src(taskConfig.eslint.src)
            .pipe(eslint({
                env: {
                    browser: true,
                    commonjs: true,
                    es6: true
                },
                extends: 'eslint:recommended',
                parserOptions: {
                    sourceType: 'module'
                },
                rules: {
                    indent: [
                        'error',
                        4
                    ],
                    'linebreak-style': [
                        'error',
                        'unix'
                    ],
                    quotes: [
                        'error',
                        'single'
                    ],
                    semi: [
                        'error',
                        'always'
                    ],
                    'no-console': [
                        'error',
                        {
                            'allow': ['warn', 'error']
                        }
                    ]
                }
            }))
            .pipe(eslint.format('stylish'))
            .pipe(eslint.failAfterError());
    };
};
