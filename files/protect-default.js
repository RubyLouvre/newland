var fileUtils = require ("../build/file-utils");
var File = fileUtils.File;
var SecurityManager = fileUtils.SecurityManager;

/**
 * Default:
 * - CWD: READ and WRITE allowed.
 * - Outside CWD: READ allowed.
 */
var defaultSM = new SecurityManager ();
File.protect (defaultSM);

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

//Outside CWD
var f3 = new File ("../LICENSE");
f3.size (function (error, size){
	console.log ("4: " + size); //Prints: 1093 (READ allowed)
});
f3.remove (function (error, removed){
	console.log ("5: " + removed); //Prints: false (WRITE denied)
	console.log ("6: " + error); //Prints: [Error: Security error, cannot write.]
});