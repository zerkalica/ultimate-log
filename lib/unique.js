function uniqueNode() {
	var hrTime = process.hrtime();

	return process.pid + '-' + (hrTime[0] * 1000000 + hrTime[1] / 1000);
}

function uniqueBrowser() {
	return Math.floor(Math.random() * 10000) + '-' + new Date().getTime();
}

module.exports = function unique() {
	var isNode = typeof(process) !== 'undefined' && !!process.pid;

	return isNode ? uniqueNode() : uniqueBrowser();
};
