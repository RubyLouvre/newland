// origin author :fengyin <fengyin.zym@taobao.com>
// modified by : sumory <sumory.wu@gmail.com>

var fs = require('fs');
var dateFormat = require('./date_format.js');
var config = require('../config.js').config;

var FILE_SPLIT_INTERVAL = 'DAY';// 1d
var BUFFER_CHECK_INTERVAL = 2000;// 2s
var BUFFER_FLUSH_LEN = 512;
var LOG_DIRECTORY = config.logDirectory;

var fileMap = {
	'info' : {
		pathPrefix : 'info.log.'
	},
	'error' : {
		pathPrefix : 'error.log.'
	},
	'exception' : {
		pathPrefix : 'exception.log.'
	}
};

// initial setting
var curDay = (new Date()).getDate();

function genFilePostfix() {
	var dnow = new Date();
	return dnow.format('yyyy-mm-dd');
}

function genTimeStamp() {
	var dnow = new Date();
	return dnow.format('HH:MM:ss');
}

function debug(str) {
	console.log(str);
}

function inspect(obj) {
	console.log(require('util').inspect(obj, false, 10));
}

function LogFile(options) {
	this.pathPrefix = options.pathPrefix;

	this.buffers = [];
	this.bufferCheckInterval = options.bufferCheckInterval
			|| BUFFER_CHECK_INTERVAL;

	this.init();
}

LogFile.prototype.push = function(str) {
	this.buffers.push(str);
	if (this.buffers.length >= BUFFER_FLUSH_LEN) {
		this._flush();
	}
};

LogFile.prototype._flush = function() {
	if (this.buffers.length > 0 && this.stream) {
		this.buffers.push('');
		var str = this.buffers.join('\n');
		this.stream.write(str);
		// debug('buffers length: ' + this.buffers.length);
		this.buffers = [];
	}
};

LogFile.prototype.destroy = function() {
	this._flush();

	if (this.bufferCheckTimer) {
		clearInterval(this.bufferCheckTimer);
		this.bufferCheckTimer = null;
	}
	if (this.stream) {
		this.stream.end();
		this.stream.destroySoon();
		this.stream = null;
	}
};

LogFile.prototype.init = function() {
	// debug('log init ' + this.pathPrefix);
	var self = this;
	var path = LOG_DIRECTORY + this.pathPrefix + genFilePostfix();
	// debug(path);
	// inspect(conf);
	this.stream = fs.createWriteStream(path, {
		flags : 'a'
	});

	this.bufferCheckTimer = setInterval(function() {
		self._flush();
	}, this.bufferCheckInterval);
};

LogFile.prototype.restart = function() {
	this.destroy();
	this.init();
};

var logMap = {};

// exports.init = function(){
for ( var id in fileMap) {
	logMap[id] = new LogFile(fileMap[id]);
}
// }

function push2File(str, id) {
	var logFile = logMap[id];

	var dnow = new Date();
	if (dnow.getDate() != curDay) {
		// if(dnow.getMinutes() != curMinute){
		logFile.restart();
		curDay = dnow.getDate();
		// curMinute = dnow.getMinutes();
	}
	logFile.push(dnow.format('HH:MM:ss') + '\t' + str);
}

exports.info = function(str) {
	push2File(str, 'info');
};

exports.error = function(str) {
	push2File(str, 'error');
};

exports.exception = function(str) {
	push2File(str, 'exception');
};