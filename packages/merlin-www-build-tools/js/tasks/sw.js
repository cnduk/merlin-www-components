'use strict';

const wbBuild = require('workbox-build');

module.exports = function taskCopyExports(taskConfig, browserSync) {
	const abbr = taskConfig.package.cnOptions.brandConfig;

	return function taskSw() {
		return wbBuild.generateSW({
	        globDirectory: `./${abbr}_backend/`,
	        swDest: `./${abbr}_backend/static/sw.js`,
	        globPatterns: taskConfig.globPatterns,
	        modifyUrlPrefix: taskConfig.modifyUrlPrefix
	    })
	}
}
