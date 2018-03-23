
const path = require('path');
const sass = require('node-sass');
const sassImporter = require('@cnbritain/merlin-sass-custom-importer');
// sassImporter.LOGGER.enabled = true;


main();

async function main(){

    let fileLocation = process.argv[process.argv.length - 1];
    fileLocation = path.resolve(fileLocation);

    let css = await compileSass({
        currentTheme: "vogue",
        name: "vogue"
    }, fileLocation);

    console.log(css.css.toString());

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
