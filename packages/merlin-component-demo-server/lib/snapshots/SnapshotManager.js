
const path = require('path');
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

        mkdir(this._outputDir);
    }

    async takeSnapshot(url){
        const snap = new Snapshot(this._outputDir, url);
        await snap.snapshot();
        this.snapshots.push(snap);
    }

}

module.exports = new SnapshotManager();
