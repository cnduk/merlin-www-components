
const fs = require('fs');
const path = require('path');
const {PNG} = require('pngjs');
const pixelmatch = require('pixelmatch');
const {mkdir} = require('../utils');
const Snapshot = require('./Snapshot');

class SnapshotManager {

    constructor(){
        this._outputDir = path.join(
            __dirname,
            '..',
            '..',
            'static',
            'snapshots'
        );
        this.snapshots = [];
        this.compares = new Map();

        mkdir(this._outputDir);
    }

    async takeSnapshot(url){
        const snap = new Snapshot(this._outputDir, url);
        await snap.snapshot();
        this.snapshots.push(snap);
    }

    _getFilename(filename){
        return path.join(this._outputDir, filename);
    }

    async compareSnapshots(a, b){
        const snap1 = this.snapshots[a];
        const snap2 = this.snapshots[b];

        if(!this.compares.has(`${a.name}-${b.name}`)){
            const c = new Map();

            const deviceNames = Array.from(snap1.images.keys());
            for(let i=0, len=deviceNames.length; i<len; i++){
                const name = deviceNames[i];

                const image1 = await loadPNG(
                    this._getFilename(snap1.images.get(name)));
                const image2 = await loadPNG(
                    this._getFilename(snap2.images.get(name)));

                const w = Math.max(image1.width, image2.width);
                const h = Math.max(image1.height, image2.height);

                const diff = new PNG({width: w, height: h});
                pixelmatch(
                    image1.data,
                    image2.data,
                    diff.data,
                    w,
                    h,
                    {
                        threshold: 0.1
                    }
                );
                const diffFilename =`compare-${a.name}-${b.name}-${name}.png`;
                diff.pack().pipe(
                    fs.createWriteStream(this._getFilename(diffFilename)));

                c.set(name, diffFilename);

            }

            this.compares.set(`${a.name}-${b.name}`, c);
        }

        return this.compares.get(`${a.name}-${b.name}`);

    }

}

module.exports = new SnapshotManager();

function loadPNG(filename){
    return new Promise((resolve, reject) => {
        console.log(`Loading PNG: ${filename}`);
        const img = fs.createReadStream(filename)
            .pipe(new PNG())
            .on('parsed', () => {
                resolve(img);
            });
    });
}
