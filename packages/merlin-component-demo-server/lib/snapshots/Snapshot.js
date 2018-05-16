
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

class Snapshot {

    constructor(outputDir, url){
        this._outputDir = outputDir;
        this._url = url;
        this.images = new Map();
    }

    async snapshot(){
        this.images.clear();

        const browser = await puppeteer.launch();
        const now = Date.now();

        for(let i = 0, len = DEVICE_SIZES.length; i < len; i++){
            const item = DEVICE_SIZES[i];
            const filename = path.join(
                this._outputDir,
                `snapshot-${now}-${item.name}.png`
            );
            try {
                await snapshot(browser, this._url, item.device, filename);
                this.images.set(item.name, `snapshot-${now}-${item.name}.png`);
            } catch(err){
                console.error(`Error snapshotting ${item.name}`);
                console.error(err);
            }
        }

        await browser.close();
    }

    compare(snapshot){}

}

module.exports = Snapshot;

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