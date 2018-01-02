'use strict';

const path = require('path');

const glob = require('glob');
const sass = require('node-sass');
const sassImporter = require('@cnbritain/merlin-sass-custom-importer');

// sassImporter.LOGGER.enabled = true;
main();






async function main(){
    const location = path.resolve(__dirname, '..', 'packages', '*', 'merlin.json');
    const merlinLocations = await getFiles(location);

    let merlins = readJSONs(merlinLocations);
    merlins = filterMap(merlins, hasThemes);
    let merlinSass = getSassLocations(merlins);

    merlinSass.forEach(async (mapValue, mapKey) => {
        const merlinJSON = merlins.get(mapKey);
        mapValue.forEach(async (sassFileLocation) => {
            try {
                console.log(`${sassFileLocation} starting...`);
                const result = await compileSass(merlinJSON, sassFileLocation);
                console.log(`${sassFileLocation} success!`);
            } catch (err){
                console.log('Shit');
                console.log(mapKey);
                console.log(err);
                process.exit(1);
            }
        });
    });
}

















function getFiles(location){
    return new Promise((resolve, reject) => {
        glob(location, (err, matches) => {
            if(err){
                reject(err);
            } else {
                resolve(matches);
            }
        });
    });
}

function readJSONs(files){
    const jsons = new Map();
    files.forEach((file) => {
        jsons.set(file, require(file));
    });
    return jsons;
}

function filterMap(map, filter){
    const newMap = new Map();
    map.forEach((value, key, map) => {
        if(filter(value, key, map)){
            newMap.set(key, value);
        }
    });
    return newMap;
}

function hasThemes(value, key, map){
    return value.hasOwnProperty('themes');
}

function getSassLocations(merlinMap){
    const sassMap = new Map();
    merlinMap.forEach((mapValue, mapKey) => {
        const dir = path.dirname(mapKey);
        const themes = [];
        for(const [_, value] of Object.entries(mapValue.themes)){
            themes.push(path.resolve(dir, value));
        }
        sassMap.set(mapKey, themes);
    });
    return sassMap;
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
