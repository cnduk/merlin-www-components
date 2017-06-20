'use strict';

const path = require('path');
const getArgs = require('get-args');

function getAbsDir(filename, absRoot=process.cwd()){
    return path.join(absRoot, filename);
}

let ENV = null;
function getEnvironment(){
    if(ENV !== null) return ENV;

    const args = getArgs();
    let label = null;
    if(args.options.dev){
        label = 'DEV';
    } else if(args.options.staging){
        label = 'STAGING';
    } else if(args.options.production){
        label = 'PROD';
    } else {
        console.warn('No environment sent. Defaulting to production.');
        label = 'PROD';
    }
    ENV = {
        name: label,
        isProd: label === 'PROD',
        isStaging: label === 'STAGING',
        isDev: label === 'DEV'
    };
    return ENV;
}

function getDefaultConfig(pkgJson, merlinJson){
    const abbr = pkgJson.cnOptions.brandConfig;
    return {
        copy: {
            src: [
                getAbsDir(`node_modules/@cnbritain/merlin-www-assets/static/${abbr}/**/*`)
            ],
            dest: getAbsDir(`${abbr}_backend/static/`)
        },
        js: {
            src: {
                'core': getAbsDir('frontend/js/pages/core.js'),
                'homepage': getAbsDir('frontend/js/pages/homepage.js'),
                'tagpage': getAbsDir('frontend/js/pages/tagpage.js'),
                'article': getAbsDir('frontend/js/pages/article.js'),
                'search': getAbsDir('frontend/js/pages/search.js'),
                'magazine': getAbsDir('frontend/js/pages/magazine.js'),
                'shows': getAbsDir('frontend/js/pages/shows.js'),
                'subscribe': getAbsDir('frontend/js/pages/subscribe.js'),
                'video': getAbsDir('frontend/js/pages/video.js')
            },
            dest: getAbsDir(`${abbr}_backend/static/js/`)
        },
        jshint: {
            src: [
                getAbsDir('frontend/js/**/*.js')
            ]
        },
        sass: {
            src: [
                getAbsDir('frontend/sass/page.scss')
            ],
            dest: getAbsDir(`${abbr}_backend/static/css/`)
        },
        watch: {
            proxy: 'localhost:9001',
            html: [
                getAbsDir('**/*.html'),
                getAbsDir('**/*.mustache')
            ],
            js: [
                getAbsDir('frontend/js/*.js'),
                getAbsDir('node_modules/@cnbritain/**/*.js')
            ],
            sass: [
                getAbsDir('frontend/sass/*.scss'),
                getAbsDir('node_modules/@cnbritain/**/*.scss')
            ]
        }
    };
}

module.exports = {
    getAbsDir,
    getDefaultConfig,
    getEnvironment
};
