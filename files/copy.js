var File = require ("../build/file-utils").File;

var f = new File ("../src");
f.copy ("../src.backup", function (error, copied){
	console.log (copied); //Prints: true
	
	f.copy ("../src.backup", function (error, copied){
		console.log (copied); //Prints: false (destination already exists)
	});
});