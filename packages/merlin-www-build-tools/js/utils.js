'use strict';

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

function getAbsDir(filename, absRoot=process.cwd()){
    return path.join(absRoot, filename);
}

let ENV = null;
function getEnvironment(){
    if(ENV !== null) return ENV;

    const args = minimist(process.argv.slice(2));
    let label = null;
    switch((args.env || '').toUpperCase()){
        case 'DEV':
            label = 'DEV';
            break;
        case 'STAGING':
            label = 'STAGING';
            break;
        case 'PROD':
            label = 'PROD';
            break;
        default:
            console.warn('No environment sent. Defaulting to production.');
            label = 'PROD';
            break;
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
                getAbsDir(`node_modules/@cnbritain/merlin-www-assets/static/wireframe/**/*`),
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
        release: {
            changelog: getAbsDir('./CHANGELOG.md'),
            package: getAbsDir('./package.json')
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
                getAbsDir(`${abbr}_backend/templates/**/*.html`),
                getAbsDir(`${abbr}_backend/templates/**/*.mustache`),
                getAbsDir('node_modules/@cnbritain/*/templates/**/*.html'),
                getAbsDir('node_modules/@cnbritain/*/templates/**/*.mustache'),
                getAbsDir('node_modules/@cnbritain/*/partials/**/*.html'),
                getAbsDir('node_modules/@cnbritain/*/partials/**/*.mustache')
            ],
            js: [
                getAbsDir('frontend/js/**/*.js'),
                getAbsDir('node_modules/@cnbritain/*/js/*.js')
            ],
            sass: [
                getAbsDir('frontend/sass/**/*.scss'),
                getAbsDir('node_modules/@cnbritain/*/sass/**/*.scss')
            ]
        },
        sw: {
            globPatterns: [
                'static\/**\/*.{ttf,otf,woff,woff2,eot}',
                'static\/**\/*.css',
                'static\/**\/*.js',
                'static\/**\/*.{jpg,jpeg,png,gif}'
            ]
        }
    };
}

function getPackageJsonVersion(packageLocation) {
    return JSON.parse(fs.readFileSync(packageLocation, 'utf8')).version;
}

function createFileNotExist(filename, done){
    fs.stat(filename, (err, stats) => {
        if(err){
            if(err.code !== "ENOENT"){
                console.error(err);
                return done(err);
            }
        }
        if(stats && stats.isFile()) return done();
        fs.writeFile(filename, '', done);
    });
}

module.exports = {
    createFileNotExist,
    getAbsDir,
    getDefaultConfig,
    getEnvironment,
    getPackageJsonVersion
};
