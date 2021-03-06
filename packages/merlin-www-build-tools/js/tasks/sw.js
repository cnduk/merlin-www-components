'use strict';

const wbBuild = require('workbox-build');

/* eslint-disable no-unused-vars */
module.exports = function taskCopyExports(taskConfig, browserSync) {
/* eslint-enable no-unused-vars */
    const abbr = taskConfig.package.cnOptions.brandConfig;

    return function taskSw() {
        return wbBuild.generateSW({
            globDirectory: `./${abbr}_backend/`,
            swDest: `./${abbr}_backend/static/sw.js`,
            globPatterns: taskConfig.sw.globPatterns,
            modifyUrlPrefix: taskConfig.sw.modifyUrlPrefix,
        });
    };
};