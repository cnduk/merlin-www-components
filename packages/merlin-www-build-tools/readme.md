# merlin-www-build-tools

> Build tools for the www app

---

## Install

```bash
npm i -S @cnbritain/merlin-www-build-tools
```

---

## Gulp tasks

### copy

Copies over the files to a static location.

### jshint

Runs jshint over all of the specified js files.

### sass

Compiles out the sass to css using our custom component importer.

### js

Chunks and tree shakes our js using webpack.

### serve

Runs browsersync and watches specified js, sass and html files.

### dev

Runs `copy`, `sass`, `jshint`, `js` and `serve`.

### staging

Runs `copy`, `sass`, `jshint` and `js`.

### production

Runs `copy`, `sass`, `jshint` and `js`.

---

## Config

```
{
        copy: {
            src: [
                /* List of source files to copy */
            ],
            dest: /* Location to copy all the source files to */
        },
        js: {
            src: {
                /* Key: nice name for script */
                /* Value: location of script file */
                'core': getAbsDir('frontend/js/pages/core.js'),
            },
            dest: /* Location to save all the static js files to */
        },
        jshint: {
            src: [
                /* List of all js files to jshint */
            ]
        },
        release: {
            changelog: /* Location of changelog file */,
            package: /* Location of package json file */
        },
        sass: {
            src: [
                /* List of all sass files that need compiling */
            ],
            dest: /* Location to save all compiled css files */
        },
        watch: {
            proxy: /* Proxy url */,
            html: [
                /* List of html files to watch */
            ],
            js: [
                /* List of js files to watch */
            ],
            sass: [
                /* List of sass files to watch */
            ]
        }
    }
```

### Default config

```
{
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
    }
```

---