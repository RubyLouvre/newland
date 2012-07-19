var File = require ("../build/file-utils").File;

var settings = {
	prefix: "foo",
	suffix: "bar",
	directory: "."
};

var file = File.createTempFile (settings, function (error, file){
	console.log (file.toString ()); //Prints: foo<random number>bar
});