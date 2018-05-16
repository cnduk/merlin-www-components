
const path = require('path');
const {mkdir} = require('../utils');
const Snapshot = require('./Snapshot');

class SnapshotManager {

    constructor(){
        this.outputDir = '';
        this.snapshots = [];
    }

    async takeSnapshot(url){
        await mkdir(path.join(this.outputDir, '.snapshots'));

        const snap = new Snapshot(this.outputDir, url);
        await snap.snapshot();
        this.snapshots.push(snap);
    }

}

module.exports = new SnapshotManager();
