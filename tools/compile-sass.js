
const path = require('path');
const sass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const csso = require('csso');
const sassImporter = require('@cnbritain/merlin-sass-custom-importer');
// sassImporter.LOGGER.enabled = true;

const CSS_PREFIXER = autoprefixer({
    browsers: [
        'last 2 versions',
        'ie >= 10'
    ]
});

main();

async function main(){

    let fileLocation = process.argv[process.argv.length - 1];
    fileLocation = path.resolve(fileLocation);

    let css = await compileSass({
        currentTheme: "vogue",
        name: "vogue"
    }, fileLocation);
    css = css.css.toString();

    css = await autoprefixCSS(css);

    css = await cssoCSS(css);

    console.log(css);

}

function compileSass(merlinJSON, sassFileLocation){
    return new Promise((resolve, reject) => {
        const sassConfig = {
            file: sassFileLocation,
            importer: sassImporter(merlinJSON, merlinJSON.name)
        };
        sass.render(sassConfig, (err, result) => {
            if(err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function autoprefixCSS(cssString){
    return new Promise((resolve, reject) => {
        postcss([CSS_PREFIXER])
            .process(cssString)
            .then(function (result) {
                const warnings = result.warnings();
                if(warnings.length > 0){
                    reject(warnings);
                } else {
                    resolve(result.css);
                }
            });
    });
}

function cssoCSS(cssString){
    return new Promise((resolve, reject) => {
        const result = csso.minify(cssString, {
            restructure: true,
            debug: false
        });
        resolve(result.css);
    });
}
