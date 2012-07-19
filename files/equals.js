var File = require ("../build/file-utils").File;

console.log (new File ("../build/../examples/equals.js").equals ("equals.js")); //Prints: true