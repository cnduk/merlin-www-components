
const path = require('path');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const {mkdir} = require('../utils');

const DEVICE_SIZES = [
    {
        name: 'iphone',
        device: devices['iPhone 6 Plus']
    },
    {
        name: 'ipad',
        device: devices['iPad']
    },
    {
        name: 'desktop',
        device: {
            name: 'Desktop',
            userAgent: 'Real Desktop v2',
            viewport: {
                width:  1200,
                height: 800,
                deviceScaleFactor: 2,
                isMobile: false,
                hasTouch: false,
                isLandscape: false
            }
        }
    }
];

class SnapshotManager {

    constructor(){
        this.outputDir = '';
        this.snapshots = [];
    }

    _resolveFilename(filename){
        return path.join(
            this.outputDir,
            '.snapshots',
            filename
        );
    }

    async takeSnapshot(url){
        await mkdir(path.join(this.outputDir, '.snapshots'));

        const browser = await puppeteer.launch();

        for(let i = 0, len = DEVICE_SIZES.length; i < len; i++){
            const item = DEVICE_SIZES[i];
            try {
                await snapshot(
                    browser,
                    url,
                    item.device,
                    this._resolveFilename(`snapshot-${Date.now()}-${item.name}.png`)
                );
            } catch(err){
                console.error(`Error snapshotting ${item.name}`);
                console.error(err);
            }
        }

        await browser.close();
    }

}

function snapshot(browser, url, device, filename){
    return new Promise(async (resolve, reject) => {

        console.log(`Snapshotting: ${device.name}`);
        try {

            const page = await browser.newPage();

            page.once('load', async () => {
                await page.waitFor(2000);
                await page.screenshot({
                    path: filename,
                    fullPage: true
                });
                resolve();
            });

            await page.emulate(device);
            await page.goto(url);

        } catch(err){
            reject(err);
        }

    });
}

module.exports = new SnapshotManager();
