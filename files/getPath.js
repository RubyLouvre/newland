var File = require ("../build/file-utils").File;

//File executed from Node-FileUtils directory: node examples/getPath
console.log (new File ("../src/file-utils.js").getPath ()); //Prints: src/file-utils.js