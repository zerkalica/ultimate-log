function uniqueNode() {
	var hrTime = process.hrtime();

	return process.pid + '-' + (hrTime[0] * 1000000 + hrTime[1] / 1000);
}

function uniqueBrowser() {
	return Math.floor(Math.random() * 10000) + '-' + new Date().getTime();
}

var isNode = typeof(process) !== 'undefined' && !!process.pid;

module.exports = isNode ? uniqueNode : uniqueBrowser;
