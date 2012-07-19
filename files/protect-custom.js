var fileUtils = require ("../build/file-utils");
var File = fileUtils.File;
var SecurityManager = fileUtils.SecurityManager;

/**
 * Customized.
 */
var customSM = new SecurityManager ();
customSM.deny ("a", SecurityManager.WRITE); //WRITE operations in "./a" are denied
customSM.allow ("..", SecurityManager.READ_WRITE); //READ and WRITE operations in ".." are allowed
File.protect (customSM);

//CWD
new File ("contains.js").size (function (error, size){
	console.log ("1: " + size); //Prints: 205 (READ allowed)
});
var f2 = new File ("temp");
f2.removeOnExit (function (error, removed){
	console.log ("2: " + removed); //Prints: true (WRITE allowed)
});
f2.createNewFile (function (error, created){
	console.log ("3: " + created); //Prints: true (WRITE allowed)
});

//CWD, "./a"
new File ("a").createDirectory (function (error, created){
	console.log ("4: " + created); //Prints: false (WRITE denied)
	console.log ("5: " + error); //Prints: [Error: Security error, cannot write.]
});

//Outside CWD, ".."
new File ("../LICENSE").size (function (error, size){
	console.log ("6: " + size); //Prints: 1073 (READ allowed)
});
var f3 = new File ("../temp");
f3.removeOnExit (function (error, removed){
	console.log ("7: " + removed); //Prints: true (WRITE allowed)
});
f3.createNewFile (function (error, created){
	console.log ("8: " + created); //Prints: true (WRITE allowed)
});